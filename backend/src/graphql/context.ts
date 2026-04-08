import { Pool } from "pg";
import { User } from "../auth/graphqlPermissions.js";
import {Request, Response} from "express"

export interface Context {
    pool: Pool;
    req: Request;
    res: Response;
    user: User | null
}