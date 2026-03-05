export interface Tournament {
    id: string;
    name: string;
    season: string;
}

export interface GetTournamentsData {
    tournaments: Tournament[];
}
