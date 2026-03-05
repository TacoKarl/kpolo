/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
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
  dbTime: Scalars['String']['output'];
  hello: Scalars['String']['output'];
  tournaments: Array<Tournament>;
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


export const GetTournamentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTournaments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tournaments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"season"}}]}}]}}]} as unknown as DocumentNode<GetTournamentsQuery, GetTournamentsQueryVariables>;