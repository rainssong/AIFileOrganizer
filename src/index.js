const { analyzeFiles } = require('./backend/fileAnalyzer');
const { organizeFiles } = require('./backend/fileOrganizer');
const { initOpenAI } = require('./backend/openaiService');
const config = require('./backend/config');
const logger = require('./utils/logger');

async function main() {
    try {
        // 1. 获取用户输入
        const folderPath = process.argv[2];
        const requirement = process.argv[3];
        const apiKey = config.openaiApiKey;

        if (!folderPath) {
            throw new Error('请提供文件夹路径');
        }
        if (!requirement) {
            throw new Error('请提供整理需求');
        }
        if (!apiKey) {
            throw new Error('请在.env文件中设置OPENAI_API_KEY');
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


// 运行命令：node src/index.js "F:\Develop\Node.js\project\FileOrganizer\src\testfolder" "按照扩展名放在不同的文件夹下面"
