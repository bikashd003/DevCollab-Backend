import { gql } from 'apollo-server-express';

const skillTypeDefs = gql`
  type Skill {
    id: ID!
    title: String!
    proficiency: String
    category: String!
  }

  extend type Query {
    skills: [Skill]
    skill(id: ID!): Skill
  }

  extend type Mutation {
    createSkill(title: String!, proficiency: String,category: String): Skill
    updateSkill(id: ID!, title: String, proficiency: String,category:String): Skill
    deleteSkill(id: ID!): Skill
  }
`;

export {skillTypeDefs};
