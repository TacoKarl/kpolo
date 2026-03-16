import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaPg } from '@prisma/adapter-pg';
import * as async_hooks from "node:async_hooks";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export type GraphQLContext = {
    pool: Pool;
};

const resolvers = {
    Query: {
        hello: () => "Hello from Apollo GraphQL and welcome to Jackass",
        dbTime: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
            const result = await ctx.pool.query("SELECT NOW() AS now");
            return result.rows[0].now;
        },

        tournaments: async () => {
            return prisma.tournament.findMany();
        },

        clubs: async (_: unknown, args: { includeInactive?: boolean }) => {
            return prisma.club.findMany({
                where: args.includeInactive ? {} : { is_active: true },
            });
        },

        club: async (_: any, args: { id: string; includeInactive?: boolean }) => {
            return prisma.club.findFirst({
                where: args.includeInactive
                    ? { id: Number(args.id) }
                    : { id: Number(args.id), is_active: true },
                include: {teams: true}
            });
        },
        team: async (_: any, args: { id: string; includeInactive?: boolean }) => {
            return prisma.team.findFirst({
                where: args.includeInactive
                    ? { id: Number(args.id) }
                    : { id: Number(args.id), is_active: true },
            });
        },
        users: async () => {
            return prisma.user.findMany({
                where: { managed_clubs: null },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: { email: "asc" },
            });
        },

    },
    Club: {
        isActive: (club: { is_active: boolean }) => club.is_active,
        teams: async (club: { id: number }, args: { includeInactive?: boolean }) => {
            return prisma.team.findMany({
                where: args.includeInactive
                    ? { club_id: club.id }
                    : { club_id: club.id, is_active: true }
            });
        },
        members: async (club: { id: number }) => {
            return prisma.user.findMany({
                where: { club_id: club.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: { name: "asc" },
            });
        },
    },
    Team: {
        isActive: (team: { is_active: boolean }) => team.is_active,
        club: async (team: { club_id: number }) => {
            return prisma.club.findFirst({
                where: { id: team.club_id },
            });
        },
        members: async (team: { id: number }) => {
            return prisma.user.findMany({
                where: { teams: { some: { team_id: team.id } } },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
                orderBy: { name: "asc" },
            });
        },
    },
    Mutation: {
        add: (_parent: unknown, args: { a: number; b: number }) => args.a + args.b,
        createClub: async (
            _: any,
            {
                name,
                address,
                region,
                managerEmail,
            }: { name: string; address: string; region: string; managerEmail: string }
        ) => {
            const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
            if (!manager) throw new Error(`No user found with email ${managerEmail}`);

            return prisma.club.create({
                data: {
                    name,
                    address,
                    region,
                    is_active: true,
                    user_manager_id: manager.id,
                },
            });
        },
        updateClub: async (
            _: any,
            {
                id,
                name,
                address,
                region,
            }: { id: number; name?: string; address?: string; region?: string }
        ) => {
            return prisma.club.update({
                where: { id },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(address !== undefined ? { address } : {}),
                    ...(region !== undefined ? { region } : {}),
                },
            });
        },
        setClubActive: async (_: any, { id, isActive }: { id: number; isActive: boolean }) => {
            return prisma.club.update({
                where: { id },
                data: { is_active: isActive },
            });
        },
        createTeam: async (
            _: any,
            {
                name,
                clubId,
                memberIds,
            }: { name: string; clubId: number; memberIds: number[] }
        ) => {
            const memberIdsList = memberIds ?? [];

            return prisma.$transaction(async (tx) => {
                if (memberIdsList.length > 0) {
                    const validMembers = await tx.user.count({
                        where: { id: { in: memberIdsList }, club_id: clubId },
                    });
                    if (validMembers !== memberIdsList.length) {
                        throw new Error("All team members must belong to the selected club");
                    }
                }

                const team = await tx.team.create({
                    data: {
                        name,
                        club_id: clubId,
                        is_active: true,
                    },
                });

                if (memberIdsList.length > 0) {
                    const fromDate = new Date();
                    await tx.teamMembership.createMany({
                        data: memberIdsList.map((userId) => ({
                            team_id: team.id,
                            user_id: userId,
                            from_date: fromDate,
                        })),
                    });
                }

                return team;
            });
        },
        updateTeam: async (
            _: any,
            {
                id,
                name,
                memberIds,
            }: { id: number; name?: string; memberIds?: number[] }
        ) => {
            return prisma.$transaction(async (tx) => {
                const team = await tx.team.findUnique({ where: { id } });
                if (!team) throw new Error("Team not found");

                if (memberIds) {
                    const validMembers = await tx.user.count({
                        where: { id: { in: memberIds }, club_id: team.club_id },
                    });
                    if (validMembers !== memberIds.length) {
                        throw new Error("All team members must belong to the selected club");
                    }

                    await tx.teamMembership.deleteMany({
                        where: { team_id: id },
                    });

                    if (memberIds.length > 0) {
                        const fromDate = new Date();
                        await tx.teamMembership.createMany({
                            data: memberIds.map((userId) => ({
                                team_id: id,
                                user_id: userId,
                                from_date: fromDate,
                            })),
                        });
                    }
                }

                return tx.team.update({
                    where: { id },
                    data: {
                        ...(name !== undefined ? { name } : {}),
                    },
                });
            });
        },
        setTeamActive: async (_: any, { id, isActive }: { id: number; isActive: boolean }) => {
            return prisma.team.update({
                where: { id },
                data: { is_active: isActive },
            });
        },
        createTournament: async (_: any, {
            name,
            season,
            divisions = [],
            dates = [],
            teamAssignments = [],
        }: {
            name: string;
            season: string;
            divisions?: string[];
            dates?: string[];
            teamAssignments?: { teamId: number; divisionIndex: number }[];
        }
        ) => {
            return prisma.$transaction(async (tx) => {
                const tournament = await tx.tournament.create({
                    data: { name, season },
                });

                const divisionRecords = await Promise.all(
                    divisions.map((divName) =>
                    tx.division.create({
                        data: {
                            name: divName,
                            tournament_id: tournament.id,
                        },
                    })
                )
                );
                await Promise.all(
                    dates.map((dateStr) =>
                    tx.tournamentDate.create({
                        data: {
                            tournament_id: tournament.id,
                            date: new Date(dateStr),
                        },
                    })
                    )
                );
                if (teamAssignments.length > 0) {
                    await Promise.all(
                        teamAssignments.map(({ teamId, divisionIndex }) =>
                        tx.tournamentTeam.create({
                            data: {
                                tournament_id: tournament.id,
                                team_id: teamId,
                                division_id: divisionRecords[divisionIndex].id
                            },
                        }))
                    );
                }
                return prisma.tournament.findUnique({
                    where: { id: tournament.id },
                    include: {
                        divisions: {
                            include: {
                                teams: {
                                    include: { team: true }
                                }
                            }
                        },
                        dates: true,
                        teams: { include: { team: true, division: true } },
                    },
                });
            });
        },
        updateTournament: async (
            _: any,
            { id, name, season }: { id: number; name?: string; season?: string }
        ) => {
            return prisma.tournament.update({
                where: { id },
                data: {
                    ...(name ? { name } : {}),
                    ...(season ? { season } : {}),
                },
            });
            },

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
            const user = await prisma.user.findUnique({ 
                where: { email },
                include: { roles: true }, // fetches the related Role[] array
            });
            if (!user) throw new Error("Email or Password does not match");

            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) throw new Error("Email or Password does not match");

            const userRoles = user.roles.map((r) => r.role);


            const token = jwt.sign({ userId: user.id, userRoles}, process.env.JWT_SECRET!, {expiresIn: "1h"});

            return {
                token,
                userId: user.id,
                name: user.name
            };
        },
    },
};
export default resolvers
