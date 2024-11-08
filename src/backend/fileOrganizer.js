const fs = require('fs').promises;
const path = require('path');
const { analyzeWithAI } = require('./openaiService');
const logger = require('../utils/logger');

async function organizeFiles(files, requirement, openai, modelType) {
    try {
        const { content, dialog } = await analyzeWithAI(openai, files, requirement, modelType);
        
        const organizationPlan = JSON.parse(content);
        const errors = [];
        
        for (const action of organizationPlan.actions) {
            try {
                const { source, destination } = action;
                const fileName = path.basename(source);
                const destDir = path.dirname(destination);
                
                const fullDestDir = path.join(destDir, path.basename(destination, path.extname(destination)));
                const fullDestPath = path.join(fullDestDir, fileName);
                
                await fs.mkdir(fullDestDir, { recursive: true });
                await fs.rename(source, fullDestPath);
                logger.info(`已移动: ${source} -> ${fullDestPath}`);
            } catch (moveError) {
                const errorMsg = `移动失败: ${action.source} -> ${action.destination}, 原因: ${moveError.message}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        return { 
            content, 
            dialog,
            errors: errors.length > 0 ? errors : null
        };
    } catch (error) {
        logger.error('文件整理错误:', error);
        throw error;
    }
}

module.exports = {
    organizeFiles
}; 