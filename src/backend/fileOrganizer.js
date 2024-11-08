const fs = require('fs').promises;
const path = require('path');
const { analyzeWithAI } = require('./openaiService');
const logger = require('../utils/logger');

async function organizeFiles(files, requirement, openai, modelType) {
    try {
        // 获取AI的整理建议和对话记录
        const { content, dialog } = await analyzeWithAI(openai, files, requirement, modelType);
        
        // 解析AI建议并执行文件移动
        const organizationPlan = JSON.parse(content);
        
        // 执行文件移动
        for (const action of organizationPlan.actions) {
            const { source, destination } = action;
            await fs.mkdir(path.dirname(destination), { recursive: true });
            await fs.rename(source, destination);
            logger.info(`已移动: ${source} -> ${destination}`);
        }

        return { content, dialog };
    } catch (error) {
        logger.error('文件整理错误:', error);
        throw error;
    }
}

module.exports = {
    organizeFiles
}; 