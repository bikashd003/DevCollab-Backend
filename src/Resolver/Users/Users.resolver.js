import { AuthenticationError } from "apollo-server-express";
import { User } from "../../Models/Users/Users.model.js";
const usersResolvers = {
  Query: {
    users: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.find();
    },
    user: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const user = await User.findById(context.user._id)
        .populate('projects')
        .populate('skills')
        .lean();

      return user;
    },
    getCurrentUserId: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return context.user._id;
    },
    getCurrentUser: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const user = await User.findById(context.user._id)
        .populate('projects')
        .populate('skills')
        .lean();

      return user;
    }
  },
  Mutation: {
    createUser: async (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const newUser = new User(args);
      return await newUser.save();
    },
    deleteUser: async (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const deletedUser = await User.findByIdAndRemove(args.id);
      return deletedUser;
    },
    deleteCurrentUserAccount: async (_parent, _args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      try {
        const userId = context.user._id;

        // Find the user first to ensure they exist
        const user = await User.findById(userId);

        if (!user) {
          throw new Error('User not found');
        }

        // Note: In a production environment, you might want to:
        // 1. Delete related documents (skills, projects, etc.) if they're user-specific
        // 2. Update references in other collections
        // 3. Handle questions, answers, comments, etc.
        // For now, we'll just delete the user document

        // Delete the user account
        await User.findByIdAndDelete(userId);

        return {
          success: true,
          message: 'Account deleted successfully'
        };
      } catch (error) {
        console.error('Delete account error:', error);
        throw new Error('Failed to delete account: ' + error.message);
      }
    },
    updateUserProfilePicture: async (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedUser = await User.findByIdAndUpdate(context.user._id, { profilePicture: args.profilePicture }, { new: true });
      return updatedUser;
    },
    updateUserDetails: async (_parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedUser = await User.findByIdAndUpdate(context.user._id, args, { new: true });
      return updatedUser;
    }
  },
};

export { usersResolvers };