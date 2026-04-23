import { gql } from "graphql-tag";

export const typeDefs = gql`
    #########################
    # QUERIES
    #########################
    type Query {
        hello: String!
        dbTime: String!
        me: Me
        tournaments: [Tournament!]!
        tournament(id: ID!): Tournament
        clubs(includeInactive: Boolean = false): [Club!]!
        club(id: ID!, includeInactive: Boolean = false): Club
        team(id: ID!, includeInactive: Boolean = false): Team
        matches(tournamentId: ID): [Match!]!
        match: [Match!]!
        users: [User!]!
    }
    
    #########################
    # TYPES
    #########################
    type Me {
        name: String!
        clubId: ID
        clubName: String
        roles: [String!]
    }
    
    type Tournament {
        id: Int!
        name: String!
        season: String!
        divisions: [Division!]
        teams: [TournamentTeam!]
        dates: [TournamentDate!]
        matches: [Match!]
    }

    type Division {
        id: Int!
        name: String!
        teams: [TournamentTeam!]
    }
    
    type Club {
        id: ID!
        name: String!
        isActive: Boolean!
        region: String!
        address: String!
        contact_info: String
        website: String
        teams(includeInactive: Boolean = false): [Team!]
        members: [User!]
    }

    type Team {
        id: ID!
        name: String!
        isActive: Boolean!
        club: Club!
        members: [User!]
    }

    type User {
        id: ID!
        name: String!
        email: String!
    }
    
    type TournamentTeam {
        id: Int!
        tournament: Tournament!
        team: Team!
        division: Division!
    }

    type TournamentDate {
        id: Int!
        tournament: Tournament!
        date: DateTime!
    }
    
    type Fine {
        id: Int!
        club_id Int!
        reason String!
        amount Int!
        date Datetime!
        paid Boolean!
    }

scalar DateTime

    type Match {
        id: Int!
        tournament: Tournament!
        division: Division
        team1: Team!
        team1_score: Int
        team2: Team!
        team2_score: Int
        winner_team: Team
        field:       Int
        match_date: String!
    }

    
    #########################
    # MUTATIONS
    #########################
    type Mutation {
        login(email: String!, password: String!): LoginResponse!
        register(email: String!, name: String!, password: String!): RegisterResponse!
        
        createClub(name: String!, address: String!, region: String!): Club!
        updateClub(id: Int!, name: String, address: String, region: String): Club!
        
        createTeam(name: String!, clubId: Int!, memberIds: [Int!]!): Team!
        updateTeam(id: Int!, name: String, memberIds: [Int!]): Team!

        setClubActive(id: Int!, isActive: Boolean!): Club!
        setTeamActive(id: Int!, isActive: Boolean!): Team!
        
        createTournament(input: CreateTournamentInput): Tournament!
        updateTournament(id: Int!, input: UpdateTournamentInput): Tournament!

        createMatches(matches: [CreateMatchInput!]): [Match!]
        updateMatches(matches: [UpdateMatchInput!]): [Match!]
        
        createTournamentDate(tournamentId: Int!, date: String!): TournamentDate!
        deleteTournamentDate(id: Int!): TournamentDate!
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
    
    ########################
    # INPUT
    ########################
    input DivisionInput {
        name: String!
    }

    input TournamentDateInput {
        date: String!
    }

    input TeamAssignmentInput {
        teamId: Int!
        divisionIndex: Int! # refererer til divisions array
    }

    input CreateTournamentInput {
        name: String!
        season: String!
        divisions: [DivisionInput!]
        dates: [TournamentDateInput!]
        teamAssignments: [TeamAssignmentInput!]
    }

    input UpdateTournamentInput {
        name: String
        season: String
        divisions: [DivisionInput!]
        dates: [TournamentDateInput!]
        teamAssignments: [TeamAssignmentInput!]
    }

    input CreateMatchInput {
        id:             Int
        tournament_id:  Int!
        division_id:    Int
        team1_id:       Int!
        team2_id:       Int!
        team1_score:    Int
        team2_score:    Int
        winner_team_id: Int
        field:          Int!
        match_date:     DateTime!
    }

    input UpdateMatchInput {
        id:             Int!
        tournament_id:  Int
        division_id:    Int
        team1_id:       Int
        team2_id:       Int
        team1_score:    Int
        team2_score:    Int
        winner_team_id: Int
        field:          Int
        match_date:     DateTime
    }

    input CreateFineInput {
        club_id Int!
        reason  String!
        amount  Int!
        date    DateTime!
        paid    Boolean!
    }
    
    input UpdateFineInput {
        id Int!
        club_id Int
        reason String
        amount Int
        paid Boolean
    }
    
`;