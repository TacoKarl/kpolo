import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Query {
    hello: String!
    dbTime: String!
    tournaments: [Tournament!]!
  }

  type Tournament {
    id: Int!
    name: String!
    season: String!
  }

  type Mutation {
    add(a: Int!, b: Int!): Int!
    login(email: String!, password: String!): LoginResponse!
    register(email: String!, name: String!, password: String!): RegisterResponse!
  }
  type LoginResponse {
    token: String!
    userId: Int!
    name: String!
  }
  
  type RegisterResponse {
    id: Int!
    name: String!
    email: String!
  }
`;