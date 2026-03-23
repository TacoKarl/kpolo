import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";

import { pool } from "./db/pool.js";
import healthRoutes from "./modules/health/health.routes.js";
import { prisma } from "./db/prisma.js";
import {
    clearRefreshTokenCookie,
    extractTokenPayload,
    getAccessTokenFromRequest,
    getRefreshTokenFromRequest,
    setRefreshTokenCookie,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from "./auth/tokens.js";

import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";

const app = express();
const port = process.env.PORT || 3000;

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = isDev
    ? ["http://localhost:3000", "http://localhost:3001"]
    : ["https://olros.online", "https://www.olros.online"];

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

// Health stays as-isw
app.use("/health", healthRoutes);

app.post("/refresh", (req, res) => {
    const token = getRefreshTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "Missing refresh token" });

    try {
        const payload = extractTokenPayload(verifyRefreshToken(token));
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        setRefreshTokenCookie(res, refreshToken, isDev);
        return res.json({ accessToken });
    } catch (err) {
        if (isDev && err instanceof Error) {
            console.error("Refresh token error:", err.message);
        }
        clearRefreshTokenCookie(res, isDev);
        return res.status(401).json({
            error: "Invalid refresh token",
            ...(isDev && err instanceof Error ? { reason: err.message } : {}),
        });
    }
});

app.post("/auth/register", async (req, res) => {
    const { email, name, password } = req.body ?? {};
    if (!email || !name || !password) {
        return res.status(400).json({ error: "Missing email, name, or password" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ error: `User with email ${email} already exists` });
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password_hash,
        },
    });

    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({
        where: { email },
        include: { roles: true },
    });
    if (!user) return res.status(401).json({ error: "Email or Password does not match" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Email or Password does not match" });

    const userRoles = user.roles.map((r) => r.role);
    const accessToken = signAccessToken({ userId: user.id, userRoles });
    const refreshToken = signRefreshToken({ userId: user.id, userRoles });
    setRefreshTokenCookie(res, refreshToken, isDev);

    return res.json({
        token: accessToken,
        userId: user.id,
        name: user.name,
    });
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
