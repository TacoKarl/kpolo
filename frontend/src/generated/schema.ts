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
};

export type Club = {
  __typename?: 'Club';
  address: Scalars['String']['output'];
  contact_info?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  members: Array<User>;
  name: Scalars['String']['output'];
  region: Scalars['String']['output'];
  teams: Array<Team>;
  website?: Maybe<Scalars['String']['output']>;
};


export type ClubTeamsArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  name: Scalars['String']['output'];
  token: Scalars['String']['output'];
  userId: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  add: Scalars['Int']['output'];
  createClub: Club;
  createTeam: Team;
  deleteClub: Scalars['Boolean']['output'];
  deleteTeam: Scalars['Boolean']['output'];
  login: LoginResponse;
  register: RegisterResponse;
  updateClub: Club;
  updateTeam: Team;
};


export type MutationAddArgs = {
  a: Scalars['Int']['input'];
  b: Scalars['Int']['input'];
};


export type MutationCreateClubArgs = {
  address: Scalars['String']['input'];
  managerEmail: Scalars['String']['input'];
  name: Scalars['String']['input'];
  region: Scalars['String']['input'];
};


export type MutationCreateTeamArgs = {
  clubId: Scalars['Int']['input'];
  memberIds: Array<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};


export type MutationDeleteClubArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTeamArgs = {
  id: Scalars['Int']['input'];
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


export type MutationUpdateClubArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTeamArgs = {
  id: Scalars['Int']['input'];
  memberIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  club?: Maybe<Club>;
  clubs: Array<Club>;
  dbTime: Scalars['String']['output'];
  hello: Scalars['String']['output'];
  team?: Maybe<Team>;
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


export type QueryTeamArgs = {
  id: Scalars['ID']['input'];
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
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
  members: Array<User>;
  name: Scalars['String']['output'];
};

export type Tournament = {
  __typename?: 'Tournament';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  season: Scalars['String']['output'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};
