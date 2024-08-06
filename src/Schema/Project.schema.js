import { gql } from 'apollo-server-express';

const projectTypeDefs = gql`
  type Project {
    id: ID!
    title: String!
    description: String
    image: String
    link: String!
  }

  extend type Query {
    projects: [Project]
    project(id: ID!): Project
  }

  extend type Mutation {
    createProject(title: String!, description: String, image: String,link: String!): Project
    updateProject(id: ID!, title: String, description: String, image: String,link: String!): Project
    deleteProject(id: ID!): Project
  }
`;

export {projectTypeDefs};
