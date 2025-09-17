import passport from 'passport';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { globalErrorHandler } from '../Utils/AppError.js';
import chalk from 'chalk';
import uploadRouter from '../Routes/Upload/cloudinaryUpload.routes.js';
import logger from '../Utils/Logger.js';
import { apiLimiter } from '../Utils/ApiLimiter.js';
import helmet from 'helmet';
import setupLocalAuth from '../Auth/LocalAuth.js';
import localAuthRouter from '../Routes/Auth/LocalAuth.routes.js';
import oauthRouter from '../Routes/Auth/OAuthRoutes.js';


const Root = (app) => {
    app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser())
    app.use(helmet());

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    setupLocalAuth(passport);

    app.use((req, res, next) => {
        const start = Date.now();
        const originalEnd = res.end;
        const originalJson = res.json;

        res.end = function (...args) {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const method = req.method;
            const url = req.originalUrl;
            const color = status >= 400 ? 'red' : 'green';

            if (status >= 400) {
                logger.error(chalk[color](`Route: ${method} ${url} | Status: ${status} | Duration: ${duration}ms`));
            } else {
                logger.info(chalk[color](`Route: ${method} ${url} | Status: ${status} | Duration: ${duration}ms`));
            }

            originalEnd.apply(res, args);
        };

        res.json = function (body) {
            if (body && body.error) {
                logger.error((chalk.red`Error on route ${req.method} ${req.originalUrl}: ${body.error}`));
            }
            originalJson.apply(res, arguments);
        };

        next();
    });
    app.use(apiLimiter)

    app.use('/auth', localAuthRouter);
    app.use('/auth', oauthRouter);
    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) { return next(err); }
            res.redirect('/');
        });
    });
    app.use('/cloudinary', uploadRouter)

    app.use((err, req, res, next) => {
        logger.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    app.use(globalErrorHandler);
}
export default Root;