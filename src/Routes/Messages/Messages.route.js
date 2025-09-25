import express from 'express';
import { Message } from '../../Models/Messages/Message.model.js';
import { Conversation } from '../../Models/Messages/Conversation.model.js';
import { User } from '../../Models/Users/Users.model.js';
import authMiddleware from '../../Middleware/Auth/Auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'username profilePicture isOnline lastOnline')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    const conversationsWithUnreadCount = conversations.map(conv => ({
      ...conv.toObject(),
      unreadCount: conv.unreadCount.get(userId.toString()) || 0
    }));

    res.json({ conversations: conversationsWithUnreadCount });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { sender: conversation.participants[0], receiver: conversation.participants[1] },
        { sender: conversation.participants[1], receiver: conversation.participants[0] }
      ],
      isDeleted: false
    })
    .populate('sender', 'username profilePicture')
    .populate('receiver', 'username profilePicture')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const sender = await User.findById(senderId).populate('connections');
    const isConnection = sender.connections.some(conn => conn._id.toString() === receiverId);
    
    if (!isConnection) {
      return res.status(403).json({ error: 'You can only message your connections' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType
    });

    const conversation = await Conversation.findOrCreateConversation(senderId, receiverId);
    
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.updateUnreadCount(receiverId, true);

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

    res.status(201).json({ 
      message: populatedMessage,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Message.updateMany({
      $or: [
        { sender: conversation.participants[0], receiver: conversation.participants[1] },
        { sender: conversation.participants[1], receiver: conversation.participants[0] }
      ],
      receiver: userId,
      isRead: false
    }, {
      isRead: true,
      readAt: new Date()
    });
    await conversation.updateUnreadCount(userId, false);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;