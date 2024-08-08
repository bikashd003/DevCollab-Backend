import pkg from 'apollo-server-express';
const {gql} = pkg;
const userTypeDefs = gql`
type User {
    id: ID!
    username: String!
    email: String!
    profilePicture: String
    bio:String
    lastLogin: String
    isActive:Boolean
    githubId: String
    googleId: String
    socialLinks: [String]
    skills: [String]
    contacts: [String]
    projects: [String]
    activities: [String]
    role: String
    createdAt: String
    updatedAt: String
  }

 extend type Query {
    users: [User]
    user(id: ID!): User
  }

 extend type Mutation {
    createUser(username: String!, email: String!, password: String!): User
    deleteUser(id: ID!): User
  }
`;

export {userTypeDefs};
