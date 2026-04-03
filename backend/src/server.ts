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
    AccessTokenPayload,
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    getAccessTokenFromRequest,
    getDeviceID,
    getRefreshTokenFromRequest,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    signAccessToken,
    signRefreshToken, updateRefreshTokenDatabase,
    verifyAccessToken,
    verifyRefreshToken,
} from "./auth/tokens.js";

import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import bcrypt from "bcrypt"
import { PrismaClient, Role } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashToken } from "./util/hash.js";
import { ref } from "node:process";

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


        const deviceId = getDeviceID(req);

         if (!deviceId) {
            return res.status(400).json({ error: "No Device ID" });
        }

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

        const refreshToken = signRefreshToken({ userId: user.id, deviceId});
        const accessToken = signAccessToken({ userId: user.id, deviceId, userRoles });

        setRefreshTokenCookie(res, refreshToken, isDev);
        await updateRefreshTokenDatabase(refreshToken, user.id, deviceId);

        setAccessTokenCookie(res, accessToken, isDev)

        return res.status(200);
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/refresh", async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) return res.status(401).json({ error: "Missing refresh token" });

    try {
        const decoded = verifyRefreshToken(refreshToken);

        const userId = decoded.userId;
        const deviceId = getDeviceID(req);

        const databaseRefreshToken = await prisma.refreshTokens.findUnique({
            where: { user_id_device_id: { user_id: userId, device_id: deviceId },
                    expires_at: { gt: new Date(Date.now()) }
            },

        });


        if (!databaseRefreshToken || databaseRefreshToken?.token_hashed != hashToken(refreshToken)){
            clearRefreshTokenCookie(res, isDev);
            return res.status(403).json({ error: "Token mismatch" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) {
            return res.status(404).json({ error: "User does not exist anymore" });
        }

        const userRoles = user.roles.map((r: Role) => r.role);
       
        const payload: AccessTokenPayload = {
        userId: user.id,
        deviceId: deviceId,
        userRoles: userRoles,
        };


        setRefreshTokenCookie(res, refreshToken, isDev);
        await updateRefreshTokenDatabase(refreshToken, user.id, deviceId);

        const accessToken = signAccessToken(payload);
        setAccessTokenCookie(res, accessToken, isDev);
        
        return res.status(200);
    } catch (err) {
        clearRefreshTokenCookie(res, isDev);
        return res.status(401).json({ error: `Invalid refresh token` });
    }
});

app.post("/logout", async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        const decoded = verifyRefreshToken(refreshToken);
        const userId = decoded.userId;
        const deviceId = getDeviceID(req);
        clearRefreshTokenCookie(res, isDev);
        clearAccessTokenCookie(res,isDev);

        await prisma.refreshTokens.delete({
            where: {
                user_id_device_id: { user_id: userId, device_id: deviceId }
        }})


        res.status(200);
    } catch (err) {
        clearRefreshTokenCookie(res, isDev);
        return res.status(400);
    }
}
);
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
