import type { Request, Response } from "express";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { hashToken } from "../util/hash.js";
import {PrismaPg} from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { v4 as uuidv4 } from 'uuid';
import {pool} from "../db/pool.js";

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export type TokenPayload = {
    userId: number;
    deviceId: string;
};

const refreshCookieName = "kpolo_refresh_token";
const accessCookieName = "kpolo_access_token";
const deviceIdCookieName = "kpolo_device_id"

//Nødt til at springe igennem bittesmå løkker for at få lavet token TTL til ms!!! ms library giver errors.
function parseTimeToMs(ttl: string): number {
    const unit = ttl.slice(-1);
    const value = parseInt(ttl.slice(0, -1));

    switch (unit) {
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return value; // Fallback to raw milliseconds
    }
}

const accessTokenTtlStr = process.env.ACCESS_TOKEN_TTL ?? "15m";
const refreshTokenTtlStr = process.env.REFRESH_TOKEN_TTL ?? "7d";
const accessTokenTtlMs = parseTimeToMs(accessTokenTtlStr);
const refreshTokenTtlMs = parseTimeToMs(refreshTokenTtlStr);
const accessTokenTtl = accessTokenTtlStr as SignOptions["expiresIn"];
const refreshTokenTtl = refreshTokenTtlStr as SignOptions["expiresIn"];

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

const frontendDomain = process.env.FRONTEND_DOMAIN;

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
        maxAge: accessTokenTtlMs,
        domain: !isDev ? frontendDomain : undefined,
    });
}

export function clearAccessTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(accessCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        domain: !isDev ? frontendDomain : undefined,
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
        path: "/",
        maxAge: refreshTokenTtlMs,
        domain: !isDev ? frontendDomain : undefined,
    });


}

export async function updateRefreshTokenDatabase(refreshToken: string, userId: number, deviceId: string) {
    await prisma.refreshToken.upsert({
        where: {
            user_id_device_id: { user_id: userId, device_id: deviceId }
        },
        create: {
            user_id: userId,
            device_id: deviceId,
            token_hash: hashToken(refreshToken),
            created_at: new Date(Date.now()),
            expires_at: new Date(Date.now() + refreshTokenTtlMs) // 7 days
        },
        update: {
            token_hash: hashToken(refreshToken),
            created_at: new Date(Date.now()),
            expires_at: new Date(Date.now() + refreshTokenTtlMs) // 7 days.
        }
    })
}



export function clearRefreshTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(refreshCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        domain: !isDev ? frontendDomain : undefined,
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
            maxAge: 1000*60*60*24*365, //A Year
            domain: !isDev ? frontendDomain : undefined,
        });
    }
    return deviceId;
}
