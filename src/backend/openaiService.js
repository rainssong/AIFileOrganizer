const OpenAI = require('openai');

function initOpenAI(apiKey, modelType = 'qwen') {
    const config = {
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    };

    if (modelType === 'qwen') {
        config.baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    }

    return new OpenAI(config);
}

async function analyzeWithAI(openai, files, requirement, modelType = 'qwen') {
    let model;
    switch (modelType) {
        case 'qwen':
            model = 'qwen-plus';
            break;
        case 'gpt':
            model = 'gpt-3.5-turbo';
            break;
    }
    
    const messages = [{
        role: "system",
        content: `你是一个文件整理助手。请始终以JSON格式返回整理方案，格式如下：
        {
            "actions": [
                {
                    "source": "原始文件的相对路径",
                    "destination": "目标文件夹的相对路径（不包含文件名）",
                    "action": "move"
                }
            ]
        }
        注意：
        1. 所有路径都应该是相对路径
        2. destination 只需要指定目标文件夹路径，不要包含文件名
        3. 不要在路径中重复文件名`
    }, {
        role: "user",
        content: `请分析以下文件并返回整理方案。
        需求：${requirement}
        文件列表：${JSON.stringify(files, null, 2)}
        
        请只返回JSON格式的整理方案，不要包含任何其他解释文字。`
    }];

    const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7,
    });

    return {
        content: response.choices[0].message.content,
        dialog: {
            model: model,
            messages: messages,
            response: response.choices[0].message
        }
    };
}

module.exports = {
    initOpenAI,
    analyzeWithAI
}; 