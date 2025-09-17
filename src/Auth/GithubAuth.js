import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../Models/Users/Users.model.js';

const setupGithubAuth = () => {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ githubId: profile.id });

                if (!user) {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    if (email) {
                        user = await User.findOne({ email: email.toLowerCase() });
                        if (user) {
                            user.githubId = profile.id;
                            if (!user.profilePicture && profile.photos && profile.photos[0]) {
                                user.profilePicture = profile.photos[0].value;
                            }
                            await user.save();
                            return done(null, user);
                        }
                    }

                    user = await User.create({
                        githubId: profile.id,
                        username: profile.username || profile.displayName || `github_${profile.id}`,
                        email: email ? email.toLowerCase() : null,
                        profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
                        accessToken,
                        refreshToken
                    });
                }

                user.lastLogin = new Date();
                await user.save();

                return done(null, user);
            } catch (error) {
                console.error('GitHub auth error:', error);
                return done(error);
            }
        }));
};

export default setupGithubAuth;
