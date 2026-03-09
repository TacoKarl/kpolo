import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  city: Scalars['String']['output'];
  contact_info?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
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
  login: LoginResponse;
  register: RegisterResponse;
};


export type MutationAddArgs = {
  a: Scalars['Int']['input'];
  b: Scalars['Int']['input'];
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

export type Query = {
  __typename?: 'Query';
  club?: Maybe<Club>;
  clubs: Array<Club>;
  dbTime: Scalars['String']['output'];
  hello: Scalars['String']['output'];
  tournaments: Array<Tournament>;
};


export type QueryClubArgs = {
  id: Scalars['ID']['input'];
};

export type RegisterResponse = {
  __typename?: 'RegisterResponse';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Tournament = {
  __typename?: 'Tournament';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  season: Scalars['String']['output'];
};

export type GetTournamentsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTournamentsQuery = { __typename?: 'Query', tournaments: Array<{ __typename?: 'Tournament', id: number, name: string, season: string }> };

export type GetClubsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClubsQuery = { __typename?: 'Query', clubs: Array<{ __typename?: 'Club', id: string, name: string, city: string, address: string, contact_info?: string | null, website?: string | null }> };

export type GetClubQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetClubQuery = { __typename?: 'Query', club?: { __typename?: 'Club', id: string, name: string, city: string, address: string } | null };


export const GetTournamentsDocument = gql`
    query GetTournaments {
  tournaments {
    id
    name
    season
  }
}
    `;
export function useGetTournamentsQuery(baseOptions?: Apollo.QueryHookOptions<GetTournamentsQuery, GetTournamentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTournamentsQuery, GetTournamentsQueryVariables>(GetTournamentsDocument, options);
      }
export function useGetTournamentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTournamentsQuery, GetTournamentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTournamentsQuery, GetTournamentsQueryVariables>(GetTournamentsDocument, options);
        }
// @ts-ignore
export function useGetTournamentsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetTournamentsQuery, GetTournamentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTournamentsQuery, GetTournamentsQueryVariables>;
export function useGetTournamentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTournamentsQuery, GetTournamentsQueryVariables>): Apollo.UseSuspenseQueryResult<GetTournamentsQuery | undefined, GetTournamentsQueryVariables>;
export function useGetTournamentsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTournamentsQuery, GetTournamentsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTournamentsQuery, GetTournamentsQueryVariables>(GetTournamentsDocument, options);
        }
export type GetTournamentsQueryHookResult = ReturnType<typeof useGetTournamentsQuery>;
export type GetTournamentsLazyQueryHookResult = ReturnType<typeof useGetTournamentsLazyQuery>;
export type GetTournamentsSuspenseQueryHookResult = ReturnType<typeof useGetTournamentsSuspenseQuery>;
export type GetTournamentsQueryResult = Apollo.QueryResult<GetTournamentsQuery, GetTournamentsQueryVariables>;
export const GetClubsDocument = gql`
    query GetClubs {
  clubs {
    id
    name
    city
    address
    contact_info
    website
  }
}
    `;
export function useGetClubsQuery(baseOptions?: Apollo.QueryHookOptions<GetClubsQuery, GetClubsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClubsQuery, GetClubsQueryVariables>(GetClubsDocument, options);
      }
export function useGetClubsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClubsQuery, GetClubsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClubsQuery, GetClubsQueryVariables>(GetClubsDocument, options);
        }
// @ts-ignore
export function useGetClubsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClubsQuery, GetClubsQueryVariables>): Apollo.UseSuspenseQueryResult<GetClubsQuery, GetClubsQueryVariables>;
export function useGetClubsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClubsQuery, GetClubsQueryVariables>): Apollo.UseSuspenseQueryResult<GetClubsQuery | undefined, GetClubsQueryVariables>;
export function useGetClubsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClubsQuery, GetClubsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClubsQuery, GetClubsQueryVariables>(GetClubsDocument, options);
        }
export type GetClubsQueryHookResult = ReturnType<typeof useGetClubsQuery>;
export type GetClubsLazyQueryHookResult = ReturnType<typeof useGetClubsLazyQuery>;
export type GetClubsSuspenseQueryHookResult = ReturnType<typeof useGetClubsSuspenseQuery>;
export type GetClubsQueryResult = Apollo.QueryResult<GetClubsQuery, GetClubsQueryVariables>;
export const GetClubDocument = gql`
    query GetClub($id: ID!) {
  club(id: $id) {
    id
    name
    city
    address
  }
}
    `;
export function useGetClubQuery(baseOptions: Apollo.QueryHookOptions<GetClubQuery, GetClubQueryVariables> & ({ variables: GetClubQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetClubQuery, GetClubQueryVariables>(GetClubDocument, options);
      }
export function useGetClubLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetClubQuery, GetClubQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetClubQuery, GetClubQueryVariables>(GetClubDocument, options);
        }
// @ts-ignore
export function useGetClubSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetClubQuery, GetClubQueryVariables>): Apollo.UseSuspenseQueryResult<GetClubQuery, GetClubQueryVariables>;
export function useGetClubSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClubQuery, GetClubQueryVariables>): Apollo.UseSuspenseQueryResult<GetClubQuery | undefined, GetClubQueryVariables>;
export function useGetClubSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetClubQuery, GetClubQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetClubQuery, GetClubQueryVariables>(GetClubDocument, options);
        }
export type GetClubQueryHookResult = ReturnType<typeof useGetClubQuery>;
export type GetClubLazyQueryHookResult = ReturnType<typeof useGetClubLazyQuery>;
export type GetClubSuspenseQueryHookResult = ReturnType<typeof useGetClubSuspenseQuery>;
export type GetClubQueryResult = Apollo.QueryResult<GetClubQuery, GetClubQueryVariables>;