const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

async function analyzeFiles(folderPath) {
    try {
        const allFiles = [];
        await scanDirectory(folderPath, allFiles, folderPath);
        return allFiles;
    } catch (error) {
        logger.error('文件分析错误:', error);
        throw error;
    }
}

async function scanDirectory(dirPath, results, basePath) {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            await scanDirectory(fullPath, results, basePath);
        } else {
            results.push({
                name: file,
                path: path.relative(basePath, fullPath),
                fullPath: fullPath,
                size: stats.size,
                isDirectory: false,
                extension: path.extname(file)
            });
        }
    }
}

module.exports = {
    analyzeFiles
}; 