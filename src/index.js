const { analyzeFiles } = require('./backend/fileAnalyzer');
const { organizeFiles } = require('./backend/fileOrganizer');
const { initOpenAI } = require('./backend/openaiService');
const logger = require('./utils/logger');

async function main() {
    try {
        // 1. 获取用户输入
        const folderPath = process.argv[2];
        const requirement = process.argv[3];
        const apiKey = process.argv[4];  // 从命令行参数获取 API Key

        if (!folderPath) {
            throw new Error('请提供文件夹路径');
        }
        if (!requirement) {
            throw new Error('请提供整理需求');
        }
        if (!apiKey) {
            throw new Error('请提供 API Key');
        }

        // 2. 初始化OpenAI
        const openai = initOpenAI(apiKey);

        // 3. 分析文件
        const files = await analyzeFiles(folderPath);

        // 4. 使用AI组织文件
        await organizeFiles(files, requirement, openai);

    } catch (error) {
        logger.error('程序执行出错:', error.message);
    }
}

main();

