import jwt from 'jsonwebtoken';
import { User } from '../../Models/Users/Users.model.js';

const socketAuthMiddleware = async (socket, next) => {
  try {
    let token = null;
    
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    else if (socket.handshake.query && socket.handshake.query.token) {
      token = socket.handshake.query.token;
    }
    else if (socket.handshake.headers.cookie) {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      token = cookies.token || cookies.rememberMe;
    }

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    };

    console.log(`Authenticated user connected: ${user.username} (${socket.id})`);
    next();
  } catch (error) {
    console.log('Socket authentication failed:', error.message);
    next(new Error('Authentication failed'));
  }
};

const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
};

export default socketAuthMiddleware;