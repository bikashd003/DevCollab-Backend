import pkg from 'apollo-server-express';
const { gql } = pkg;
const userTypeDefs = gql`
type Skill {
  id: ID!
  title: String!
  proficiency: Int!
}
type Project {
  id: ID!
  title: String!
  description: String!
  imageUrl: String
  projectLink: String
}
type User {
    id: ID!
    username: String
    email: String!
    profilePicture: String
    bio:String
    lastLogin: String
    isActive:Boolean
    githubId: String
    googleId: String
    socialLinks: [String]
    skills: [Skill!]
    contacts: [String]
    projects: [Project!]
    activities: [String]
    role: String
    createdAt: String
    updatedAt: String
  }

 extend type Query {
    users: [User]
    user: User
    getCurrentUserId: ID
  }

 extend type Mutation {
    createUser(username: String, email: String!, password: String!): User
    deleteUser(id: ID!): User
  }
`;

export { userTypeDefs };
