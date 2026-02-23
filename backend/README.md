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
    User }|--|| Club : belongs_to
    User ||--|{ UserRole : has
    Role ||--o{ UserRole : has
    Club ||--o{ Team : has
    Tournament ||--o{ Match : has
    Team }|--o{ Match : "TODO has 2 teams"
    TeamMembership }o--|| User : has
    TeamMembership }o--|| Team : has 
    
    User {
        int id
        string name
        int clubId
    }
    UserRole {
        int userId
        int roleId
        datetime assigned_at
    }
    Role {
        int id
        string role
    }
    Club {
        int id
        string name
        int userManagerId
        string city
    }
    Tournament {
        int id
        string season
    }
    Match {
        int id
        int team1Id
        int team2Id
        int team1Score
        int team2Score
        int winnerTeamId
        date matchDate
    }
    Team {
        int id
        int clubId
        string name
    }
    TeamMembership {
        int userId
        int teamId
        datetime from_date
        datetime to_date
    }
```



```mermaid
---
title: ER-Diagram V2
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
        int clubId
    }
    Role {
        int id
        string role
    }
    Club {
        int id
        string name
        int userManagerId
        string city
    }
    Tournament {
        int id
        string season
    }
    Match {
        int id
        int team1Id
        int team2Id
        int team1Score
        int team2Score
        int winnerTeamId
        date matchDate
    }
    Team {
        int id
        int clubId
        string name
    }
    TeamMembership {
        int userId
        int teamId
        datetime from_date
        datetime to_date
    }
```