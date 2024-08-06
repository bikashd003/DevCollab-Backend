import  { gql } from 'apollo-server-express'; 

const contactTypeDefs = gql`
  type Contact {
    id: ID!
    phoneNumber: String
    state: String
    city: String
    country: String
    pincode: Int
  }

  extend type Query {
    contacts: [Contact]
    contact(id: ID!): Contact
  }

  extend type Mutation {
    createContact(phoneNumber: String, state: String, city: String, country: String, pincode:Int): Contact
    updateContact(id: ID!, phoneNumber: String, state: String, city: String, country: String, pincode:Int): Contact
    deleteContact(id: ID!): Contact
  }
`;

export {contactTypeDefs};
