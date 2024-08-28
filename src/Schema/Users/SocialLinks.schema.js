import pkg from 'apollo-server-express';
const {gql} = pkg;
const socialLinkTypeDefs = gql`
  type SocialLink {
    id: ID!
    name: String!
    link: String!
  }

  extend type Query {
    socialLinks: [SocialLink]
    socialLink(id: ID!): SocialLink
  }

  extend type Mutation {
    createSocialLink(name: String!, link: String!): SocialLink
    updateSocialLink(id: ID!, name: String, link: String): SocialLink
    deleteSocialLink(id: ID!): SocialLink
  }
`;

export {socialLinkTypeDefs};
