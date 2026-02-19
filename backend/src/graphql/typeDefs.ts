import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    hello: String!
    dbTime: String!
  }

  type Mutation {
    add(a: Int!, b: Int!): Int!
  }
`;