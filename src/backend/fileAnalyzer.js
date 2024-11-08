const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

async function analyzeFiles(folderPath) {
    try {
        const files = await fs.readdir(folderPath);
        const fileDetails = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(folderPath, file);
                const stats = await fs.stat(filePath);
                return {
                    name: file,
                    path: filePath,
                    size: stats.size,
                    isDirectory: stats.isDirectory(),
                    extension: path.extname(file)
                };
            })
        );
        return fileDetails;
    } catch (error) {
        logger.error('文件分析错误:', error);
        throw error;
    }
}

module.exports = {
    analyzeFiles
}; 