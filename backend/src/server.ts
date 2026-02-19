import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';y
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";

import { pool } from "./db/pool.js";
import healthRoutes from "./modules/health/health.routes.js";

import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers, type GraphQLContext } from "./graphql/resolvers.js";

const app = express();
const port = process.env.PORT || 3000;

// Usual middleware
app.use(express.json());

// Optional: if you want to lock CORS down, replace "*" with your frontend dev URL
// e.g. "http://localhost:3001" or "http://localhost:5173"
app.use(
    cors({
        origin: "*",
    })
);

// Health stays as-is
app.use("/health", healthRoutes);

// Apollo Server
const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageDisabled()
            : ApolloServerPluginLandingPageLocalDefault(),
    ],
});

await apollo.start();

app.use(
    "/graphql",
    expressMiddleware(apollo, {
        context: async () => ({ pool }),
    })
);

pool.connect()
    .then(() => {
        console.log("Forbundet til PostgreSQL");
    })
    .catch((err: Error) => {
        console.error("Kunne ikke forbinde til DB ", err);
    });

app.listen(port, () => {
    console.log(`Backend kører på http://localhost:${port}`);
    console.log(`GraphQL (Apollo) er klar på http://localhost:${port}/graphql`);
});