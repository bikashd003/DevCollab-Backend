import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from './Models/Users.model.js';
import cookieParser from 'cookie-parser';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import chalk from 'chalk';
dotenv.config({ path: `${__dirname}/.env` });
import connectDb from './Config/DbConfig.js';
import { generateAccessToken } from './Controllers/Auth/authentication.controller.js';
import manualAuthentication from './Routes/Auth/auth.routes.js';
import generateJWT from './Config/GenerateJwt.js';
const app = express();

// Middleware
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

// Connect to MongoDB
connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

  // Middleware to log route, time, and errors
  app.use((req, res, next) => {
    const start = Date.now();
    const originalEnd = res.end;
    const originalJson = res.json;
  
    res.end = function(...args) {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const color = status >= 400 ? 'red' : 'green';
      
      console.log(chalk[color](`Route: ${req.method} ${req.originalUrl} | Status: ${status} | Duration: ${duration}ms`));
      
      originalEnd.apply(res, args);
    };
  
    res.json = function(body) {
      if (body && body.error) {
        console.log(chalk.red(`Error on route ${req.method} ${req.originalUrl}: ${body.error}`));
      }
      originalJson.apply(res, arguments);
    };
  
    next();
  });
// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DevLearn API' });
});

// GitHub authentication routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    const token = generateJWT(req.user); 
    res.cookie('token',token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken',req.user.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    console.log('Authentication successful');
    res.redirect('http://localhost:5173/profile/user');
  }
);
app.use('/auth/token',generateAccessToken);
app.use('/auth/manual', manualAuthentication);
app.get('/auth/github/url', (req, res) => {
  res.json({ url: githubAuthUrl });
});

//github Logout route
app.get('/github/logout', (req, res) => {
  res.clearCookie('token');
  req.logout();
  res.redirect('/');
});

// 404 Error Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
export default app;
