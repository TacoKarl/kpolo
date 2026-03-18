import { gql } from "graphql-tag";

export const typeDefs = gql`
    type Query {
        hello: String!
        
        dbTime: String!
        
        tournaments: [Tournament!]!
    
        clubs: [Club!]!
        club(id: ID!): Club
        team(id: ID!): Team
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
        members: [User!]!
    }

    type Team {
        id: ID!
        name: String!
        club: Club!
        members: [User!]!
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
    updateClub(id: Int!, name: String, address: String, region: String): Club!
    createTeam(name: String!, clubId: Int!, memberIds: [Int!]!): Team!
    updateTeam(id: Int!, name: String, memberIds: [Int!]): Team!
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
