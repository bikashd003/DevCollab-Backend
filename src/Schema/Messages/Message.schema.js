import { gql } from 'apollo-server-express';

export const messageTypeDefs = gql`
  type Message {
    id: ID!
    sender: User!
    receiver: User!
    content: String!
    messageType: MessageType!
    isRead: Boolean!
    readAt: String
    editedAt: String
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    lastMessage: Message
    lastMessageAt: String!
    unreadCount: Int!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  enum MessageType {
    text
    image
    file
  }

  input SendMessageInput {
    receiverId: ID!
    content: String!
    messageType: MessageType = text
  }

  type Query {
    getConversations: [Conversation!]!
    getConversation(participantId: ID!): Conversation
    getMessages(conversationId: ID!, limit: Int = 50, offset: Int = 0): [Message!]!
    getUnreadMessagesCount: Int!
  }

  type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    markMessageAsRead(messageId: ID!): Message!
    markConversationAsRead(conversationId: ID!): Boolean!
    deleteMessage(messageId: ID!): Boolean!
  }

  type Subscription {
    messageReceived(userId: ID!): Message!
    messageRead(conversationId: ID!): Message!
  }
`;