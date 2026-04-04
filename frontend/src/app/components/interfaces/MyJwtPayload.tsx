import {JwtPayload} from "jwt-decode";

export interface AccessTokenPayload extends JwtPayload {
    userId: number;
    deviceId: string;
    userRoles: string[];
}