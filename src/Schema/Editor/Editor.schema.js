import { gql } from 'apollo-server-express';

const editorTypeDefs = gql`
type User {
    id: ID!
    username: String!
    profilePicture: String!
}
type ChatMessage {
    username: User!
    message: String!
    timestamp: String!
}
type Editor {
    id: ID!
    title: String!
    code: String!
    createdBy: User!
    chatHistory: [ChatMessage!]!
}
extend type Query {
    getEditorById(id: ID!): Editor!
}
extend type Mutation {
    createEditor(title: String!): Editor!
    updateEditor(id: ID!, code: String!): Editor!
    deleteEditor(id: ID!): Boolean!
}
`;

export { editorTypeDefs };