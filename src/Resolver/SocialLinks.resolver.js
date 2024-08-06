import { SocialLink } from "../Models/Users/SocialLinks.model.js";

const socialLinkResolvers = {
  Query: {
    socialLinks: async () => await SocialLink.find(),
    socialLink: async (parent, args) => await SocialLink.findById(args.id),
  },
  Mutation: {
    createSocialLink: async (parent, args) => {
      const newSocialLink = new SocialLink(args);
      return await newSocialLink.save();
    },
    updateSocialLink: async (parent, args) => {
      const updatedSocialLink = await SocialLink.findByIdAndUpdate(args.id, args, { new: true });
      return updatedSocialLink;
    },
    deleteSocialLink: async (parent, args) => {
      const deletedSocialLink = await SocialLink.findByIdAndRemove(args.id);
      return deletedSocialLink;
    },
  },
};

export {socialLinkResolvers};
