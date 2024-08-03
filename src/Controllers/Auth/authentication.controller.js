import { User } from "../../Models/Users.model.js";
import axios from "axios";

const register=async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  const login= async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }
  const generateAccessToken =async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
  
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
  
    try {
      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
  
      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Accept': 'application/json'
        }
      });
  
      const newAccessToken = response.data.access_token;
      user.accessToken = newAccessToken;
      await user.save();
  
      res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to refresh access token' });
    }
  }
  export{
    register,
    login,generateAccessToken
  }