import  { gql } from 'apollo-server-express';
import { userTypeDefs } from '../Schema/Users/Users.schema.js';
import { socialLinkTypeDefs } from '../Schema/Users/SocialLinks.schema.js';
import { skillTypeDefs } from '../Schema/Users/Skills.schema.js';
import { projectTypeDefs } from '../Schema/Users/Project.schema.js';
import { contactTypeDefs } from '../Schema/Users/Contact.schema.js';
import { activityTypeDefs } from "../Schema/Users/Activities.schema.js"
import { questionTypeDefs } from '../Schema/Questions/Question.schema.js';
import { blogTypeDefs } from '../Schema/Blogs/Blogs.schema.js';

const rootTypeDefs = gql`
  type Query
  type Mutation
`;

const typeDefs = [
  userTypeDefs,
  rootTypeDefs,
  skillTypeDefs,
  socialLinkTypeDefs,
  contactTypeDefs,
  activityTypeDefs,
  projectTypeDefs,
  questionTypeDefs,
  blogTypeDefs
];

export default typeDefs;
