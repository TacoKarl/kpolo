import type {Pool} from "pg";
import {PrismaClient} from "../generated/prisma/index.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaPg } from '@prisma/adapter-pg';
import { match } from "node:assert";
import {Context} from "./context.js";
import {requireClubMembership, requireRole, requireUser} from "../auth/graphqlPermissions.js";
import {UserRoles} from "../auth/userRoles.js";

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
type MatchInput = {
        id:             number | undefined,
        tournament_id:  number,
        division_id:    number | undefined,
        team1_id:       number,
        team2_id:       number,
        team1_score:    number | undefined,
        team2_score:    number | undefined,
        winner_team_id: number | undefined,
        field:          number,
        match_date:     Date,
    };


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

        tournament: async (_: unknown, args: { id: string }) => {
            return prisma.tournament.findUnique({
                where: { id: Number(args.id) },
                include: {
                    divisions: {
                        include: {
                            teams: {
                                include: { team: true }
                            }
                        }
                    },
                    dates: true,
                    teams: {
                        include: { team: true, division: true }
                    },
                    matches: {
                        include: {
                            team1: true,
                            team2: true,
                            winner_team: true,
                            division: true,
                        }
                    },
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
        matches: async (_: any, args: { tournamentId?: number }) => {
            return prisma.match.findMany({
                where: args.tournamentId ? {tournament_id: Number(args.tournamentId), } : { },
                include: {
                    tournament: true,
                    team1: true,
                    team2: true,
                    winner_team: true,
                },
                orderBy: {match_date: "asc"}
            });
        },
        match: async (_: any, args: { id: string; }) => {
            return prisma.match.findFirst({
                where: { id: Number(args.id) },
                include: {
                    tournament: true,
                    team1: true,
                    team2: true,
                    winner_team: true,
                }
            });
        },
        users: async (_: any, args: any, context: Context) => {
            requireUser(context.user);
            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.EventManager]);
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
    Match: {
        tournament: async (match: { tournament_id: number }) => {
            return prisma.tournament.findFirst({
                where: { id: match.tournament_id }   
            });
        },
        team1: async (match: { team1_id: number }) => {
            return prisma.team.findFirst({
                where: { id: match.team1_id },
            });
        },
        team2: async (match: { team2_id: number }) => {
            return prisma.team.findFirst({
                where: { id: match.team2_id },
            });
        },
        winner_team: async (match: { winner_team_id?: number }) => {
            if (!match.winner_team_id) return null;
            return prisma.team.findFirst({
                where: { id: match.winner_team_id }
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
            }: { name: string; address: string; region: string; managerEmail: string },
            context: Context
            
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin]);
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
                is_active,
            }: { id: number; name?: string; address?: string; region?: string; is_active?: boolean; },
            context: Context
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.ClubAdmin])
            requireClubMembership(context.user, id);
            return prisma.club.update({
                where: { id },
                data: {
                    ...(name !== undefined ? { name } : {}),
                    ...(address !== undefined ? { address } : {}),
                    ...(region !== undefined ? { region } : {}),
                    ...(is_active !== undefined ? { is_active } : {}),
                },
            });
        },
        createTeam: async (
            _: any,
            {
                name,
                clubId,
                memberIds,
            }: { name: string; clubId: number; memberIds: number[] },
            context: Context
        ) => {

            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.ClubAdmin])
            requireClubMembership(context.user, clubId);
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
                is_active,
            }: { id: number; name?: string; memberIds?: number[]; is_active?: boolean; },
            context: Context
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.ClubAdmin])

            return prisma.$transaction(async (tx) => {
                const team = await tx.team.findUnique({ where: { id } });
                if (!team) throw new Error("Team not found");
                const clubId = team.club_id;

                requireClubMembership(context.user, clubId);

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
                        ...(is_active !== undefined ? { is_active } : {}),
                    },
                });
            });
        },

        createTournamentDate: async (
            _: any,
            { tournamentId, date }: { tournamentId: number; date: string }
        ) => {
            return prisma.tournamentDate.create({
                data: {
                    tournament_id: tournamentId,
                    date: new Date(date), // Converts the ISO string to a Date object
                },
                include: {
                    tournament: true // Ensures the returned object matches the TournamentDate type
                }
            });
        },

        deleteTournamentDate: async (
            _: any,
            { id }: { id: number }
        ) => {
            // First check if it exists to provide a better error or simply let Prisma throw
            const dateToDelete = await prisma.tournamentDate.findUnique({ where: { id } });
            if (!dateToDelete) throw new Error(`Tournament Date with ID ${id} not found`);

            return prisma.tournamentDate.delete({
                where: { id },
                include: {
                    tournament: true
                }
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
        },
        context: Context
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.EventManager]);

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
        }, context: Context
        ) => {
            requireRole(context.user, [UserRoles.SystemAdmin, UserRoles.EventManager]);
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

        createMatches: async (_: any, args: { matches: MatchInput[] }) => {
            return prisma.$transaction(async (tx) => {
                // Validate all teams exist and belong to the tournament
                const tournamentIds = [...new Set(args.matches.map(m => m.tournament_id))];
                const tournaments = await tx.tournament.findMany({
                    where: { id: { in: tournamentIds } }
                });
                
                if (tournaments.length !== tournamentIds.length) {
                    throw new Error("One or more tournaments not found");
                }

                const allTeamIds = [...new Set(args.matches.flatMap(m => [m.team1_id, m.team2_id]))];
                const teams = await tx.team.findMany({
                    where: { id: { in: allTeamIds } }
                });

                if (teams.length !== allTeamIds.length) {
                    throw new Error("One or more teams not found");
                }

                // Optional: Validate teams belong to tournament (via TournamentTeam)
                if (args.matches[0].division_id !== undefined) {
                    const divisions = await tx.division.findMany({
                        where: { id: { in: args.matches.map(m => m.division_id!).filter(Boolean) } }
                    });
                    
                    if (divisions.length !== args.matches.filter(m => m.division_id).length) {
                        throw new Error("One or more divisions not found");
                    }
                }

                // Create all matches
                return await tx.match.createManyAndReturn({
                    data: args.matches.map(match => ({
                        tournament_id: match.tournament_id,
                        division_id: match.division_id,
                        team1_id: match.team1_id,
                        team2_id: match.team2_id,
                        field: match.field,
                        match_date: match.match_date,
                    })),
                    include:{
                        tournament: true,
                        team1: true,
                        team2: true,
                        winner_team: true,
                    },
                });
            });
        },

        updateMatches: async (_: any, args: { matches: MatchInput[] }) => {
        return prisma.$transaction(async (tx) => {
            // Validate all matches exist
            const matchIds = args.matches
                .filter(m => m.id !== undefined)
                .map(m => m.id!);
                
            if (matchIds.length === 0) {
                throw new Error("No matches to update (all must have id)");
            }

            const existingMatches = await tx.match.findMany({
                where: { id: { in: matchIds } }
            });

            if (existingMatches.length !== matchIds.length) {
                throw new Error("One or more matches not found");
            }

            const updatePromises = args.matches.map(match => {
                if (!match.id) throw new Error("Match id is required");
                // Assuming MatchInput extends MatchUpdateInput or similar
                // Omit id from data as it's used in where
                const { id, ...data } = match;
                return tx.match.update({
                    where: { id },
                    data
                });
            });

            return Promise.all(updatePromises);
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
