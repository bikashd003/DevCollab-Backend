import { gql } from 'apollo-server-express';

const blogTypeDefs = gql`
  type Blog {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    likes: [User!]
    dislikes: [User!]
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getBlogs: [Blog!]!
    getBlogById(id: ID!): Blog
  }

  input CreateBlogInput {
    title: String!
    content: String!
    authorId: ID!
  }

  input UpdateBlogInput {
    title: String
    content: String
    authorId: ID
  }

  extend type Mutation {
    createBlog(input: CreateBlogInput!): Blog!
    updateBlog(id: ID!, input: UpdateBlogInput!): Blog!
    deleteBlog(id: ID!): Boolean!
  }
`;

export { blogTypeDefs };
