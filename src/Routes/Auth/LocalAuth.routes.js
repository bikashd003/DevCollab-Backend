import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import logger from '../../Utils/Logger.js';
import authMiddleware from '../../Middleware/Auth/Auth.middleware.js';
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
        if (err) {
            return res.status(500).json({ message: 'An error occurred.' });
        }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }

        // Log the user in
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Login failed.' });
            }
            if (req.body.rememberMeChecked) {
                try {
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

                    // Save the token in a secure cookie
                    res.cookie('rememberMe', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
                    });

                    // Send a response after setting the cookie
                    return res.status(200).json({ message: 'Login successful.' });

                } catch (error) {
                    logger.error(error);
                    return res.status(500).json({ message: 'Failed to set cookie.' });
                }
            } else {
                // Send a response when 'rememberMe' is not checked
                return res.status(200).json({ message: 'Login successful.' });
            }
        });
    })(req, res, next);
});


// Logout Route
localAuthRouter.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
          return res.status(500).json({ message: 'Logout failed.' });
      }
      res.clearCookie('rememberMe');
      res.status(200).json({ message: 'Logout successful.' });
  });
});
localAuthRouter.get('/check-auth', authMiddleware, (req, res) => {
    if (req.isAuthenticated()) {
        return res.status(200).json({ isAuthenticated: true });
    } else {
        return res.status(400).json({ isAuthenticated: false });
    }
});

export default localAuthRouter;