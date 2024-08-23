import  { gql } from 'apollo-server-express';
import { userTypeDefs } from '../Schema/Users.schema.js';
import { socialLinkTypeDefs } from '../Schema/SocialLinks.schema.js';
import { skillTypeDefs } from '../Schema/Skills.schema.js';
import { projectTypeDefs } from '../Schema/Project.schema.js';
import { contactTypeDefs } from '../Schema/Contact.schema.js';
import { activityTypeDefs } from '../Schema/Activities.schema.js';
import { questionTypeDefs } from '../Schema/Questions/Question.schema.js';

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
  questionTypeDefs
];

export default typeDefs;
