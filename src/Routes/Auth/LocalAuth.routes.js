import { Router } from 'express';
import passport from 'passport';
const localAuthRouter = Router();
// Signup Route
localAuthRouter.post('/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });

        req.login(user, (err) => {
            if (err) return next(err);
            return res.status(201).json({ message: 'Signup successful', user });
        });
    })(req, res, next);
});

// Login Route
localAuthRouter.post('/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });

        req.login(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({ message: 'Login successful', user });
        });
    })(req, res, next);
});

// Logout Route
localAuthRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Failed to log out' });
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

export default localAuthRouter;