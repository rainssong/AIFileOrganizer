const { ipcRenderer } = require('electron');
const { analyzeFiles } = require('../backend/fileAnalyzer');
const { organizeFiles } = require('../backend/fileOrganizer');
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

        addLog('开始文件整理...');
        const { content, dialog } = await organizeFiles(files, requirement, openai, modelType);
        lastDialog = dialog; // 保存对话记录
        addLog('文件整理完成！', 'success');

    } catch (error) {
        addLog(`错误: ${error.message}`, 'error');
    }
}); 