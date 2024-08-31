import { gql } from 'apollo-server-express';

const blogTypeDefs = gql`
  type Blog {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    likes: [User!]
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

  extend type Mutation {
    createBlog(title:String!, content: String!): Blog!
    updateBlog(id: ID!,title:String!, content: String! ): Blog!
    deleteBlog(id: ID!): Boolean!
    likeBlog(blogId: ID!,userId: ID): Blog!
  }
`;

export { blogTypeDefs };
