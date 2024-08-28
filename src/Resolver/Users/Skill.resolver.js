import { Skill } from "../../Models/Users/Skills.model.js";
import { User } from "../../Models/Users/Users.model.js";

const skillResolvers = {
  Query: {
    skills: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Skill.find()
    },
    skill: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Skill.findById(args.id)
    }
  },
  Mutation: {
    createSkill: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const newSkill = new Skill(args);
      await User.findByIdAndUpdate(context.user.id, { $push: { skills: newSkill._id } });
      return await newSkill.save();
    },
    updateSkill: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedSkill = await Skill.findByIdAndUpdate(args.id, args, { new: true });
      if (!updatedSkill) {
        throw new Error('Skill not found');
      }
      return updatedSkill;
    },
    deleteSkill: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const deletedSkill = await Skill.findByIdAndRemove(args.id);
      if (!deletedSkill) {
        throw new Error('Skill not found');
      }
      await User.findByIdAndUpdate(context.user.id, { $pull: { skills: args.id } });
      return deletedSkill;
    },
  },
};

export { skillResolvers };
