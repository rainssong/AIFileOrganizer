const OpenAI = require('openai');

function initOpenAI(apiKey) {
    return new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        dangerouslyAllowBrowser: true
    });
}

async function analyzeWithAI(openai, files, requirement) {
    const response = await openai.chat.completions.create({
        // model: "gpt-3.5-turbo",
        model:"qwen-plus", // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [{
            role: "system",
            content: `你是一个文件整理助手。请始终以JSON格式返回整理方案，格式如下：
            {
                "actions": [
                    {
                        "source": "原始文件路径",
                        "destination": "目标文件路径",
                        "action": "move"
                    }
                ]
            }`
        }, {
            role: "user",
            content: `请分析以下文件并返回整理方案。
            需求：${requirement}
            文件列表：${JSON.stringify(files, null, 2)}
            
            请只返回JSON格式的整理方案，不要包含任何其他解释文字。`
        }],
        temperature: 0.7,
    });

    return response.choices[0].message.content;
}

module.exports = {
    initOpenAI,
    analyzeWithAI
}; 