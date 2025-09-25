import express from 'express';
import dotenv from 'dotenv';
import connectDb from "./src/Config/DbConfig.js";
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './src/Graphql/GraphQL.schema.js';
import resolvers from './src/Graphql/GraphQL.resolver.js';
import Root from './src/Middleware/Root.middlleware.js';
import authMiddleware from './src/Middleware/Auth/Auth.middleware.js';
import socketAuthMiddleware from './src/Middleware/Socket/SocketAuth.middleware.js';
import chalk from 'chalk';
import { Server } from "socket.io";
import http from 'http';
import Editor from './src/Models/Editor/Editor.model.js';
import { Message } from './src/Models/Messages/Message.model.js';
import { Conversation } from './src/Models/Messages/Conversation.model.js';
import { User } from './src/Models/Users/Users.model.js';
import codeExecutionRouter from './src/Routes/CodeExecution.route.js';
import messagesRouter from './src/Routes/Messages/Messages.route.js';

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.use(socketAuthMiddleware);
async function getConnectedUsers(roomId) {
  const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  const users = await Promise.all(
    socketIds.map(async (socketId) => {
      const socket = io.sockets.sockets.get(socketId);
      return {
        id: socket.data.userId,
        username: socket.data.username,
        profilePicture: socket.data.profilePicture
      };
    })
  );
  return users;
}
io.on('connection', async (socket) => {
  console.log(`Authenticated user connected: ${socket.user.username} (${socket.id})`);

  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastOnline: new Date()
  });

  socket.join(`user_${socket.userId}`);

  const user = await User.findById(socket.userId).populate('connections', '_id');
  user.connections.forEach(connection => {
    socket.to(`user_${connection._id}`).emit('userOnlineStatus', {
      userId: socket.userId,
      isOnline: true
    });
  });

  socket.on('joinProject', async ({ projectId }) => {
    socket.join(projectId);

    const userId = socket.userId;
    const user = socket.user;

    socket.data.userId = userId;
    socket.data.username = user.username;
    socket.data.profilePicture = user.profilePicture;

    const chatHistory = await Editor.findOne({ _id: projectId })
      .populate('chatHistory.username', 'username')
      .select('chatHistory -_id');

    socket.emit('chatHistory', chatHistory);

    const connectedUsers = await getConnectedUsers(projectId);
    io.to(projectId).emit('connectedUsers', connectedUsers);

    socket.to(projectId).emit('userJoined', {
      id: userId,
      username: user.username,
    });
  });


  socket.on('codeChange', async ({ projectId, changes }) => {
    const userId = socket.userId;

    if (changes && changes.length > 0) {
      const project = await Editor.findById(projectId);
      if (project) {
        project.code = changes[0].insert;
        await project.save();
      }
    }

    socket.to(projectId).emit('codeChange', {
      userId,
      changes
    });
  });



  socket.on('userLeft', async ({ projectId }) => {
    const userId = socket.userId;
    socket.to(projectId).emit('userLeft', userId);
    const connectedUsers = await getConnectedUsers(projectId);
    io.to(projectId).emit('connectedUsers', connectedUsers);
  });

  socket.on('languageChanged', async ({ projectId, language }) => {
    const userId = socket.userId;
    const project = await Editor.findById(projectId);
    if (project) {
      project.language = language;
      await project.save();
    }
    socket.to(projectId).emit('languageChanged', { userId, language });
  });

  socket.on('outputChanged', async ({ projectId, output }) => {
    const project = await Editor.findById(projectId);
    if (project) {
      project.lastOutput = output;
      await project.save();
    }
    io.to(projectId).emit('outputChanged', output);
  });


  socket.on('requestInitialCode', async (projectId) => {
    const project = await Editor.findById(projectId);
    if (project) {
      socket.emit('initialCode', {
        code: project.code || '',
        language: project.language || 'javascript',
        version: project.version || 0,
        lastOutput: project.lastOutput || { output: '', error: null, executionTime: 0 },
      });
    }
  });

  socket.on('chatMessage', async ({ projectId, text }) => {
    const userId = socket.userId;
    const user = socket.user;

    io.to(projectId).emit('chatMessage', {
      username: { username: user.username },
      message: text,
      timestamp: new Date()
    });

    Editor.findOneAndUpdate(
      { _id: projectId },
      { $push: { chatHistory: { username: userId, message: text, timestamp: new Date() } } },
      { new: true }
    ).catch((err) => console.error('Error saving chat message:', err));
  });
  socket.on('typing', ({ projectId }) => {
    const username = socket.data.username;
    socket.to(projectId).emit('userTyping', username);
  });

  socket.on('stopTyping', ({ projectId }) => {
    const username = socket.data.username;
    socket.to(projectId).emit('userStoppedTyping', username);
  });

  socket.on('joinUserRoom', () => {
    socket.join(`user_${socket.userId}`);
    console.log(`User ${socket.user.username} joined personal room: user_${socket.userId}`);
  });

  socket.on('sendDirectMessage', async ({ receiverId, message }) => {
    try {
      io.to(`user_${receiverId}`).emit('newMessage', {
        id: message.id,
        senderId: socket.userId,
        senderUsername: socket.user.username,
        senderProfilePicture: socket.user.profilePicture,
        content: message.content,
        createdAt: message.createdAt,
        conversationId: message.conversationId
      });

      socket.emit('messageSent', { messageId: message.id });
    } catch (error) {
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('markMessageRead', ({ messageId, senderId }) => {
    io.to(`user_${senderId}`).emit('messageRead', { messageId });
  });

  socket.on('userTypingMessage', ({ receiverId }) => {
    io.to(`user_${receiverId}`).emit('userTypingMessage', {
      userId: socket.userId,
      username: socket.user.username
    });
  });

  socket.on('userStoppedTypingMessage', ({ receiverId }) => {
    io.to(`user_${receiverId}`).emit('userStoppedTypingMessage', {
      userId: socket.userId
    });
  });

  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);

    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastOnline: new Date()
      });

      const user = await User.findById(socket.userId).populate('connections', '_id');
      if (user) {
        user.connections.forEach(connection => {
          socket.to(`user_${connection._id}`).emit('userOnlineStatus', {
            userId: socket.userId,
            isOnline: false
          });
        });
      }
    }

    const rooms = Array.from(socket.rooms);

    for (const room of rooms) {
      const connectedUsers = await getConnectedUsers(room);
      io.to(room).emit('connectedUsers', connectedUsers);
      if (socket.data.userId) {
        io.to(room).emit('userLeft', socket.data.userId);
      }
    }
  });
});

Root(app);


const startServer = async () => {
  try {
    await connectDb();
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.use('/api', codeExecutionRouter);
    app.use('/api/messages', messagesRouter);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        user: req.user,
      }),
      formatError: (error) => {
        // Log errors here
        console.log(chalk.red(`GraphQL Error: ${error.message}`));
        return error;
      },
    });

    await server.start();

    app.use('/graphql', authMiddleware);

    server.applyMiddleware({
      app,
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
      path: '/graphql' // Explicitly set the path
    });

    app.use((req, res, next) => {
      res.status(404).json({ error: 'Not Found' });
    });

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
