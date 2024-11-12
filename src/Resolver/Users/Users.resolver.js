import { AuthenticationError } from "apollo-server-express";
import { User } from "../../Models/Users/Users.model.js";
const usersResolvers = {
  Query: {
    users: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.find();
    },
    user: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const user = await User.findById(context.user._id)
        .populate('projects')
        .populate('skills')
        .lean();

      return user;
    },
    getCurrentUserId: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return context.user._id;
    }
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const newUser = new User(args);
      return await newUser.save();
    },
    deleteUser: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const deletedUser = await User.findByIdAndRemove(args.id);
      return deletedUser;
    },
    updateUserProfilePicture: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedUser = await User.findByIdAndUpdate(context.user._id, { profilePicture: args.profilePicture }, { new: true });
      return updatedUser;
    },
  },
};

export { usersResolvers };