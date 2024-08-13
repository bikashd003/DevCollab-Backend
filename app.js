import express from 'express';
import dotenv from 'dotenv';
import connectDb from "./src/Config/DbConfig.js";
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './src/Graphql/GraphQL.schema.js';
import resolvers from './src/Graphql/GraphQL.resolver.js';
import Root from './src/Middleware/Root.middlleware.js';
import authMiddleware from './src/Middleware/Auth/Auth.middleware.js';
const app = express();
dotenv.config({ path: "./.env" });
// Start Apollo Server
const startServer = async () => {
  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      user: req.user,
    })
  });

  await server.start();
  app.use('/graphql', authMiddleware);
  // Apply Apollo middleware after other middlewares
  server.applyMiddleware({
    app,
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    }
  });
  // Connect to MongoDB and start the server
  try {
    await connectDb();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
      console.log(`GraphQL Playground available at http://localhost:${process.env.PORT}/graphql`);
    });
  } catch (err) {
    console.log('Error connecting to the database:', err);
  }
};

// Start the server
startServer();
Root(app);
export default app;
