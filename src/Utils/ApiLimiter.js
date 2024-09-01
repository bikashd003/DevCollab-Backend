import rateLimit from 'express-rate-limit';
import logger from './Logger.js';
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res) => {
        logger.error(chalk.red(`Rate limit exceeded for IP: ${req.ip}`));
        res.status(429).json({
            error: 'Too many requests, please try again later.'
        });
    }
});
