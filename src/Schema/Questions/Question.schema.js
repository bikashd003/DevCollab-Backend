import { gql } from "apollo-server-express";

const questionTypeDefs = gql`
type Question {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    author: User!
    upvotes: [User!]!
    downvotes: [User!]!
    viwes: Int!
    createdAt: String!
    updatedAt: String!
  }
    extend type Query {
        getQuestions: [Question!]!
        getQuestion(id: ID!): Question!
    }
        extend type Mutation {
            createQuestion(title: String!, content: String!, tags: [String!]!): Question!
            updateQuestion(id: ID!, title: String, content: String, tags: [String]): Question!
            deleteQuestion(id: ID!): Boolean!
            upvoteQuestion(id: ID!): Question!
            downvoteQuestion(id: ID!): Question!
        }
`;
export { questionTypeDefs };