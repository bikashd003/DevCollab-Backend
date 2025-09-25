import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only 2 participants per conversation (direct messaging)
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  next();
});

// Index for efficient querying
conversationSchema.index({ participants: 1, lastMessageAt: -1 });
conversationSchema.index({ participants: 1, isActive: 1 });

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreateConversation = async function(userId1, userId2) {
  // Ensure consistent ordering of participants
  const participants = [userId1, userId2].sort();
  
  let conversation = await this.findOne({
    participants: { $all: participants, $size: 2 }
  }).populate('participants', 'username profilePicture isOnline lastOnline')
    .populate('lastMessage');

  if (!conversation) {
    const newConversation = await this.create({
      participants: participants
    });
    
    conversation = await this.findById(newConversation._id)
      .populate('participants', 'username profilePicture isOnline lastOnline')
      .populate('lastMessage');
  }

  return conversation;
};

// Method to update unread count for a user
conversationSchema.methods.updateUnreadCount = function(userId, increment = true) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  const newCount = increment ? currentCount + 1 : 0;
  this.unreadCount.set(userId.toString(), newCount);
  return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export { Conversation };