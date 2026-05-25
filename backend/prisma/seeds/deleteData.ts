import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma';

export async function deleteData(prisma: PrismaClient) {
    console.log('Deleting existing data...');

    // Delete in correct order due to foreign keys
    await prisma.fine.deleteMany();
    await prisma.tournamentTeam.deleteMany();
    await prisma.match.deleteMany();
    await prisma.tournamentDate.deleteMany();
    await prisma.division.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.refreshToken.deleteMany();

    await prisma.teamMembership.deleteMany();
    await prisma.team.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

    // Reset sequences
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Fine_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Tournament_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Division_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Match_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "TournamentTeam_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "TournamentDate_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Team_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "TeamMembership_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Club_id_seq" RESTART WITH 1`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`);

    console.log('Deleted old data and reset sequences');
}