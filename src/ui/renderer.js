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

// 开始整理
organizeBtn.addEventListener('click', async () => {
    try {
        const apiKey = apiKeyInput.value;
        const folderPath = folderPathInput.value;
        const requirement = requirementInput.value;

        if (!apiKey || !folderPath || !requirement) {
            addLog('请填写所有必要信息', 'error');
            return;
        }

        addLog('开始文件分析...');
        const openai = initOpenAI(apiKey);
        const files = await analyzeFiles(folderPath);
        addLog(`找到 ${files.length} 个文件`);

        addLog('开始文件整理...');
        await organizeFiles(files, requirement, openai);
        addLog('文件整理完成！', 'success');

    } catch (error) {
        addLog(`错误: ${error.message}`, 'error');
    }
}); 