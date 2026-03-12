import {JwtPayload} from "jwt-decode";

export interface MyJwtPayload extends JwtPayload {
    userId: number;
    userRoles: string[];
}