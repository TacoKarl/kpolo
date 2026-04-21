import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma';
import * as bcrypt from "bcrypt"
import {UserRoles} from '../../src/auth/userRoles'



export async function seedFakeData(prisma: PrismaClient) {
  console.log('START seeding fakeData...');

  // Create roles
  const clubMemberRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubMember },
  });

  const clubAdminRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubAdmin },
  });

  const systemAdminRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.SystemAdmin },
  });

  const trainerRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubTrainer },
  });

  const eventManagerRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.EventManager },
  });

    const guestRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.Guest },
  });

  console.log('Fetched roles');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin1 = await prisma.user.create({
    data: {
      name: 'Armin The Admin',
      email: 'armin@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: [ {id: systemAdminRole.id}] },
    },
  });

  const eventManager1 = await prisma.user.create({
    data: {
      name: 'Even T. Man',
      email: 'even@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: [ {id: eventManagerRole.id}] },
    },
  });

  // Create users for Club 1
  const manager1 = await prisma.user.create({
    data: {
      name: 'Lars Nielsen',
      email: 'lars@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: [{ id: clubAdminRole.id }, { id: clubMemberRole.id }, {id: systemAdminRole.id}] },
    },
  });

  const player1 = await prisma.user.create({
    data: {
      name: 'Anna Hansen',
      email: 'anna@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player2 = await prisma.user.create({
    data: {
      name: 'Mikkel Andersen',
      email: 'mikkel@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player3 = await prisma.user.create({
    data: {
      name: 'Sofia Jensen',
      email: 'sofia@kpolo.dk',
      password_hash: passwordHash,
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  // Create users for Club 2
  const manager2 = await prisma.user.create({
    data: {
      name: 'Peter Larsen',
      email: 'peter@aarhuskayak.dk',
      password_hash: passwordHash,
      roles: { connect: [{ id: clubAdminRole.id }, { id: clubMemberRole.id }] },
    },
  });

  const player4 = await prisma.user.create({
    data: {
      name: 'Emma Christensen',
      email: 'emma@aarhuskayak.dk',
      password_hash: passwordHash,
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player5 = await prisma.user.create({
    data: {
      name: 'Oliver Pedersen',
      email: 'oliver@aarhuskayak.dk',
      password_hash: passwordHash,
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  console.log('Created users');

  // Create clubs
  const club1 = await prisma.club.create({
    data: {
      name: 'Copenhagen Kayak Polo Club',
      region: 'Sjælland',
      address: 'Strandvej 123, 2100 København Ø',
    },
  });

  const club2 = await prisma.club.create({
    data: {
      name: 'Aarhus Kayak Club',
      region: 'Jylland',
      address: 'Havnevej 45, 8000 Aarhus C',
    },
  });

  console.log('Created clubs');

  // Update users with club memberships
  await prisma.user.update({
    where: { id: manager1.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player1.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player2.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player3.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: manager2.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player4.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player5.id },
    data: { club_id: club2.id },
  });

  console.log('Updated user club memberships');

  // Create teams
  const team1 = await prisma.team.create({
    data: {
      name: 'Copenhagen Warriors',
      club_id: club1.id,
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Copenhagen Vikings',
      club_id: club1.id,
    },
  });

  const team3 = await prisma.team.create({
    data: {
      name: 'Aarhus Thunder',
      club_id: club2.id,
    },
  });

  console.log('Created teams');

  // Create team memberships
  const currentDate = new Date();
  const joinDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of current year

  await prisma.teamMembership.createMany({
    data: [
      { team_id: team1.id, user_id: player1.id, from_date: joinDate },
      { team_id: team1.id, user_id: player2.id, from_date: joinDate },
      { team_id: team1.id, user_id: manager1.id, from_date: joinDate },
      { team_id: team2.id, user_id: player3.id, from_date: joinDate },
      { team_id: team3.id, user_id: player4.id, from_date: joinDate },
      { team_id: team3.id, user_id: player5.id, from_date: joinDate },
      { team_id: team3.id, user_id: manager2.id, from_date: joinDate },
    ],
  });

  console.log('Created team memberships');

  // Create tournaments
  const tournament1 = await prisma.tournament.create({
    data: {
      season: '2024-2025',
      name: 'Danish Kayak Polo League',
    },
  });

  const tournament2 = await prisma.tournament.create({
    data: {
      season: '2024-2025',
      name: 'Nordic Championship',
    },
  });

  console.log('Created tournaments');

  const ligaDivision = await prisma.division.create({
    data: {
      tournament_id: tournament1.id,
      name: "Liga",
    },
  });

  const firstDivision = await prisma.division.create({
    data: {
      tournament_id: tournament1.id,
      name: "1. Division",
    },
  });
  console.log('Created divisions');

  await prisma.tournamentDate.createMany({
    data: [
      { tournament_id: tournament1.id, date: new Date(2024, 8, 15) },
      { tournament_id: tournament1.id, date: new Date(2024, 9, 5) },
      { tournament_id: tournament2.id, date: new Date(2024, 10, 20) },
    ],
  });

  console.log('Created Tournament dates');

  await prisma.tournamentTeam.createMany({
    data: [
      {
        tournament_id: tournament1.id,
        team_id: team1.id,
        division_id: ligaDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team2.id,
        division_id: ligaDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team3.id,
        division_id: firstDivision.id,
      },
    ],
  });

  console.log('Created tournament teams');
  // Create matches
  const matchDate1 = new Date(2024, 8, 15); // September 15, 2024
  const matchDate2 = new Date(2024, 9, 5); // October 5, 2024
  const matchDate3 = new Date(2024, 10, 20); // November 20, 2024

  await prisma.match.create({
    data: {
      tournament_id: tournament1.id,
      division_id: ligaDivision.id,
      team1_id: team1.id,
      team2_id: team3.id,
      team1_score: 5,
      team2_score: 3,
      winner_team_id: team1.id,
      match_date: matchDate1,
    },
  });

  await prisma.match.create({
    data: {
      tournament_id: tournament1.id,
      division_id: firstDivision.id,
      team1_id: team2.id,
      team2_id: team3.id,
      team1_score: 2,
      team2_score: 4,
      winner_team_id: team3.id,
      match_date: matchDate2,
    },
  });

  await prisma.match.create({
    data: {
      tournament_id: tournament2.id,
      team1_id: team1.id,
      team2_id: team2.id,
      team1_score: null,
      team2_score: null,
      winner_team_id: null,
      match_date: matchDate3,
    },
  });

  console.log('Created matches');

  console.log('FINISH seeding fakeData');
}