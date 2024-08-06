import { Skill } from "../Models/Users/Skills.model.js";

const skillResolvers = {
  Query: {
    skills: async () => await Skill.find(),
    skill: async (parent, args) => await Skill.findById(args.id),
  },
  Mutation: {
    createSkill: async (parent, args) => {
      const newSkill = new Skill(args);
      return await newSkill.save();
    },
    updateSkill: async (parent, args) => {
      const updatedSkill = await Skill.findByIdAndUpdate(args.id, args, { new: true });
      return updatedSkill;
    },
    deleteSkill: async (parent, args) => {
      const deletedSkill = await Skill.findByIdAndRemove(args.id);
      return deletedSkill;
    },
  },
};

export  {skillResolvers};
