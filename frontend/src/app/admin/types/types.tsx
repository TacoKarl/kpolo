type DateItem = {
    date: string
    public: boolean
}

type Division = {
    id: number
    name: string
    public: boolean
    teams: number[]
}

type Team = {
    teamId: number
    divisionId: number
    public: boolean
}

type ClubTeam = {
    id: number
    name: string
}