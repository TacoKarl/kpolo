import type { Request, Response } from "express";
import jwt, { type SignOptions, type Secret, type JwtPayload } from "jsonwebtoken";

export type TokenPayload = {
    userId: number;
    userRoles: string[];
};

const refreshCookieName = "refresh_token";
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

export function signRefreshToken(payload: TokenPayload) {
    return jwt.sign(payload, jwtRefreshSecret as Secret, { expiresIn: refreshTokenTtl });
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, jwtSecret as Secret) as TokenPayload & JwtPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, jwtRefreshSecret as Secret) as TokenPayload & JwtPayload;
}

export function extractTokenPayload(payload: TokenPayload & JwtPayload): TokenPayload {
    return {
        userId: payload.userId,
        userRoles: payload.userRoles,
    };
}

export function setRefreshTokenCookie(res: Response, token: string, isDev: boolean) {
    res.cookie(refreshCookieName, token, {
        httpOnly: true,
        secure: !isDev,
        sameSite: isDev ? "lax" : "none",
        path: "/refresh",
        maxAge: refreshCookieTtlMs,
    });
}

export function clearRefreshTokenCookie(res: Response, isDev: boolean) {
    res.clearCookie(refreshCookieName, {
        httpOnly: true,
        secure: !isDev,
        sameSite: isDev ? "lax" : "none",
        path: "/refresh",
    });
}

export function getAccessTokenFromRequest(req: Request) {
    const header = req.headers.authorization;
    if (!header) return null;
    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) return null;
    return token;
}

export function getRefreshTokenFromRequest(req: Request) {
    return req.cookies?.[refreshCookieName] ?? null;
}
