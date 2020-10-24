import winston, { createLogger } from "winston"

const logger: any = createLogger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            format: winston.format.combine(winston.format.json(), winston.format.colorize(),)
        }),
        new winston.transports.File({
            level: 'error',
            filename: './logs/all-errors.log',
            handleExceptions: true,
            format: winston.format.combine(winston.format.json(), winston.format.colorize(),)
        }),
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
    ]
})

logger.stream = {
    write: function(message: any, encoding: any){
        logger.info(message);
    }
}

export default logger;
