import { Activity } from "../../Models/Users/Activities.model.js";

const activityResolvers = {
  Query: {
    activities: async () => await Activity.find(),
    activity: async (parent, args) => await Activity.findById(args.id),
  },
  Mutation: {
    createActivity: async (parent, args) => {
      const newActivity = new Activity(args);
      return await newActivity.save();
    },
    updateActivity: async (parent, args) => {
      const updatedActivity = await Activity.findByIdAndUpdate(args.id, args, { new: true });
      return updatedActivity;
    },
    deleteActivity: async (parent, args) => {
      const deletedActivity = await Activity.findByIdAndRemove(args.id);
      return deletedActivity;
    },
  },
};

export { activityResolvers };
