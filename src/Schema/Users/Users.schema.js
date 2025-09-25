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
    name: String
    email: String!
    profilePicture: String
    bio: String
    location: String
    company: String
    lastLogin: String
    isActive: Boolean
    githubId: String
    googleId: String
    socialLinks: [String]
    skills: [Skill!]
    contacts: [String]
    projects: [Project!]
    activities: [String]
    connections: [User!]
    isOnline: Boolean
    lastOnline: String
    role: String
    createdAt: String
    updatedAt: String
  }

 extend type Query {
    users: [User]
    user: User
    getCurrentUserId: ID
    getCurrentUser: User
  }

type DeleteAccountResponse {
  success: Boolean!
  message: String!
}

 extend type Mutation {
    createUser(username: String, email: String!, password: String!): User
    deleteUser(id: ID!): User
    deleteCurrentUserAccount: DeleteAccountResponse!
    updateUserProfilePicture(profilePicture: String!): User
    updateUserDetails(name: String, bio: String, location: String, company: String, socialLinks: [String], contacts: [String], activities: [String]): User
  }
`;

export { userTypeDefs };
