import { Project } from "../Models/Users/Projects.model.js";
const projectResolvers = {
  Query: {
    projects: async () => await Project.find(),
    project: async (parent, args) => await Project.findById(args.id),
  },
  Mutation: {
    createProject: async (parent, args) => {
      const newProject = new Project(args);
      return await newProject.save();
    },
    updateProject: async (parent, args) => {
      const updatedProject = await Project.findByIdAndUpdate(args.id, args, { new: true });
      return updatedProject;
    },
    deleteProject: async (parent, args) => {
      const deletedProject = await Project.findByIdAndRemove(args.id);
      return deletedProject;
    },
  },
};

export {projectResolvers};
