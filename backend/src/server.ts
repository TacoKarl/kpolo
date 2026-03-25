import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";

import { pool } from "./db/pool.js";
import healthRoutes from "./modules/health/health.routes.js";
import {
    clearRefreshTokenCookie,
    getAccessTokenFromRequest,
    getRefreshTokenFromRequest,
    setRefreshTokenCookie,
    signAccessToken,
    signRefreshToken,
    TokenPayload,
    verifyAccessToken,
    verifyRefreshToken,
} from "./auth/tokens.js";

import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import bcrypt from "bcrypt"
import { PrismaClient, Role } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const app = express();
const port = process.env.PORT || 3000;

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = isDev
    ? ["http://localhost:3000", "http://localhost:3001"]
    : ["https://olros.online", "https://www.olros.online"];



const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Usual middleware
app.use(express.json());
app.use(cookieParser());

// Optional: if you want to lock CORS down, replace "*" with your frontend dev URL
// e.g. "http://localhost:3001" or "http://localhost:5173"
app.use(
    cors({
        origin: (requestOrigin, callback) => {
            // Tillad request uden origin, fx bruno
            if (!requestOrigin || allowedOrigins.includes(requestOrigin)) return callback(null, true);
                callback(new Error(`CORS Policy: origin ${requestOrigin} not allowed`));
        },
        credentials: true, // Brug af cookies/session
    })
);

// Health stays as-is
app.use("/health", healthRoutes);





// Route handler:
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { roles: true },
        });
        if (!user) {
            return res.status(401).json({ error: "Email or Password does not match" });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "Email or Password does not match" });
        }

        const userRoles = user.roles.map((r: Role) => r.role);

        const isDev = process.env.NODE_ENV === "development";
        const token = signAccessToken({ userId: user.id, userRoles });
        const refreshToken = signRefreshToken({ userId: user.id, userRoles });
        setRefreshTokenCookie(res, refreshToken, isDev);

        return res.status(200).json({
            token,
            userId: user.id,
            name: user.name,
            roles: userRoles,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/refresh", async (req, res) => {
    const token = getRefreshTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    try {
        const decoded = verifyRefreshToken(token);

        const id = decoded.userId;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { roles: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User does not exist anymore" });
        }

        const userRoles = user.roles.map((r: Role) => r.role);
        
        //See if user roles have changed on database compared to the given refresh token
        const userRolesChanged = JSON.stringify([...decoded.userRoles].sort()) !== JSON.stringify([...userRoles].sort());

        const payload: TokenPayload = {
        userId: user.id,
        userRoles: userRoles,
        };

        const accessToken = signAccessToken(payload);
        
        if (userRolesChanged){
            const refreshToken = signRefreshToken(payload);
            setRefreshTokenCookie(res, refreshToken, isDev); //Set new refresh token if roles have changed
        }
        
        return res.json({ accessToken });
    } catch (err) {
        clearRefreshTokenCookie(res, isDev);
        return res.status(401).json({ error: `Invalid refresh token` });
    }
});

app.post("/logout", (_req, res) => {
    clearRefreshTokenCookie(res, isDev);
    res.json({ ok: true });
});
// Apollo Server
const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
        isDev
            ? ApolloServerPluginLandingPageLocalDefault()
            : ApolloServerPluginLandingPageDisabled()
    ],
});

await apollo.start();

app.use(
    "/graphql",
    expressMiddleware(apollo, {
        context: async ({ req, res }) => {
            const token = getAccessTokenFromRequest(req);
            let user = null;
            if (token) {
                try {
                    user = verifyAccessToken(token);
                } catch {
                    user = null;
                }
            }
            return { pool, req, res, user };
        },
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
    console.log(`Server running in ${isDev ? 'dev' : 'prod'} mode`);
    console.log(`Backend kører på http://localhost:${port}`);
    console.log(`GraphQL (Apollo) er klar på http://localhost:${port}/graphql`);
});
