import { AuthenticationError } from "apollo-server-express";
import { User } from "../Models/Users/Users.model.js";
const usersResolvers = {
    Query: {
      users: async (parent, args, context) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }
        return await User.find();
      },
      user: async (parent, args,context) => {
        if (!context.user) {
          throw new AuthenticationError('You must be logged in');
        }
        return await User.findById(args.id);
      },
    },
    Mutation: {
      createUser: async (parent, args) => {
        const newUser = new User(args);
        return await newUser.save();
      },
      deleteUser: async (parent, args) => {
        const deletedUser = await User.findByIdAndRemove(args.id);
        return deletedUser;
      },
    },
  };

  export {usersResolvers};