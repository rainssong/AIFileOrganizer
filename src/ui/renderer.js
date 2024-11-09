const { ipcRenderer } = require('electron');
const path = require('path');
const { analyzeFiles } = require('../backend/fileAnalyzer');
const { organizeFiles, executeOrganization } = require('../backend/fileOrganizer');
const { initOpenAI } = require('../backend/openaiService');

// DOM 元素
const apiKeyInput = document.getElementById('apiKey');
const folderPathInput = document.getElementById('folderPath');
const requirementInput = document.getElementById('requirement');
const selectFolderBtn = document.getElementById('selectFolder');
const organizeBtn = document.getElementById('organize');
const logArea = document.getElementById('logArea');
const modelRadios = document.getElementsByName('model');
const showDialogBtn = document.getElementById('showDialog');
const dialogModal = document.getElementById('dialogModal');
const dialogContent = document.getElementById('dialogContent');
const closeBtn = document.querySelector('.close');

let lastDialog = null;
let currentOrganizationPlan = null;

// 添加日志
function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;
}

// 选择文件夹
selectFolderBtn.addEventListener('click', async () => {
    const folderPath = await ipcRenderer.invoke('select-folder');
    if (folderPath) {
        folderPathInput.value = folderPath;
        saveSettings();
    }
});

// 显示对话记录
showDialogBtn.addEventListener('click', () => {
    if (lastDialog) {
        dialogContent.textContent = JSON.stringify(lastDialog, null, 2);
        dialogModal.style.display = 'block';
    } else {
        addLog('还没有对话记录', 'info');
    }
});

// 关闭弹窗
closeBtn.addEventListener('click', () => {
    dialogModal.style.display = 'none';
});

// 点击弹窗外部关闭
window.addEventListener('click', (event) => {
    if (event.target === dialogModal) {
        dialogModal.style.display = 'none';
    }
});

// 显示预览对话框
function showPreview(previewData) {
    const tbody = document.querySelector('#previewTable tbody');
    tbody.innerHTML = '';
    
    previewData.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.source}</td>
            <td>${path.join(item.destination, path.basename(item.source))}</td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('previewModal').style.display = 'block';
}

// 开始整理
organizeBtn.addEventListener('click', async () => {
    try {
        const apiKey = apiKeyInput.value;
        const folderPath = folderPathInput.value;
        const requirement = requirementInput.value;
        const modelType = Array.from(modelRadios).find(radio => radio.checked).value;

        if (!apiKey || !folderPath || !requirement) {
            addLog('请填写所有必要信息', 'error');
            return;
        }

        addLog('开始文件分析...');
        const openai = initOpenAI(apiKey, modelType);
        const files = await analyzeFiles(folderPath);
        addLog(`找到 ${files.length} 个文件`);

        addLog('生成整理方案...');
        const result = await organizeFiles(files, requirement, openai, modelType, folderPath);
        lastDialog = result.dialog;
        currentOrganizationPlan = result.organizationPlan;
        
        // 显示预览
        showPreview(result.previewData);
        
    } catch (error) {
        addLog(`错误: ${error.message}`, 'error');
    }
});

// 确认整理按钮事件
document.getElementById('confirmOrganize').addEventListener('click', async () => {
    try {
        document.getElementById('previewModal').style.display = 'none';
        
        if (!currentOrganizationPlan) {
            addLog('没有可执行的整理方案', 'error');
            return;
        }
        
        addLog('开始执行文件整理...');
        const { errors, moveRecords } = await executeOrganization(
            currentOrganizationPlan, 
            folderPathInput.value
        );
        
        // 显示移动记录
        moveRecords.forEach(record => {
            addLog(`移动: ${record}`, 'info');
        });
        
        addLog('文件整理完成！', 'success');
        
        if (errors) {
            errors.forEach(error => {
                addLog(error, 'error');
            });
            addLog(`整理过程中有 ${errors.length} 个文件移动失败`, 'warning');
        }
        
    } catch (error) {
        addLog(`错误: ${error.message}`, 'error');
    }
});

// 取消整理按钮事件
document.getElementById('cancelOrganize').addEventListener('click', () => {
    document.getElementById('previewModal').style.display = 'none';
    currentOrganizationPlan = null;
    addLog('已取消文件整理', 'info');
});

// 在现有的变量声明后添加
const STORAGE_KEYS = {
    API_KEY: 'fileOrganizer_apiKey',
    FOLDER_PATH: 'fileOrganizer_folderPath',
    MODEL_TYPE: 'fileOrganizer_modelType',
    REQUIREMENT: 'fileOrganizer_requirement'
};

// 加载保存的设置
function loadSavedSettings() {
    apiKeyInput.value = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    folderPathInput.value = localStorage.getItem(STORAGE_KEYS.FOLDER_PATH) || '';
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL_TYPE);
    if (savedModel) {
        modelRadios.forEach(radio => {
            radio.checked = radio.value === savedModel;
        });
    }
    requirementInput.value = localStorage.getItem(STORAGE_KEYS.REQUIREMENT) || '';
}

// 保存设置
function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKeyInput.value);
    localStorage.setItem(STORAGE_KEYS.FOLDER_PATH, folderPathInput.value);
    localStorage.setItem(STORAGE_KEYS.MODEL_TYPE, 
        Array.from(modelRadios).find(radio => radio.checked).value
    );
    localStorage.setItem(STORAGE_KEYS.REQUIREMENT, requirementInput.value);
}

// 在页面加载时恢复设置
document.addEventListener('DOMContentLoaded', loadSavedSettings);

// 监听输入变化并保存
apiKeyInput.addEventListener('change', saveSettings);
folderPathInput.addEventListener('change', saveSettings);
modelRadios.forEach(radio => {
    radio.addEventListener('change', saveSettings);
});
requirementInput.addEventListener('change', saveSettings);

// 获取所有关闭按钮
const closeButtons = document.querySelectorAll('.close');

// 为所有关闭按钮添加事件监听
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
            if (modal.id === 'previewModal') {
                currentOrganizationPlan = null;
                addLog('已取消文件整理', 'info');
            }
        }
    });
});

// 点击弹窗外部关闭
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        if (event.target.id === 'previewModal') {
            currentOrganizationPlan = null;
            addLog('已取消文件整理', 'info');
        }
    }
});