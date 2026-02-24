import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export type GraphQLContext = {
    pool: Pool;
};

export const resolvers = {
    Query: {
        hello: () => "Hello from Apollo GraphQL and welcome to Jackass",
        dbTime: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
            const result = await ctx.pool.query("SELECT NOW() AS now");
            return result.rows[0].now;
        },
    },
    Mutation: {
        add: (_parent: unknown, args: { a: number; b: number }) => args.a + args.b,
        register: async (_: any, { email, name, password }: { email: string, name: string, password: string}) => {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) throw new Error(`User with email ${email} already exists`);

            // Hash
            const saltRounds = 12;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password_hash,
                }
            });

            return user;
        },
        login: async (_: any, { email, password }: {email: string; password: string}) => {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) throw new Error("Email or Password does not match");

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) throw new Error("Email or Password does not match");

            const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET!, {expiresIn: "1h"});

            return {
                token,
                userId: user.id,
                name: user.name
            };
        },
    },
};