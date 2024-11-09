const fs = require('fs').promises;
const path = require('path');
const { analyzeWithAI } = require('./openaiService');
const logger = require('../utils/logger');

async function organizeFiles(files, requirement, openai, modelType, basePath) {
    try {
        const { content, dialog } = await analyzeWithAI(openai, files, requirement, modelType);
        const organizationPlan = JSON.parse(content);
        const moveRecords = [];
        
        // 准备预览数据
        const previewData = organizationPlan.actions.map(action => {
            const source = path.relative(basePath, action.source);
            const destination = path.relative(basePath, action.destination);
            return {
                source,
                destination,
                action: action.action
            };
        });

        return { 
            content, 
            dialog,
            previewData,
            basePath,
            organizationPlan
        };
    } catch (error) {
        logger.error('文件整理错误:', error);
        throw error;
    }
}

async function executeOrganization(organizationPlan, basePath) {
    const errors = [];
    const moveRecords = [];
    
    for (const action of organizationPlan.actions) {
        try {
            const { source, destination } = action;
            const fullSource = path.join(basePath, source);
            const fullDestDir = path.join(basePath, destination);
            const fileName = path.basename(source);
            const fullDestPath = path.join(fullDestDir, fileName);
            
            // 创建目标目录
            await fs.mkdir(fullDestDir, { recursive: true });
            
            // 移动文件
            await fs.rename(fullSource, fullDestPath);
            
            const moveRecord = `${source} -> ${path.join(destination, fileName)}`;
            moveRecords.push(moveRecord);
            logger.info(`已移动: ${moveRecord}`);
        } catch (moveError) {
            const errorMsg = `移动失败: ${action.source} -> ${action.destination}, 原因: ${moveError.message}`;
            logger.error(errorMsg);
            errors.push(errorMsg);
        }
    }
    
    return { errors: errors.length > 0 ? errors : null, moveRecords };
}

module.exports = {
    organizeFiles,
    executeOrganization
}; 