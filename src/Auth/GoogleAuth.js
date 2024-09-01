import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../Models/Users/Users.model.js';

const setupGoogleAuth = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.displayName,
                        profilePicture: profile.photos[0].value
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }));
};

export default setupGoogleAuth;
