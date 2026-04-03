import type { Request, Response } from "express";
import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { createHash } from "crypto";

export type RefreshTokenPayload = {
    userId: number;
    deviceId: string;
};

export type AccessTokenPayload = {
    userId: number;
    deviceId: string;
    userRoles: string[];
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

export function signAccessToken(payload: AccessTokenPayload) {
    return jwt.sign(payload, jwtSecret as Secret, { expiresIn: accessTokenTtl });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, jwtSecret as Secret) as AccessTokenPayload;
}

export function setAccessTokenCookie(res: Response, token: string, isDev: boolean) {
    res.cookie(accessCookieName, token, {
        httpOnly: true,
        secure: !isDev,
        sameSite: !isDev ? "lax" : "none",
        path: "/",
        maxAge: refreshCookieTtlMs,
    });
}

export function clearAccessTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(accessCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: !isDev ? "lax" : "none",
        path: "/",
    });
}


export function signRefreshToken(payload: RefreshTokenPayload) {
    return jwt.sign(payload, jwtRefreshSecret as Secret, { expiresIn: refreshTokenTtl });
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, jwtRefreshSecret as Secret) as RefreshTokenPayload;
}

export function setRefreshTokenCookie(res: Response, token: string, isDev: boolean) {
    res.cookie(refreshCookieName, token, {
        httpOnly: true,
        secure: !isDev,
        sameSite: !isDev ? "lax" : "none",
        path: "/refresh",
        maxAge: refreshCookieTtlMs,
    });
}



export function clearRefreshTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(refreshCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: !isDev ? "lax" : "none",
        path: "/refresh",
    });
}





export function getAccessTokenFromRequest(req: Request) {
    return req.cookies?.[accessCookieName] ?? null;
}

export function getRefreshTokenFromRequest(req: Request) {
    return req.cookies?.[refreshCookieName] ?? null;
}

export function getDeviceID(req: Request) {
    return req.cookies?.[deviceIdCookieName] ?? null;
}