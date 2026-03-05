import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/graphql/typeDefs.ts',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    './src/generated/': {
      preset: 'client',
      plugins: [],
    },
  },
};

export default config;
