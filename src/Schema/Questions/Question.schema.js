import { gql } from "apollo-server-express";

const questionTypeDefs = gql`
type Answer {
    id: ID!
    content: String!
    author: User
    createdAt: String!
    updatedAt: String!
    questionId: ID!
    upvotes: [User!]!
    downvotes: [User!]!
    isAccepted: Boolean!
}
type User {
    id: ID!
    username: String!
    profilePicture: String!
}
type Question {
    id: ID!
    title: String!
    content: String!
    tags: [String!]!
    author: User
    upvotes: [User!]!
    downvotes: [User!]!
    views: Int
    createdAt: String
    updatedAt: String
    answers: [Answer]
    isBookmarked: Boolean
  }

type Bookmark {
    id: ID!
    user: User!
    question: Question!
    createdAt: String!
}

extend type Query {
  getQuestions(limit: Int!, offset: Int!): QuestionsResponse!
  getQuestionById(id: ID!): Question!
  searchQuestions(searchTerm: String, limit: Int!, offset: Int!,tags: [String], userId: ID): QuestionsResponse!
  getUserBookmarks(limit: Int!, offset: Int!): BookmarksResponse!
  isQuestionBookmarked(questionId: ID!): Boolean!
}

type QuestionsResponse {
  questions: [Question!]!
  totalQuestions: Int!
  totalPages: Int!
}

type BookmarksResponse {
  bookmarks: [Bookmark!]!
  totalBookmarks: Int!
  totalPages: Int!
}
extend type Mutation {
    createQuestion(title: String!, content: String!, tags: [String!]!): Question!
    updateQuestion(id: ID!, title: String, content: String, tags: [String]): Question!
    deleteQuestion(id: ID!): Boolean!
    upvoteQuestion(id: ID!): Question!
    downvoteQuestion(id: ID!): Question!
    createAnswer(content: String!, questionId: ID!): Answer!
    updateAnswer(id: ID!, content: String): Answer!
    deleteAnswer(id: ID!): Boolean!
    upvoteAnswer(id: ID!): Answer!
    downvoteAnswer(id: ID!): Answer!
    acceptAnswer(id: ID!): Answer!
    bookmarkQuestion(questionId: ID!): Bookmark!
    removeBookmark(questionId: ID!): Boolean!
    }
`;
export { questionTypeDefs };