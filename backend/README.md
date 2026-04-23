# Design

Vores backend er designet ud fra valg vi har taget med db, api endpoint og ER-Diagrammer.

## DB

Til vores db er der valgt postgresql, da vi arbejder med relationelle data. Der skal ikke være for 
mange alterationer af vores modeller, og modeller skal følge de skemaer vi har besluttet. Der skal
ikke kunne tilføjes noget til en entity, som en anden måske ikke har. Derfor er der ikke valgt NoSQL 
men en SQL database. Postgres er valgt da den følger ACID-principper meget striks

## API

CREATE TABLE public.users
(
id serial NOT NULL,
email text NOT NULL UNIQUE,
password_hash text NOT NULL,
role text[] DEFAULT ARRAY['user'],
PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.users
OWNER to postgres;

## ER-Diagram

Vores backend er designet med dette ER-Diagram.


```mermaid
---
title: ER-Diagram V1
---
erDiagram
    Direction LR
    User }|--|| Club : belongs_to
    User }o--o{ Role : has
    Club ||--o{ Team : has
    Tournament ||--o{ Match : has
    Team }|--o{ Match : "NOTE: Always has 2 teams"
    TeamMembership }o--|| User : has
    TeamMembership }o--|| Team : has 
    
    User {
        int id
        string name
        int club_id
    }
    Role {
        int id
        string role
    }
    Club {
        int id
        string name
        int user_manager_id
        string city
    }
    Tournament {
        int id
        string season
    }
    Match {
        int id
        int team1_id
        int team2_id
        int team1_score
        int team2_score
        int winner_team_id
        datetime match_date
    }
    Team {
        int id
        int club_id
        string name
    }
    TeamMembership {
        int user_id
        int team_id
        datetime from_date
        datetime to_date
    }
```






```mermaid
---
title: ER-Diagram V2
---
erDiagram
    Direction TB
    User }|--|| Club : belongs_to
    User }o--o{ Role : has
    User ||--o{ TeamMembership : has
    User ||--o{ RefreshToken : has
    User || -- o{ TournamentTeamUser : in 
    Club ||--o{ ClubLogo : has
    Club ||--o{ Team : has
    Team ||--o{ TeamMembership : has
    Team ||--o{ TeamLogo : has
    Tournament ||--o{ Match : has
    Tournament ||--o{ TournamentTeam : has
    TournamentTeam }o--|| Team : is
    TournamentTeam ||--o{ TournamentTeamUser : has 
    Match }o--|{ TournamentTeam : "NOTE: Always has 2 teams"
    
    User {
        int id
        string name
        string password_hash
        int club_id
    }

    RefreshToken {
        int id
        string token_hash
        int user_id
        text device_id
        datetime created_at
        datetime expires_at
    }

    Role {
        int id
        string role
    }

    Club {
        int id
        string name
        string region
        string address
        string contact_email
        bool is_active
    }

    ClubLogo {
        int id
        int club_id
        blob logo
        datetime valid_from
        datetime valid_to
    }

    Tournament {
        int id
        string season
    }

    Match {
        int id
        int tournament_team1_id
        int tournament_team2_id
        int team1_score
        int team2_score
        int winner_tournament_team_id
        datetime match_date
    }
    Team {
        int id
        int club_id
        string name
        bool is_active
    }

    TeamLogo {
        int id
        int team_id
        blob logo
        datetime valid_from
        datetime valid_to
    }

    TeamMembership {
        int user_id
        int team_id
        datetime valid_from
        datetime valid_to
    }

    TournamentTeam {
        int id
        int tournament_id
        int team_id
    }

    TournamentTeamUser{
        int id
        int tournament_team_id
        int user_id
        int player_nr
    }

```

```mermaid
---
title: ER-Diagram V3
---
erDiagram
    Direction TB
    User }|--|| Club : belongs_to
    User }o--o{ Role : has
    User ||--o{ TeamMembership : has
    User ||--o{ RefreshToken : has
    Club ||--o{ ClubLogo : has
    Club ||--o{ Team : has
    Team ||--o{ TeamMembership : has
    Team ||--o{ TeamLogo : has
    Tournament ||--o{ Division : has
    Tournament ||--o{ TournamentDate : has
    TournamentTeam }o--|| Team : is
    Match }o--|{ TournamentTeam : "NOTE: Always has 2 teams"
    Division ||--o{ TournamentTeam : has
    Division ||--o{ Match : has
    
    User {
        int id
        string name
        string email
        string password_hash
        int club_id
        Role[] roles
        TeamMembership[] teams
        RefreshToken[] refresh_tokens
    }

    RefreshToken {
        int id
        string token_hash
        int user_id
        text device_id
        datetime created_at
        datetime expires_at
    }

    Role {
        int id
        string role
        User[] users
    }

    Club {
        int id
        string name
        string region
        string address
        string contact_email
        bool is_active
        User[] memebers
        Team[] teams
    }

    ClubLogo {
        int id
        int club_id
        blob logo
        datetime valid_from
        datetime valid_to
    }

    Tournament {
        int id
        string season
        string name
        Division[] divisions
        TournamentDate[] dates
    }

    Match {
        int id
        int division_id
        int home_team_id
        int home_team_score
        int away_team_id
        int away_team_score
        int winner_tournament_team_id
        int field
        datetime match_date
    }
    Division {
        int id
        int tournament_id
        string name
        
        TournamentTeam[] teams
        Match[] matches
    }
    Team {
        int id
        int club_id
        string name
        bool is_active
        TeamMembership[] members
        Match[] matches_as_home_team
        Match[] matches_as_away_team
        Match[] matches_won
        TournamentTeam[] tournament_teams
    }
    
    TeamLogo {
        int id
        int team_id
        blob logo
        datetime valid_from
        datetime valid_to
    }
    
    TeamMembership {
        int id
        int user_id
        int team_id
        datetime valid_from
        datetime valid_to
    }

    TournamentTeam {
        int id
        int team_id
        int division_id
    }

    TournamentDate {
        int id
        int tournament_id
        DateTime date
    }
    
```
```mermaid
---
title: ER-Diagram Aktuel
---
erDiagram
    Direction TB
    User }|--|| Club : belongs_to
    User }o--o{ Role : has
    User ||--o{ TeamMembership : has
    User ||--o{ RefreshToken : has
    Club ||--o{ Team : has
    Team ||--o{ TeamMembership : has
    Tournament ||--o{ Match : has
    Tournament ||--o{ TournamentTeam : has
    Tournament ||--o{ Division : has
    Tournament ||--o{ TournamentDate : has
    TournamentTeam }o--|| Team : is
    Match }o--|{ TournamentTeam : "NOTE: Always has 2 teams"
    Division ||--o{ TournamentTeam : has
    Division ||--o{ Match : has
    
    User {
        int id
        string name
        string email
        string password_hash
        int club_id
        Role[] roles
        TeamMembership[] teams
        RefreshToken[] refresh_tokens
    }

    RefreshToken {
        int id
        string token_hash
        int user_id
        text device_id
        datetime created_at
        datetime expires_at
    }

    Role {
        int id
        string role
        User[] users
    }

    Club {
        int id
        string name
        string region
        string address
        string contact_email
        bool is_active
        User[] memebers
        Team[] teams
    }

    Tournament {
        int id
        string season
        string name
        Division[] divisions
        Match[] matches
        TournamentTeam[] teams
        TournamentDate[] dates
    }

    Match {
        int id
        int tournament_id
        int division_id
        int home_team_id
        int home_team_score
        int away_team_id
        int away_team_score
        int winner_tournament_team_id
        int field
        datetime match_date
    }
    
    Division {
        int id
        int tournament_id
        string name
        
        TournamentTeam[] teams
        Match[] matches
    }
    
    Team {
        int id
        int club_id
        string name
        bool is_active
        TeamMembership[] members
        Match[] matches_as_home_team
        Match[] matches_as_away_team
        Match[] matches_won
        TournamentTeam[] tournament_teams
    }

    TeamMembership {
        int id
        int user_id
        int team_id
        datetime valid_from
        datetime valid_to
    }

    TournamentTeam {
        int id
        int tournament_id
        int team_id
        int division_id
    }

    TournamentDate {
        int id
        int tournament_id
        DateTime date
    }
    
```