import type { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaPg } from '@prisma/adapter-pg';
import { Context } from "./context.js";
import { requireRole, requireUser, UserRoles } from "../auth/graphqlPermissions.js";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export type GraphQLContext = {
    pool: Pool;
};

type DivisionInput = { name: string };
type TournamentDateInput = { date: string };
type TeamAssignmentInput = { teamId: number; divisionIndex: number };

const resolvers = {
    Query: {
        hello: () => "Hello from Apollo GraphQL and welcome to Jackass",
        dbTime: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
            const result = await ctx.pool.query("SELECT NOW() AS now");
            return result.rows[0].now;
        },

        me: async (_: unknown, _args: unknown, context: Context) => {
            requireUser(context.user);

            const user = await prisma.user.findUnique({
                where: {id: Number(context.user!.id) },
                include: {
                    club: true,
                    roles: true,
                }
            });

            if (!user) throw new Error("User not found");

            return {
                name: user.name,
                clubId: user.club?.id ?? null,
                clubName: user.club?.name ?? null,
                roles: user.roles.map((r) => r.role),
            }
        },

        tournaments: async () => {
            return prisma.tournament.findMany({
                include: {
                    divisions: {
                        include: {
                            teams: {
                                include: { team: true } // TournamentTeam -> Team
                            }
                        }
                    },
                    dates: true, // TournamentDate
                    teams: { // direkte teams på turnering
                        include: { team: true, division: true }
                    },
                    matches: true, // hvis du vil have dem med
                }
            });
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
        createClub: async (
            _: any,
            {
                name,
                address,
                region,
                managerEmail,
            }: { name: string; address: string; region: string; managerEmail: string },
            context: Context
            
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin]);

            const manager = await prisma.user.findUnique({ where: { email: managerEmail } });
            if (!manager) throw new Error(`No user found with email ${managerEmail}`);

            return prisma.club.create({
                data: {
                    name,
                    address,
                    region,
                    is_active: true,
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
        createTournament: async (_: any, { input }: {
            input: {
                name: string;
                season: string;
                divisions: DivisionInput[];
                dates: TournamentDateInput[];
                teamAssignments: TeamAssignmentInput[];
            };
        }) => {
            const { name, season, divisions = [], dates = [], teamAssignments = [] } = input;

            return prisma.$transaction(async (tx) => {
                // 1️⃣ Opret turnering
                const tournament = await tx.tournament.create({ data: { name, season } });

                // 2️⃣ Opret divisioner
                const divisionRecords = await Promise.all(
                    divisions.map(div =>
                        tx.division.create({
                            data: {
                                name: div.name,
                                tournament_id: tournament.id,
                            },
                        })
                    )
                );

                // 3️⃣ Opret datoer
                await Promise.all(
                    dates.map(d =>
                        tx.tournamentDate.create({
                            data: {
                                tournament_id: tournament.id,
                                date: new Date(d.date), // sørg for ISO string
                            },
                        })
                    )
                );

                // 4️⃣ Opret teams i divisioner
                await Promise.all(
                    teamAssignments.map(({ teamId, divisionIndex }) => {
                        const division = divisionRecords[divisionIndex];
                        if (!division) throw new Error("Invalid divisionIndex in teamAssignments");

                        return tx.tournamentTeam.create({
                            data: {
                                tournament_id: tournament.id,
                                team_id: teamId,
                                division_id: division.id,
                            },
                        });
                    })
                );

                // 5️⃣ Returner turnering inkl. relationer
                return tx.tournament.findUnique({
                    where: { id: tournament.id },
                    include: {
                        divisions: {
                            include: {
                                teams: { include: { team: true } },
                            },
                        },
                        dates: true,
                        teams: { include: { team: true, division: true } },
                        matches: true,
                    },
                });
            });
        },
        updateTournament: async (_: any, { id, input }: { id: number;
            input: {
                name: string;
                season: string;
                divisions: DivisionInput[];
                dates: TournamentDateInput[];
                teamAssignments: TeamAssignmentInput[];
            };
        }) => {
            const { name, season, divisions, dates, teamAssignments } = input;

            return prisma.$transaction(async (tx) => {
                // Opdater navn og sæson
                await tx.tournament.update({
                    where: { id },
                    data: { ...(name && { name }), ...(season && { season }) },
                });

                // Optionelt: opdater divisioner
                if (divisions) {
                    const existingDivisions = await tx.division.findMany({ where: { tournament_id: id } });
                    for (const div of existingDivisions) {
                        // slet først alle TournamentTeam tilknytninger
                        await tx.tournamentTeam.deleteMany({ where: { division_id: div.id } });
                    }
                    // så kan du slette divisionerne
                    await tx.division.deleteMany({ where: { tournament_id: id } });

                    await Promise.all(
                        divisions.map(div =>
                            tx.division.create({ data: { name: div.name, tournament_id: id } })
                        )
                    );
                }

                // Optionelt: opdater dates
                if (dates) {
                    await tx.tournamentDate.deleteMany({ where: { tournament_id: id } });
                    await Promise.all(
                        dates.map(d => tx.tournamentDate.create({ data: { tournament_id: id, date: new Date(d.date) } }))
                    );
                }

                // Optionelt: opdater teamAssignments
                if (teamAssignments) {
                    await tx.tournamentTeam.deleteMany({ where: { tournament_id: id } });
                    // Husk at mappe divisionIndex til division.id
                    const divisionRecords = await tx.division.findMany({ where: { tournament_id: id } });
                    await Promise.all(
                        teamAssignments.map(({ teamId, divisionIndex }) =>
                            tx.tournamentTeam.create({
                                data: {
                                    tournament_id: id,
                                    team_id: teamId,
                                    division_id: divisionRecords[divisionIndex].id,
                                },
                            })
                        )
                    );
                }

                return tx.tournament.findUnique({
                    where: { id },
                    include: {
                        divisions: { include: { teams: { include: { team: true } } } },
                        dates: true,
                        teams: { include: { team: true, division: true } },
                    },
                });
            });
        },

        register: async (_: any, { email, name, password }: { email: string, name: string, password: string}) => {

            const normalizedEmail = email.toLowerCase().trim();

            const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

            if (existingUser) throw new Error(`User with email ${email} already exists`);

            if (!email.includes("@")) {
                throw new Error("Invalid email");
            }

            if (password.length < 8) {
                throw new Error("Password too short");
            }

            // Hash
            const saltRounds = 12;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    email: normalizedEmail,
                    name,
                    password_hash,
                }
            });

            return {
                id: user.id,
                email: user.email,
                name: user.name
            };
        },
        login: async (_: any, { email, password }: {email: string; password: string}) => {

            const normalizedEmail = email.toLowerCase().trim();
            const user = await prisma.user.findUnique({ 
                where: { email: normalizedEmail },
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
