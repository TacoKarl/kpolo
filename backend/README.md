# Design

Vores backend er designet ud fra valg vi har taget med db, api endpoint og ER-Diagrammer.

## DB

Til vores db er der valgt postgresql, da vi arbejder med relationelle data. Der skal ikke være for 
mange alterationer af vores modeller, og modeller skal følge de skemaer vi har besluttet. Der skal
ikke kunne tilføjes noget til en entity, som en anden måske ikke har. Derfor er der ikke valgt NoSQL 
men en SQL database. Postgres er valgt da den følger ACID-principper meget striks

## API

## ER-Diagram

Vores backend er designet med dette ER-Diagram.

```mermaid
---
title ER-Diagram
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