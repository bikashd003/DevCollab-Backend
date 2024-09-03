import jwt from 'jsonwebtoken';
import { User } from '../../Models/Users/Users.model.js'; 

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  const rememberMeToken = req.cookies.rememberMe;
  let decoded = null;

  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log('Token verification failed:', err.message);
    }
  }

  // If no regular token is found or it is invalid, check for Remember Me token
  if (!decoded && rememberMeToken) {
    try {
      decoded = jwt.verify(rememberMeToken, process.env.JWT_SECRET);
    } catch (err) {
      console.log('Remember Me token verification failed:', err.message);
    }
  }

  if (decoded) {
    try {
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user; // Attach the user object to the request
      } else {
        req.user = null;
      }
    } catch (err) {
      console.log('User lookup failed:', err.message);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

export default authMiddleware;
