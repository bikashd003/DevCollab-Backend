import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env` });
import connectDb from './Config/DbConfig.js';
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './Graphql/GraphQL.schema.js';
import resolvers from './Graphql/GraphQL.resolver.js';
import Root from './Middleware/Root.middlleware.js';
import authMiddleware from './Middleware/Auth/Auth.middleware.js';
const app = express();
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
