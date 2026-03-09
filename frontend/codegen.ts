import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/src/graphql/typeDefs.ts',
  documents: 'src/graphql/**/*.graphql', // or wherever your queries live
  generates: {
    './src/generated/schema.ts': {
      plugins: ['typescript'], // schema types only
    },
    './src/generated/': {           // <-- must be a directory
      preset: 'client',
      plugins: [],
      config: {
        withHooks: true,          // generates useQuery/useLazyQuery
        addDocBlocks: false,      // optional, removes comment blocks
      },
    },
  }
};

export default config;