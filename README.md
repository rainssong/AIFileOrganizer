# AI 文件整理助手

一个基于 Electron 和 AI 的智能文件整理工具,支持通义千问和 OpenAI GPT 模型。

使用举例：将只有歌名mp3文件，按照歌手和专辑归类


## 安装 

```bash
克隆项目
git clone [项目地址]
安装依赖
npm install
启动应用
npm start
```

## 使用说明

1. 选择 AI 模型(通义千问/GPT)
2. 输入对应的 API Key
3. 选择需要整理的文件夹
4. 描述你的整理需求
5. 点击"开始整理"
6. 在预览界面确认整理方案
7. 确认后开始执行整理

## 配置说明

- 通义千问 API: 需要阿里云通义千问 API Key
- OpenAI API: 需要 OpenAI API Key
- 所有配置会自动保存在本地

## 技术栈

- Electron
- Node.js
- OpenAI API
- 通义千问 API
- Winston (日志系统)

## 项目结构
```
src/
├── backend/ # 后端逻辑
│ ├── fileAnalyzer.js # 文件分析
│ ├── fileOrganizer.js # 文件整理
│ ├── openaiService.js # AI 服务
│ └── config.js # 配置文件
├── ui/ # 前端界面
│ ├── index.html # 主界面
│ ├── styles.css # 样式文件
│ └── renderer.js # 渲染进程
├── utils/ # 工具函数
│ └── logger.js # 日志模块
└── main.js # 主进程
```

## 注意事项

- 先使用预览功能查看整理方案
- 重要文件建议先备份
- API Key 请妥善保管

## 开发相关

- 日志文件位于项目根目录
- 错误日志: error.log
- 完整日志: combined.log

## License

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request
