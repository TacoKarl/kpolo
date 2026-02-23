import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
    // Clean-ish order (handles FKs). If you prefer “start fresh”, you can delete in this order.
    // Comment these out if you don't want to wipe data on each seed.
    await prisma.match.deleteMany();
    await prisma.teamMembership.deleteMany();
    await prisma.team.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    // Roles
    const adminRole = await prisma.role.create({ data: { role: "ADMIN" } });
    const managerRole = await prisma.role.create({ data: { role: "MANAGER" } });
    const playerRole = await prisma.role.create({ data: { role: "PLAYER" } });

    // Users (create first so clubs can reference manager via user_manager_id)
    const alice = await prisma.user.create({
        data: {
            name: "Alice Manager",
            email: "alice.manager@example.test",
            password_hash: "dummy_hash_alice",
            roles: { connect: [{ id: adminRole.id }, { id: managerRole.id }] },
        },
    });

    const bob = await prisma.user.create({
        data: {
            name: "Bob Manager",
            email: "bob.manager@example.test",
            password_hash: "dummy_hash_bob",
            roles: { connect: [{ id: managerRole.id }] },
        },
    });

    const charlie = await prisma.user.create({
        data: {
            name: "Charlie Player",
            email: "charlie.player@example.test",
            password_hash: "dummy_hash_charlie",
            roles: { connect: [{ id: playerRole.id }] },
        },
    });

    const dana = await prisma.user.create({
        data: {
            name: "Dana Player",
            email: "dana.player@example.test",
            password_hash: "dummy_hash_dana",
            roles: { connect: [{ id: playerRole.id }] },
        },
    });

    const emil = await prisma.user.create({
        data: {
            name: "Emil Player",
            email: "emil.player@example.test",
            password_hash: "dummy_hash_emil",
            roles: { connect: [{ id: playerRole.id }] },
        },
    });

    // Clubs (must have a manager user id, and that user_manager_id must be unique)
    const northClub = await prisma.club.create({
        data: {
            name: "North Harbor Polo Club",
            city: "Aarhus",
            address: "Harbor Rd 1",
            user_manager_id: alice.id,
        },
    });

    const southClub = await prisma.club.create({
        data: {
            name: "South Bay Polo Club",
            city: "Copenhagen",
            address: "Bay St 9",
            user_manager_id: bob.id,
        },
    });

    // Make users members of clubs (club_id)
    await prisma.user.update({
        where: { id: alice.id },
        data: { club_id: northClub.id },
    });
    await prisma.user.update({
        where: { id: bob.id },
        data: { club_id: southClub.id },
    });
    await prisma.user.update({
        where: { id: charlie.id },
        data: { club_id: northClub.id },
    });
    await prisma.user.update({
        where: { id: dana.id },
        data: { club_id: northClub.id },
    });
    await prisma.user.update({
        where: { id: emil.id },
        data: { club_id: southClub.id },
    });

    // Teams
    const northA = await prisma.team.create({
        data: { club_id: northClub.id, name: "North A" },
    });
    const northB = await prisma.team.create({
        data: { club_id: northClub.id, name: "North B" },
    });
    const southA = await prisma.team.create({
        data: { club_id: southClub.id, name: "South A" },
    });

    // Team memberships
    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    await prisma.teamMembership.createMany({
        data: [
            { team_id: northA.id, user_id: alice.id, from_date: weekAgo },
            { team_id: northA.id, user_id: charlie.id, from_date: weekAgo },
            { team_id: northB.id, user_id: dana.id, from_date: weekAgo },
            { team_id: southA.id, user_id: bob.id, from_date: weekAgo },
            { team_id: southA.id, user_id: emil.id, from_date: weekAgo },
        ],
    });

    // Tournament
    const tournament = await prisma.tournament.create({
        data: { season: "2025/2026", name: "Winter Cup" },
    });

    // Matches (winner_team_id optional, so we can set it for finished matches)
    await prisma.match.createMany({
        data: [
            {
                tournament_id: tournament.id,
                team1_id: northA.id,
                team2_id: southA.id,
                team1_score: 8,
                team2_score: 6,
                winner_team_id: northA.id,
                match_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                tournament_id: tournament.id,
                team1_id: northB.id,
                team2_id: southA.id,
                team1_score: null,
                team2_score: null,
                winner_team_id: null,
                match_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            },
        ],
    });

    console.log("Seed complete ✅");
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });