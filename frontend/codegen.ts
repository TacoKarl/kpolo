import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/graphql/typeDefs.ts',
  documents: 'graphql/**/*.graphql',
  generates: {
    './src/generated/schema.ts': {
      plugins: ['typescript'],
    },
    './src/generated/graphql.ts': {
      preset: 'client', // generates hooks automatically
      plugins: [],
      config: {
        withHooks: true, // generates useQuery/useLazyQuery
      },
    },
  },
};

export default config;