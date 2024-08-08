
import passport from 'passport';
import express from 'express';
import session from 'express-session';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../Models/Users/Users.model.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { generateAccessToken } from "../Controllers/Auth/authentication.controller.js";
import generateJWT from '../Config/GenerateJwt.js';
import { globalErrorHandler } from '../Utils/AppError.js';
import chalk from 'chalk';

const Root = (app) => {
    app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser())

    // Session configuration
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' }
    }));

    // Passport initialization
    app.use(passport.initialize());
    app.use(passport.session());
    // Root route
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to DevLearn API' });
    });

    // Passport serialization
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });
                if (!user) {
                    user = await User.create({
                        githubId: profile.id,
                        username: profile.username,
                        profilePicture: profile.photos[0].value,
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    });
                } else {
                    // Update the tokens
                    user.accessToken = accessToken;
                    user.refreshToken = refreshToken;
                    await user.save();
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL)}`;

    // Middleware to log route, time, and errors
    app.use((req, res, next) => {
        const start = Date.now();
        const originalEnd = res.end;
        const originalJson = res.json;

        res.end = function (...args) {
            const duration = Date.now() - start;
            const status = res.statusCode;
            const color = status >= 400 ? 'red' : 'green';

            console.log(chalk[color](`Route: ${req.method} ${req.originalUrl} | Status: ${status} | Duration: ${duration}ms`));

            originalEnd.apply(res, args);
        };

        res.json = function (body) {
            if (body && body.error) {
                console.log(chalk.red(`Error on route ${req.method} ${req.originalUrl}: ${body.error}`));
            }
            originalJson.apply(res, arguments);
        };

        next();
    });

    // GitHub authentication routes
    app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        async (req, res) => {
            const token = generateJWT(req.user);
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            res.cookie('refreshToken', req.user.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            console.log('Authentication successful');
            const user = await User.findOne({ refreshToken: req.user.refreshToken });
            res.redirect(`http://localhost:5173/profile/${user?.username}`);

        }
    );
    app.use('/auth/token', generateAccessToken);
    app.get('/auth/github/url', (req, res) => {
        res.json({ url: githubAuthUrl });
    });

    //github Logout route
    app.get('/github/logout', (req, res) => {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        req.logout();
        res.redirect('/');
    });


    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    });
    app.use(globalErrorHandler)
}
export default Root;