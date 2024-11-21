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
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    const users = Array.from(io.sockets.adapter.rooms.get(projectId) || [])
    io.to(projectId).emit('connectedUsers', users)
    console.log(`User joined project: ${projectId}`);
  });

  // Handle code updates
  socket.on('codeUpdate', ({ projectId, code }) => {
    socket.to(projectId).emit('codeUpdate', code);
  });

  // Handle chat messages
  socket.on('chatMessage', ({ projectId, id, user, text }) => {
    io.to(projectId).emit('chatMessage', { id, user, text });

    // Save the chat message to the database (optional)
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
