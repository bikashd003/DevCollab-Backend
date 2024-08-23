import { usersResolvers } from '../Resolver/Users.resolver.js';
import { skillResolvers } from '../Resolver/Skill.resolver.js';
import { socialLinkResolvers } from '../Resolver/SocialLinks.resolver.js';
import { projectResolvers } from '../Resolver/Project.resolver.js';
import { contactResolvers } from '../Resolver/Contact.resolver.js';
import { activityResolvers } from '../Resolver/Activities.resolver.js';
import { questionResolvers } from '../Resolver/Questions/Question.resolver.js';
const resolvers = {
  Query: {
    ...usersResolvers.Query,
    ...skillResolvers.Query,
    ...socialLinkResolvers.Query,
    ...contactResolvers.Query,
    ...activityResolvers.Query,
    ...projectResolvers.Query,
    ...questionResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...socialLinkResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...activityResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...questionResolvers.Mutation,
  },
};

export default resolvers;
