import { User } from "../Models/Users/Users.model.js";
const usersResolvers = {
    Query: {
      users: async () => await User.find(),
      user: async (parent, args) => await User.findById(args.id),
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