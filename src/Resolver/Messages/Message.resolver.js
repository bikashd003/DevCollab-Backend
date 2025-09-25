import { Message } from '../../Models/Messages/Message.model.js';
import { Conversation } from '../../Models/Messages/Conversation.model.js';
import { User } from '../../Models/Users/Users.model.js';
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const messageResolvers = {
  Query: {
    getConversations: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const conversations = await Conversation.find({
        participants: user._id,
        isActive: true
      })
        .populate('participants', 'username profilePicture isOnline lastOnline')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

      return conversations.map(conv => ({
        id: conv._id,
        participants: conv.participants,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        isActive: conv.isActive,
        unreadCount: conv.unreadCount.get(user._id.toString()) || 0
      }));
    },

    getConversation: async (_, { participantId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      // Check if the participant is in user's connections
      const currentUser = await User.findById(user._id).populate('connections');
      const isConnection = currentUser.connections.some(conn => conn._id.toString() === participantId);

      if (!isConnection) {
        throw new ForbiddenError('You can only message your connections');
      }

      let conversation = await Conversation.findOrCreateConversation(user._id, participantId);

      if (!conversation.participants[0].username) {
        conversation = await Conversation.findById(conversation._id)
          .populate('participants', 'username profilePicture isOnline lastOnline')
          .populate('lastMessage');
      }

      return {
        id: conversation._id,
        participants: conversation.participants,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        isActive: conversation.isActive,
        unreadCount: conversation.unreadCount.get(user._id.toString()) || 0
      };
    },

    getMessages: async (_, { conversationId, limit, offset }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(user._id)) {
        throw new ForbiddenError('You are not part of this conversation');
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
        .limit(limit)
        .skip(offset);

      return messages.reverse();
    },

    getUnreadMessagesCount: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const count = await Message.countDocuments({
        receiver: user._id,
        isRead: false,
        isDeleted: false
      });

      return count;
    }
  },

  Mutation: {
    sendMessage: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const { receiverId, content, messageType } = input;

      // Check if receiver exists and is in user's connections
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        throw new UserInputError('Receiver not found');
      }

      const currentUser = await User.findById(user._id).populate('connections');
      const isConnection = currentUser.connections.some(conn => conn._id.toString() === receiverId);

      if (!isConnection) {
        throw new ForbiddenError('You can only message your connections');
      }

      // Create the message
      const message = await Message.create({
        sender: user._id,
        receiver: receiverId,
        content: content.trim(),
        messageType
      });

      // Find or create conversation
      const conversation = await Conversation.findOrCreateConversation(user._id, receiverId);

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.updateUnreadCount(receiverId, true);

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username profilePicture')
        .populate('receiver', 'username profilePicture');

      // Publish to subscription
      pubsub.publish('MESSAGE_RECEIVED', {
        messageReceived: populatedMessage,
        userId: receiverId
      });

      return populatedMessage;
    },

    markMessageAsRead: async (_, { messageId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const message = await Message.findById(messageId);
      if (!message || message.receiver.toString() !== user._id.toString()) {
        throw new ForbiddenError('You can only mark your own messages as read');
      }

      await message.markAsRead();

      const populatedMessage = await Message.findById(messageId)
        .populate('sender', 'username profilePicture')
        .populate('receiver', 'username profilePicture');

      // Publish to subscription
      pubsub.publish('MESSAGE_READ', {
        messageRead: populatedMessage,
        conversationId: message.conversationId
      });

      return populatedMessage;
    },

    markConversationAsRead: async (_, { conversationId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(user._id)) {
        throw new ForbiddenError('You are not part of this conversation');
      }

      // Mark all unread messages in this conversation as read
      await Message.updateMany({
        $or: [
          { sender: conversation.participants[0], receiver: conversation.participants[1] },
          { sender: conversation.participants[1], receiver: conversation.participants[0] }
        ],
        receiver: user._id,
        isRead: false
      }, {
        isRead: true,
        readAt: new Date()
      });

      // Reset unread count for this user
      await conversation.updateUnreadCount(user._id, false);

      return true;
    },

    deleteMessage: async (_, { messageId }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');

      const message = await Message.findById(messageId);
      if (!message || message.sender.toString() !== user._id.toString()) {
        throw new ForbiddenError('You can only delete your own messages');
      }

      message.isDeleted = true;
      message.deletedAt = new Date();
      await message.save();

      return true;
    }
  },

  Subscription: {
    messageReceived: {
      subscribe: (_, { userId }) => pubsub.asyncIterator('MESSAGE_RECEIVED'),
      resolve: (payload, { userId }) => {
        if (payload.userId === userId) {
          return payload.messageReceived;
        }
        return null;
      }
    },

    messageRead: {
      subscribe: (_, { conversationId }) => pubsub.asyncIterator('MESSAGE_READ'),
      resolve: (payload, { conversationId }) => {
        if (payload.conversationId === conversationId) {
          return payload.messageRead;
        }
        return null;
      }
    }
  }
};