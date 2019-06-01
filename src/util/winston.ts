import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;
const MESSAGE = Symbol.for('message');

// define the custom settings for each transport (file, console)

function createWinstonLogger(test: boolean) {
    if (!test) {
        return createLogger({
            transports: [
                new transports.File({
                    filename: `logs/error.log`,
                    level: 'error',
                    format: format.combine(
                        format.splat(),
                        format.simple()
                    )
                }),
                new transports.File({
                    filename: `logs/combined.log`,
                    level: 'info',
                    format: format.combine(
                        format.splat(),
                        format.simple()
                    )
                }),
                new transports.Console({
                    level: 'debug',
                    format: format.combine(
                        format.timestamp(),
                        format.splat(),
                        format.colorize(),
                        format.printf(
                            (info) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
                        )
                    )
                })
            ],
            exitOnError: false, // do not exit on handled exceptions
        });
    } else {
        return createLogger({
            transports: [
                new transports.Console({
                    level: 'debug',
                    format: format.combine(
                        format.timestamp(),
                        format.splat(),
                        format.colorize(),
                        format.printf(
                            (info) => ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
                        )
                    )
                })
            ]
        });
    }
}

// instantiate a new Winston Logger with the settings defined above
export default createWinstonLogger(process.env.NODE_ENV === 'development');
