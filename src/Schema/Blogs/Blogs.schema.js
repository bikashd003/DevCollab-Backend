import { gql } from 'apollo-server-express';

const blogTypeDefs = gql`
type Comment {
  id: ID!
  content: String!
  author: User!
  likes: [User!]!
  createdAt: String!
  updatedAt: String!
}
  type Blog {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    author: User!
    comments: [Comment!]!
    likes: [User!]!
    createdAt: String!
    updatedAt: String!
  }
type PopularTag {
  tag: String!
  count: Int!
}

extend type Query {
  getPopularTags: [PopularTag!]!
}

  extend type Query {
    getBlogs: [Blog!]!
    getBlogById(id: ID!): Blog
    topContributors: [User!]!
  }

  extend type Mutation {
    createBlog(title: String!, content: String!, tags: [String!]!): Blog!
    updateBlog(id: ID!, title: String!, content: String!, tags: [String!]!): Blog!
    deleteBlog(id: ID!): Boolean!
    likeBlog(id: ID!): Blog!
    createComment(content: String!, blogId: ID!): Comment!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): Boolean!
    likeComment(id: ID!): Comment!
  }
`;

export { blogTypeDefs };
