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
    required: function () {
      return !this.githubId && !this.googleId;
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
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500
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
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  socialLinks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialLink'
  }],
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  activities: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  reputaion: {
    type: Number,
    default: 0
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastOnline: {
    type: Date
  },

}, { timestamps: true });

// Add any pre-save hooks, methods, or statics here if needed

const User = mongoose.model('User', userSchema);

export { User }
