import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    // Required for manual authentication, but not for GitHub auth
    required: function() {
      return !this.githubId;
    }
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true  // This allows null values and maintains uniqueness for non-null values
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// Add any pre-save hooks, methods, or statics here if needed

const User = mongoose.model('User', userSchema);

export {User}
