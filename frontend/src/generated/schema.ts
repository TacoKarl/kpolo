export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Club = {
  __typename?: 'Club';
  address: Scalars['String']['output'];
  contact_info?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  members?: Maybe<Array<User>>;
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
  teams?: Maybe<Array<Team>>;
  website?: Maybe<Scalars['String']['output']>;
};


export type ClubTeamsArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateMatchInput = {
  away_team_id: Scalars['Int']['input'];
  away_team_score?: InputMaybe<Scalars['Int']['input']>;
  division_id?: InputMaybe<Scalars['Int']['input']>;
  field: Scalars['Int']['input'];
  home_team_id: Scalars['Int']['input'];
  home_team_score?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  match_date: Scalars['DateTime']['input'];
  tournament_id: Scalars['Int']['input'];
  winner_team_id?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateTournamentInput = {
  dates?: InputMaybe<Array<TournamentDateInput>>;
  divisions?: InputMaybe<Array<DivisionInput>>;
  name: Scalars['String']['input'];
  season: Scalars['String']['input'];
  teamAssignments?: InputMaybe<Array<TeamAssignmentInput>>;
};

export type Division = {
  __typename?: 'Division';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  teams?: Maybe<Array<TournamentTeam>>;
};

export type DivisionInput = {
  name: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  name: Scalars['String']['output'];
  token: Scalars['String']['output'];
  userId: Scalars['Int']['output'];
};

export type Match = {
  __typename?: 'Match';
  away_team: Team;
  away_team_id: Scalars['Int']['output'];
  away_team_score?: Maybe<Scalars['Int']['output']>;
  division?: Maybe<Division>;
  field?: Maybe<Scalars['Int']['output']>;
  home_team: Team;
  home_team_id: Scalars['Int']['output'];
  home_team_score?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  match_date: Scalars['String']['output'];
  tournament: Tournament;
  winner_team?: Maybe<Team>;
  winner_team_id?: Maybe<Scalars['Int']['output']>;
};

export type Me = {
  __typename?: 'Me';
  clubId?: Maybe<Scalars['ID']['output']>;
  clubName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  roles?: Maybe<Array<Scalars['String']['output']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createClub: Club;
  createMatches?: Maybe<Array<Match>>;
  createTeam: Team;
  createTournament: Tournament;
  createTournamentDate: TournamentDate;
  deleteTournamentDate: TournamentDate;
  generateTournamentPlan?: Maybe<Array<Match>>;
  login: LoginResponse;
  register: RegisterResponse;
  setClubActive: Club;
  setTeamActive: Team;
  updateClub: Club;
  updateMatches?: Maybe<Array<Match>>;
  updateTeam: Team;
  updateTournament: Tournament;
};


export type MutationCreateClubArgs = {
  address: Scalars['String']['input'];
  name: Scalars['String']['input'];
  region: Scalars['String']['input'];
};


export type MutationCreateMatchesArgs = {
  matches?: InputMaybe<Array<CreateMatchInput>>;
};


export type MutationCreateTeamArgs = {
  clubId: Scalars['Int']['input'];
  memberIds: Array<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateTournamentArgs = {
  input?: InputMaybe<CreateTournamentInput>;
};


export type MutationCreateTournamentDateArgs = {
  date: Scalars['String']['input'];
  tournamentId: Scalars['Int']['input'];
};


export type MutationDeleteTournamentDateArgs = {
  id: Scalars['Int']['input'];
};


export type MutationGenerateTournamentPlanArgs = {
  fields: Scalars['Int']['input'];
  startTime: Scalars['Int']['input'];
  tournamentId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSetClubActiveArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetTeamActiveArgs = {
  id: Scalars['Int']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationUpdateClubArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateMatchesArgs = {
  matches?: InputMaybe<Array<UpdateMatchInput>>;
};


export type MutationUpdateTeamArgs = {
  id: Scalars['Int']['input'];
  memberIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTournamentArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<UpdateTournamentInput>;
};

export type Query = {
  __typename?: 'Query';
  club?: Maybe<Club>;
  clubs: Array<Club>;
  dbTime: Scalars['String']['output'];
  hello: Scalars['String']['output'];
  match: Array<Match>;
  matches: Array<Match>;
  me?: Maybe<Me>;
  team?: Maybe<Team>;
  tournament?: Maybe<Tournament>;
  tournaments: Array<Tournament>;
  users: Array<User>;
};


export type QueryClubArgs = {
  id: Scalars['ID']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryClubsArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMatchesArgs = {
  tournamentId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTournamentArgs = {
  id: Scalars['ID']['input'];
};

export type RegisterResponse = {
  __typename?: 'RegisterResponse';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Team = {
  __typename?: 'Team';
  club: Club;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  members?: Maybe<Array<User>>;
  name: Scalars['String']['output'];
};

export type TeamAssignmentInput = {
  divisionIndex: Scalars['Int']['input'];
  teamId: Scalars['Int']['input'];
};

export type Tournament = {
  __typename?: 'Tournament';
  dates?: Maybe<Array<TournamentDate>>;
  divisions?: Maybe<Array<Division>>;
  id: Scalars['Int']['output'];
  matches?: Maybe<Array<Match>>;
  name: Scalars['String']['output'];
  season: Scalars['String']['output'];
  teams?: Maybe<Array<TournamentTeam>>;
};

export type TournamentDate = {
  __typename?: 'TournamentDate';
  date: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  tournament: Tournament;
};

export type TournamentDateInput = {
  date: Scalars['String']['input'];
};

export type TournamentTeam = {
  __typename?: 'TournamentTeam';
  division: Division;
  id: Scalars['Int']['output'];
  team: Team;
  tournament: Tournament;
};

export type UpdateMatchInput = {
  away_team_id?: InputMaybe<Scalars['Int']['input']>;
  away_team_score?: InputMaybe<Scalars['Int']['input']>;
  division_id: Scalars['Int']['input'];
  field?: InputMaybe<Scalars['Int']['input']>;
  home_team_id?: InputMaybe<Scalars['Int']['input']>;
  home_team_score?: InputMaybe<Scalars['Int']['input']>;
  id: Scalars['Int']['input'];
  match_date?: InputMaybe<Scalars['DateTime']['input']>;
  tournament_id?: InputMaybe<Scalars['Int']['input']>;
  winner_team_id?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTournamentInput = {
  dates?: InputMaybe<Array<TournamentDateInput>>;
  divisions?: InputMaybe<Array<DivisionInput>>;
  name?: InputMaybe<Scalars['String']['input']>;
  season?: InputMaybe<Scalars['String']['input']>;
  teamAssignments?: InputMaybe<Array<TeamAssignmentInput>>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};
