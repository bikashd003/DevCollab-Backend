import { gql } from 'apollo-server-express';

const skillTypeDefs = gql`
  type Skill {
    id: ID!
    title: String!
    proficiency: Int
  }

  extend type Query {
    skills: [Skill]
    skill(id: ID!): Skill
  }

  extend type Mutation {
    createSkill(title: String!, proficiency: Int): Skill
    updateSkill(id: ID!, title: String, proficiency: Int): Skill
    deleteSkill(id: ID!): Skill
  }
`;

export {skillTypeDefs};
