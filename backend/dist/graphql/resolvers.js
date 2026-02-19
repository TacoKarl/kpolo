export const resolvers = {
    Query: {
        hello: () => "Hello from Apollo GraphQL and welcome to Jackass",
        dbTime: async (_parent, _args, ctx) => {
            const result = await ctx.pool.query("SELECT NOW() AS now");
            return result.rows[0].now;
        },
    },
    Mutation: {
        add: (_parent, args) => args.a + args.b,
    },
};
//# sourceMappingURL=resolvers.js.map