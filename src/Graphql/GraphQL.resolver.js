import { skillResolvers } from '../Resolver/Skill.resolver.js';
import { socialLinkResolvers } from '../Resolver/SocialLinks.resolver.js';
import { projectResolvers } from '../Resolver/Project.resolver.js';
import { contactResolvers } from '../Resolver/Contact.resolver.js';
import { activityResolvers } from '../Resolver/Activities.resolver.js';
const resolvers = {
  Query: {
    ...skillResolvers.Query,
    ...socialLinkResolvers.Query,
    ...contactResolvers.Query,
    ...activityResolvers.Query,
    ...projectResolvers.Query,
  },
  Mutation: {
    ...skillResolvers.Mutation,
    ...socialLinkResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...activityResolvers.Mutation,
    ...projectResolvers.Mutation,
  },
};

export default resolvers;
