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

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a project room
  socket.on('joinProject', async ({ projectId, userId }) => {
    socket.join(projectId);
    const user = await User.findById(userId);
    socket.data.username = user.username;
    socket.data.profilePicture = user.profilePicture;

    // Get all socket IDs in this room
    const socketIds = Array.from(io.sockets.adapter.rooms.get(projectId) || []);

    // Get user details for each connected socket
    const connectedUsers = await Promise.all(
      socketIds.map(async (socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        return { username: socket.data.username, profilePicture: socket.data.profilePicture };
      })
    );

    io.to(projectId).emit('connectedUsers', connectedUsers);
    console.log(`User ${socket.data.username} joined project: ${projectId}`);
  });

  // Handle code updates
  socket.on('codeUpdate', ({ projectId, code }) => {
    socket.to(projectId).emit('codeUpdate', code);
  });

  // Handle chat messages
  socket.on('chatMessage', ({ projectId, user, text }) => {
    io.to(projectId).emit('chatMessage', { id, user, text });

    Editor.findOneAndUpdate(
      { _id: projectId },
      { $push: { chatHistory: { username: user, message: text, timestamp: new Date() } } },
      { new: true }
    ).catch((err) => console.error('Error saving chat message:', err));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      const users = Array.from(io.sockets.adapter.rooms.get(room) || []);
      io.to(room).emit('connectedUsers', users);
    });
  });
});


// Apply Root middleware
Root(app);

// Start Apollo Server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDb();

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
      }
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
