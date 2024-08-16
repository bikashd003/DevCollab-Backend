import { Project } from "../Models/Users/Projects.model.js";
import { User } from "../Models/Users/Users.model.js";
const projectResolvers = {
  Query: {
    projects: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Project.find();
    },
    project: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await Project.findById(args.id);
    }
  },
  Mutation: {
    createProject: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const newProject = new Project(args);
      await User.findByIdAndUpdate(context.user.id, { $push: { projects: newProject._id } });
      return await newProject.save();
    },
    updateProject: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const updatedProject = await Project.findByIdAndUpdate(args.id, args, { new: true });
      if (!updatedProject) {
        throw new Error('Project not found');
      }
      return updatedProject;
    },
    deleteProject: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      const deletedProject = await Project.findByIdAndRemove(args.id);
      if (!deletedProject) {
        throw new Error('Project not found');
      }
      await User.findByIdAndUpdate(context.user.id, { $pull: { projects: args.id } });
      return deletedProject;
    },
  },
};

export {projectResolvers};
