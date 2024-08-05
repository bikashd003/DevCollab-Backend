import jwt from 'jsonwebtoken';

const generateJWT = (user) => {
  return jwt.sign({ id: user._id, githubId: user.githubId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
export default generateJWT;