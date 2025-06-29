import express from 'express';
import dotenv from 'dotenv';
import connectDb from "./src/Config/DbConfig.js";
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './src/Graphql/GraphQL.schema.js';
import resolvers from './src/Graphql/GraphQL.resolver.js';
import Root from './src/Middleware/Root.middlleware.js';
import authMiddleware from './src/Middleware/Auth/Auth.middleware.js';
import chalk from 'chalk';
import { Server } from "socket.io";
import http from 'http';
import Editor from './src/Models/Editor/Editor.model.js';
import { User } from './src/Models/Users/Users.model.js';
import codeExecutionRouter from './src/Routes/CodeExecution.route.js';

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = http.createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
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
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a project room
  socket.on('joinProject', async ({ projectId, userId }) => {
    socket.join(projectId);
    const user = await User.findById(userId);
    socket.data.userId = userId; 
    socket.data.username = user?.username;
    socket.data.profilePicture = user?.profilePicture;

    // Get chat history and emit only to the joining socket
    const chatHistory = await Editor.findOne({ _id: projectId })
      .populate('chatHistory.username', 'username')
      .select('chatHistory -_id');

    // Emit chat history only to the joining user
    socket.emit('chatHistory', chatHistory);

    // Get and emit connected users
    const connectedUsers = await getConnectedUsers(projectId);
    io.to(projectId).emit('connectedUsers', connectedUsers);

    // Notify others that a user joined
    socket.to(projectId).emit('userJoined', {
      id: userId,
      username: user?.username,
    });
  });


  // Handle code changes
  socket.on('codeChange', async ({ projectId, userId, changes }) => {
    // Save to database
    if (changes && changes.length > 0) {
      const project = await Editor.findById(projectId);
      if (project) {
        project.code = changes[0].insert;
        await project.save();
      }
    }
    
    // Broadcast to all other clients except sender
    socket.to(projectId).emit('codeChange', {
      userId,
      changes
    });
  });



  socket.on('userLeft', async ({ projectId, userId }) => {
    socket.to(projectId).emit('userLeft', userId);
    const connectedUsers = await getConnectedUsers(projectId);
    io.to(projectId).emit('connectedUsers', connectedUsers);
  });

  // Handle language changes
  socket.on('languageChanged', async ({ projectId, userId, language }) => {
    const project = await Editor.findById(projectId);
    if (project) {
      project.language = language;
      await project.save();
    }
    // Broadcast to others
    socket.to(projectId).emit('languageChanged', { userId, language });
  });

  // Handle collaborative output
  socket.on('outputChanged', async ({ projectId, output }) => {
    const project = await Editor.findById(projectId);
    if (project) {
      project.lastOutput = output;
      await project.save();
    }
    io.to(projectId).emit('outputChanged', output);
  });


  // Handle initial code state
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

  // Handle chat messages
  socket.on('chatMessage', async ({ projectId, user, text }) => {
    // Get user details
    const userDetails = await User.findById(user).select('username');

    // Emit message with proper structure
    io.to(projectId).emit('chatMessage', {
      username: userDetails,
      message: text,
      timestamp: new Date()
    });

    // Save to database
    Editor.findOneAndUpdate(
      { _id: projectId },
      { $push: { chatHistory: { username: user, message: text, timestamp: new Date() } } },
      { new: true }
    ).catch((err) => console.error('Error saving chat message:', err));
  });
  socket.on('typing', ({ projectId }) => {
    // Get username from socket or user data
    const username = socket.data.username;
    socket.to(projectId).emit('userTyping', username);
  });

  socket.on('stopTyping', ({ projectId }) => {
    const username = socket.data.username;
    socket.to(projectId).emit('userStoppedTyping', username);
  });
  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);

    // Get all rooms this socket was in
    const rooms = Array.from(socket.rooms);

    for (const room of rooms) {
      // Get updated list of connected users for the room
      const connectedUsers = await getConnectedUsers(room);
      io.to(room).emit('connectedUsers', connectedUsers);
      // Notify others that a user left
      if (socket.data.userId) {
        io.to(room).emit('userLeft', socket.data.userId);
      }
    }
  });
});


// Apply Root middleware
Root(app);

// Start Apollo Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDb();

    // Apply REST API routes before Apollo
    app.use('/api', codeExecutionRouter);

    // Apollo Server setup
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

    // Apply auth middleware
    app.use('/graphql', authMiddleware);

    // Apply Apollo middleware
    server.applyMiddleware({
      app,
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
      path: '/graphql' // Explicitly set the path
    });

    // Error handling for undefined routes - must be after all other routes
    app.use((req, res, next) => {
      res.status(404).json({ error: 'Not Found' });
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
