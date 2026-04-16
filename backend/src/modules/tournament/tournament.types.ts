enum TournamentTypes {
    GROUP_PLAY = 'GROUP_PLAY',
    ROUND_ROBIN = 'ROUND_ROBIN',
}

type Team = { name: string };

type Match = {
    matchNumber: number
    team1: string;
    team2: string;
    round: number;
    field: number;
    startTime: string
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