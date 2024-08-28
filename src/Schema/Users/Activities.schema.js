import pkg from 'apollo-server-express';
const {gql} = pkg;
const activityTypeDefs = gql`
  type Activity {
    id: ID!
    title: String!
    description: String
    date: String
  }

  extend type Query {
    activities: [Activity]
    activity(id: ID!): Activity
  }

  extend type Mutation {
    createActivity(title: String!, description: String,date: String): Activity
    updateActivity(id: ID!, title: String,description: String, date: String): Activity
    deleteActivity(id: ID!): Activity
  }
`;

export {activityTypeDefs};
