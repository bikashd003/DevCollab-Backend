import { User } from "../../Models/Users.model.js";
import axios from "axios";
import generateJWT from "../../Config/GenerateJwt.js";
const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
}

const login = async (req, res) => {
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

  User.findOne({ refreshToken })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const token = generateJWT(user);
      user.accessToken=token;
      user.save();
      res.json({ token });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate new access token' });
    });
}
export {
  register,
  login, generateAccessToken
}