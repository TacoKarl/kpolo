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
    TokenPayload,
    clearAccessTokenCookie,
    clearRefreshTokenCookie,
    getAccessTokenFromRequest,
    getOrCreateDeviceID,
    getRefreshTokenFromRequest,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    signAccessToken,
    signRefreshToken, 
    updateRefreshTokenDatabase,
    verifyAccessToken,
    verifyRefreshToken,
} from "./auth/tokens.js";

import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt"
import { PrismaClient, Role } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashToken } from "./util/hash.js";
import { User } from "./auth/graphqlPermissions.js";
import { UserRoles } from "./auth/userRoles.js";
import { Context } from "./graphql/context.js";

const app = express();
const port = process.env.PORT || 3000;
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute(s)
    limit: 100, // 100 requests per window
    message: "Too many requests! Try again later."
})

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = isDev
    ? ["http://localhost:3000", "http://localhost:3001"]
    : ["https://olros.online", "https://www.olros.online"];



const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Usual middleware
app.use(express.json(), limiter);
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


        const deviceId = getOrCreateDeviceID(req, res, isDev);

        const user = await prisma.user.findUnique({
            where: { email: email },
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

        const payload: TokenPayload = {
            userId: user.id,
            deviceId
        }

        const refreshToken = signRefreshToken(payload);
        const accessToken = signAccessToken(payload);

        setRefreshTokenCookie(res, refreshToken, isDev);
        await updateRefreshTokenDatabase(refreshToken, user.id, deviceId);

        setAccessTokenCookie(res, accessToken, isDev)

        return res.status(200).json({response: 'Login successful'});
    } catch (err) {
        return res.status(500).json({ error: `Internal server error ${err}` });
    }
});


app.post("/refresh", async (req, res) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) return res.status(401).json({ error: "Missing refresh token" });

    try {
        const decoded = verifyRefreshToken(refreshToken);

        const userId = decoded.userId;
        const deviceId = getOrCreateDeviceID(req, res, isDev);

        const databaseRefreshToken = await prisma.refreshToken.findUnique({
            where: { user_id_device_id: { user_id: userId, device_id: deviceId },
                    expires_at: { gt: new Date(Date.now()) }
            },

        });


        if (!databaseRefreshToken || databaseRefreshToken?.token_hash != hashToken(refreshToken)){
            clearRefreshTokenCookie(res, isDev);
            return res.status(403).json({ error: "Token mismatch" });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "User does not exist anymore" });
        }

        setRefreshTokenCookie(res, refreshToken, isDev);
        await updateRefreshTokenDatabase(refreshToken, user.id, deviceId);


        const payload: TokenPayload = {
            userId: user.id,
            deviceId
        }

        const accessToken = signAccessToken(payload);
        setAccessTokenCookie(res, accessToken, isDev);
        
        return res.status(200).json({response: 'Refresh successful'});
    } catch (err) {
        clearRefreshTokenCookie(res, isDev);
        return res.status(401).json({ error: `Invalid refresh token` });
    }
});

app.post("/logout", async (req, res) => {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        if (!refreshToken) {
            clearRefreshTokenCookie(res, isDev);
            clearAccessTokenCookie(res, isDev);
            return res.status(200).json({ response: "Logout successful" });
        }

        const decoded = verifyRefreshToken(refreshToken);
        const userId = decoded.userId;
        const deviceId = getOrCreateDeviceID(req, res, isDev);
        clearRefreshTokenCookie(res, isDev);
        clearAccessTokenCookie(res,isDev);

        await prisma.refreshToken.delete({
            where: {
                user_id_device_id: { user_id: userId, device_id: deviceId }
        }})


        res.status(200).json({response: 'Logout successful'});
    } catch (err) {
        console.error("Logout failed:", err);
        clearRefreshTokenCookie(res, isDev);
        clearAccessTokenCookie(res, isDev);
        return res.status(400).json({ error: "Logout failed" });
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
        context: async ({ req, res }): Promise<Context> => {
            const token = getAccessTokenFromRequest(req);
            let decoded = null;
            let user: User | null = null;
            if (token) {
                try {
                    decoded = verifyAccessToken(token);
                    if (decoded){
                        const userDB = await prisma.user.findUnique({
                            where: { id: decoded.userId },
                            include: { roles: true },
                        });
                        if (userDB){

                            const userRoles: UserRoles[] = userDB.roles
                                .map(entity => entity.role) // Extract "System Admin" strings
                                .filter((r): r is UserRoles => Object.values(UserRoles).includes(r as UserRoles));

                            user = {
                                id: userDB.id,
                                clubId: userDB.club_id,
                                roles: userRoles
                            }

                        }
                    }
                } catch {
                    user = null
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
