
export interface Tournament {
    id: string;
    name: string;
    season: string;
}

export interface GetTournamentsData {
    tournaments: Tournament[];
}

export interface Club {
    id: string;
    name: string;
    user_manager_id: string;
    city: string;
    address: string;
    members: User[];
    teams: Team [];
}

export interface GetClubData {
    club: Club;
}

export interface GetClubsData {
    clubs: Club[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    club_id: string;
    roles: Role[];
    teams: TeamMembership[];
}

export interface Role {
    id: string;
    role: string;
    users: User[];
}

export interface Team {
    id: string;
    club_id: string;
    name: string;
    members: TeamMembership[];
    matchesAsTeam1: Match[];
    matchesAsTeam2: Match[];
    matchesWon: Match[];
}

export interface TeamMembership {
    id: string;
    team_id: string;
    user_id: string;
    from_date: Date;
    to_date: Date;
}

export interface Match {
    id: string;
    tournament_id: string;
    team1_id: string;
    team1_score: bigint;
    team2_id: string;
    team2_score: bigint
    winner_id: string;
    match_date: Date;
}
