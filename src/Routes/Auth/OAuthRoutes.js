import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import setupGithubAuth from '../../Auth/GithubAuth.js';
import setupGoogleAuth from '../../Auth/GoogleAuth.js';
import logger from '../../Utils/Logger.js';

const oauthRouter = Router();

setupGithubAuth();
setupGoogleAuth();

oauthRouter.get('/github/url', (req, res) => {
  try {
    const state = `github_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL)}&scope=user:email&state=${state}`;
    
    res.json({ url: githubAuthUrl });
  } catch (error) {
    logger.error('GitHub URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate GitHub auth URL' });
  }
});

oauthRouter.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}?error=github_auth_failed` }),
  (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
      
      res.cookie('rememberMe', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
      });

      res.redirect(`${process.env.CLIENT_URL}?auth=success`);
    } catch (error) {
      logger.error('GitHub callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}?error=github_callback_failed`);
    }
  }
);

oauthRouter.get('/google/url', (req, res) => {
  try {
    const state = `google_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&scope=profile email&response_type=code&state=${state}`;
    
    res.json({ url: googleAuthUrl });
  } catch (error) {
    logger.error('Google URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate Google auth URL' });
  }
});

oauthRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}?error=google_auth_failed` }),
  (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
 
      res.cookie('rememberMe', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
      });

      res.redirect(`${process.env.CLIENT_URL}?auth=success`);
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}?error=google_callback_failed`);
    }
  }
);

export default oauthRouter;