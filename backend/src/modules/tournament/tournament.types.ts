/*
enum TournamentTypes {
    GROUP_PLAY = 'GROUP_PLAY',
    ROUND_ROBIN = 'ROUND_ROBIN',
}
 */

type Team = {
    id: number;
    name: string
};

type Match = {
    tournament_id: number;
    division_id: number | null;
    team1_id: number;
    team1_score: number | null;
    team2_id: number;
    team2_score: number | null;
    winner_team_id: number | null;
    field: number;
    match_date: string;
};

type Standing = {
    team: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
};

export {Team, Match, Standing}
