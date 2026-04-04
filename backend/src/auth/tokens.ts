import type { Request, Response } from "express";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { createHash } from "crypto";
import { hashToken } from "../util/hash.js";
import {PrismaPg} from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { v4 as uuidv4 } from 'uuid';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export type TokenPayload = {
    userId: number;
    deviceId: string;
};




const refreshCookieName = "kpolo_refresh_token";
const accessCookieName = "kpolo_access_token";
const deviceIdCookieName = "kpolo_device_id"
const accessTokenTtl = (process.env.ACCESS_TOKEN_TTL ?? "15m") as SignOptions["expiresIn"];
const refreshTokenTtl = (process.env.REFRESH_TOKEN_TTL ?? "7d") as SignOptions["expiresIn"];
const refreshCookieTtlMs = Number(process.env.REFRESH_COOKIE_TTL_MS ?? 1000 * 60 * 60 * 24 * 7);
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtSecret || !jwtRefreshSecret) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be set");
}

export function signAccessToken(payload: TokenPayload) {
    return jwt.sign(payload, jwtSecret as Secret, { expiresIn: accessTokenTtl });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, jwtSecret as Secret) as TokenPayload;
}

export function setAccessTokenCookie(res: Response, token: string, isDev: boolean) {
    res.cookie(accessCookieName, token, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        maxAge: refreshCookieTtlMs,
    });
}

export function clearAccessTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(accessCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
    });
}


export function signRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, jwtRefreshSecret as Secret, { expiresIn: refreshTokenTtl });
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, jwtRefreshSecret as Secret) as TokenPayload;
}

export function setRefreshTokenCookie(res: Response, token: string, isDev: boolean) {
    res.cookie(refreshCookieName, token, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/refresh",
        maxAge: refreshCookieTtlMs,
    });


}

export async function updateRefreshTokenDatabase(refreshToken: string, userId: number, deviceId: string) {
    await prisma.refreshTokens.upsert({
        where: {
            user_id_device_id: { user_id: userId, device_id: deviceId }
        },
        create: {
            user_id: userId,
            device_id: deviceId,
            token_hashed: hashToken(refreshToken),
            created_at: new Date(Date.now()),
            expires_at: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)) //TODO: take from env
        },
        update: {
            token_hashed: hashToken(refreshToken),
            created_at: new Date(Date.now()),
            expires_at: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7)) //TODO: env
        }
    })
}



export function clearRefreshTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(refreshCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/refresh",
    });
}





export function getAccessTokenFromRequest(req: Request) {
    return req.cookies?.[accessCookieName] ?? null;
}

export function getRefreshTokenFromRequest(req: Request) {
    return req.cookies?.[refreshCookieName] ?? null;
}

export function getOrCreateDeviceID(req: Request, res: Response, isDev: boolean = false) {
    let deviceId = req.cookies?.[deviceIdCookieName] ?? null;
    if (!deviceId){
        deviceId = uuidv4();
        res.cookie(deviceIdCookieName, deviceId, {
            httpOnly: true,
            secure: !isDev,
            sameSite: "lax",
            path: "/",
            maxAge: 1000*60*60*24*365,
        });
    }
    return deviceId;
}