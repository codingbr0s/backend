import * as winston from 'winston';

// define the custom settings for each transport (file, console)

function createWinstonLogger(test: boolean) {
    if (!test) {
        return winston.createLogger({
            transports: [
                new winston.transports.File({
                    filename: `logs/error.log`,
                    level: 'error',
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.File({
                    filename: `logs/combined.log`,
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.simple()
                    )
                }),
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.simple()
                    )
                })
            ],
            exitOnError: false, // do not exit on handled exceptions
        });
    } else {
        return winston.createLogger({
            transports: [
                new winston.transports.Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.splat(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }
}

// instantiate a new Winston Logger with the settings defined above
export default createWinstonLogger(process.env.NODE_ENV === 'development');
