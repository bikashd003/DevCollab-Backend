import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../Models/Users/Users.model.js';

const setupGoogleAuth = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (email) {
                        user = await User.findOne({ email: email.toLowerCase() });
                        if (user) {
                            user.googleId = profile.id;
                            if (!user.profilePicture && profile.photos && profile.photos[0]) {
                                user.profilePicture = profile.photos[0].value;
                            }
                            await user.save();
                            return done(null, user);
                        }
                    }

                    user = await User.create({
                        googleId: profile.id,
                        email: email ? email.toLowerCase() : null,
                        username: profile.displayName || `google_${profile.id}`,
                        name: profile.displayName,
                        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                        accessToken,
                        refreshToken
                    });
                }

                user.lastLogin = new Date();
                await user.save();

                return done(null, user);
            } catch (error) {
                console.error('Google auth error:', error);
                return done(error);
            }
        }));
};

export default setupGoogleAuth;
