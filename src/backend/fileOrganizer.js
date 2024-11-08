const fs = require('fs').promises;
const path = require('path');
const { analyzeWithAI } = require('./openaiService');
const logger = require('../utils/logger');

async function organizeFiles(files, requirement, openai) {
    try {
        // 获取AI的整理建议
        const aiSuggestion = await analyzeWithAI(openai, files, requirement);
        
        // 解析AI建议并执行文件移动
        const organizationPlan = JSON.parse(aiSuggestion);
        
        // 执行文件移动
        for (const action of organizationPlan.actions) {
            const { source, destination } = action;
            
            // 创建目标文件夹
            await fs.mkdir(path.dirname(destination), { recursive: true });
            
            // 移动文件
            await fs.rename(source, destination);
            
            logger.info(`已移动: ${source} -> ${destination}`);
        }
    } catch (error) {
        logger.error('文件整理错误:', error);
        throw error;
    }
}

module.exports = {
    organizeFiles
}; 