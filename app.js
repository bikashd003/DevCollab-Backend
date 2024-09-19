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

dotenv.config({ path: "./.env" });

const app = express();
const httpServer = http.createServer(app);

// Socket.IO setup
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('codeChange', (code) => {
    socket.broadcast.emit('codeChange', code);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
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
