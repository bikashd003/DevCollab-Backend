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
  getQuestions(limit: Int!, offset: Int!): QuestionsResponse!
  getQuestion(id: ID!): Question!
  searchQuestions(searchTerm: String, limit: Int!, offset: Int!,tags: [String], userId: ID): QuestionsResponse!
}

type QuestionsResponse {
  questions: [Question!]!
  totalQuestions: Int!
  totalPages: Int!
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