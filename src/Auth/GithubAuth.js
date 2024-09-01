import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../Models/Users/Users.model.js';

const setupGithubAuth = () => {
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
                        email: profile.emails[0].value
                    });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }));
};

export default setupGithubAuth;
