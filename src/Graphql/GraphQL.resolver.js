import { usersResolvers } from '../Resolver/Users/Users.resolver.js';
import { skillResolvers } from '../Resolver/Users/Skill.resolver.js';
import { socialLinkResolvers } from '../Resolver/Users/SocialLinks.resolver.js';
import { projectResolvers } from '../Resolver/Users/Project.resolver.js';
import { contactResolvers } from '../Resolver/Users/Contact.resolver.js';
import { activityResolvers } from '../Resolver/Users/Activities.resolver.js';
import { questionResolvers } from '../Resolver/Questions/Question.resolver.js';
import { blogResolvers } from '../Resolver/Blogs/Blogs.resolver.js';
import { editorResolvers } from '../Resolver/Editor/Editor.resolver.js';

const resolvers = {
  Query: {
    ...usersResolvers.Query,
    ...skillResolvers.Query,
    ...socialLinkResolvers.Query,
    ...contactResolvers.Query,
    ...activityResolvers.Query,
    ...projectResolvers.Query,
    ...questionResolvers.Query,
    ...blogResolvers.Query,
    ...editorResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...skillResolvers.Mutation,
    ...socialLinkResolvers.Mutation,
    ...contactResolvers.Mutation,
    ...activityResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...questionResolvers.Mutation,
    ...blogResolvers.Mutation,
    ...editorResolvers.Mutation,
  },
};

export default resolvers;
