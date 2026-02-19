import type { Pool } from "pg";

export type GraphQLContext = {
    pool: Pool;
};

export const resolvers = {
    Query: {
        hello: () => "Hello from Apollo GraphQL and welcome to Jackass",
        dbTime: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
            const result = await ctx.pool.query("SELECT NOW() AS now");
            return result.rows[0].now;
        },
    },
    Mutation: {
        add: (_parent: unknown, args: { a: number; b: number }) => args.a + args.b,
    },
};