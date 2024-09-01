import LocalStrategy from 'passport-local';
import { User } from '../Models/Users/Users.model.js';

const setupLocalAuth = (passport) => {
    // Configure Passport to use the Local Strategy for login
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email', // Use 'email' instead of 'username'
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    // Configure Passport to use the Local Strategy for signup
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email', // Use 'email' instead of 'username'
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, email, password, done) => {
        try {
            let user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                return done(null, false, { message: 'Email already in use.' });
            }

            user = new User({
                username: req.body.username,
                email: email.toLowerCase(),
                password: password
            });

            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    // Serialize user to save in session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize user to retrieve from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

};
// Middleware to check for Remember Me cookie
export const checkRememberMeCookie = async (req, res, next) => {
    const token = req.cookies.rememberMe;
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                return next();
            });
        } else {
            next();
        }
    } catch (err) {
        res.clearCookie('rememberMe');
        next();
    }
};
export default setupLocalAuth;