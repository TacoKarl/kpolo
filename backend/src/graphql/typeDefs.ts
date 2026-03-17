import { gql } from "graphql-tag";

export const typeDefs = gql`
    type Query {
        hello: String!
        
        dbTime: String!
        
        tournaments: [Tournament!]!
    
        clubs: [Club!]!
        club(id: ID!): Club
        users: [User!]!
    }
    
    type Tournament {
        id: Int!
        name: String!
        season: String!
    }
    
    type Club {
        id: ID!
        name: String!
        region: String!
        address: String!
        contact_info: String
        website: String
        teams: [Team!]!
    }

    type Team {
        id: ID!
        name: String!
    }

    type User {
        id: ID!
        name: String!
        email: String!
    }

  type Mutation {
    add(a: Int!, b: Int!): Int!
    login(email: String!, password: String!): LoginResponse!
    register(email: String!, name: String!, password: String!): RegisterResponse!
    createClub(name: String!, address: String!, region: String!, managerEmail: String!): Club!
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
