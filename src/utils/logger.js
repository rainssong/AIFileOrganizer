const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        // 输出到控制台
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // 输出到文件
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'combined.log' 
        })
    ]
});

module.exports = logger; 