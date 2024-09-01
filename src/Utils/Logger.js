import winston from 'winston';
import chalk from 'chalk';

// Define custom log levels and colors
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 4,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    },
};

// Create the Winston logger
const logger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.printf(({ timestamp, level, message }) => {
            const colorizer = winston.format.colorize();
            const levelOutput = colorizer.colorize(level, `${level.toUpperCase()}`);
            const timestampOutput = chalk.cyan(`[${timestamp}]`);
            return `${timestampOutput} ${levelOutput}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

// Add colors to Winston levels
winston.addColors(customLevels.colors);

export default logger;
