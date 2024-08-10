import jwt from 'jsonwebtoken';

const generateJWT = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    authMethod: determineAuthMethod(user),
  };

  // Add provider-specific IDs if they exist
  if (user.githubId) payload.githubId = user.githubId;
  if (user.googleId) payload.googleId = user.googleId;
  if (user.email) payload.email = user.email;

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const determineAuthMethod = (user) => {
  if (user.githubId) return 'github';
  if (user.googleId) return 'google';
  return 'manual';
};

export default generateJWT;