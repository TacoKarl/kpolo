import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma';
import * as bcrypt from "bcrypt"
import {UserRoles} from '../../src/auth/userRoles'



async function generateHash() {
  const saltRounds = Math.floor(Math.random() * 10) + 1; // Random salt rounds between 1 and 10
  return await bcrypt.hash('password123', saltRounds);
}

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
  //const passwordHash = await bcrypt.hash('password123', 10);

  const admin1 = await prisma.user.create({
    data: {
      name: 'Armin The Admin',
      email: 'armin@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: [ {id: systemAdminRole.id}] },
    },
  });

  const eventManager1 = await prisma.user.create({
    data: {
      name: 'Even T. Man',
      email: 'even@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: [ {id: eventManagerRole.id}] },
    },
  });

  // Create users for Club 1
  const manager1 = await prisma.user.create({
    data: {
      name: 'Lars Nielsen',
      email: 'lars@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: [{ id: clubAdminRole.id }, { id: clubMemberRole.id }, {id: systemAdminRole.id}] },
    },
  });

  const player1 = await prisma.user.create({
    data: {
      name: 'Anna Hansen',
      email: 'anna@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player2 = await prisma.user.create({
    data: {
      name: 'Mikkel Andersen',
      email: 'mikkel@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player3 = await prisma.user.create({
    data: {
      name: 'Sofia Jensen',
      email: 'sofia@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player6 = await prisma.user.create({
    data: {
      name: 'Freja Madsen',
      email: 'freja@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player7 = await prisma.user.create({
    data: {
      name: 'Noah Sørensen',
      email: 'noah@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player8 = await prisma.user.create({
    data: {
      name: 'Ida Petersen',
      email: 'ida@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player9 = await prisma.user.create({
    data: {
      name: 'Emil Jørgensen',
      email: 'emil@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player10 = await prisma.user.create({
    data: {
      name: 'Maja Thomsen',
      email: 'maja@kpolo.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  // Create users for Club 2
  const manager2 = await prisma.user.create({
    data: {
      name: 'Peter Larsen',
      email: 'peter@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: [{ id: clubAdminRole.id }, { id: clubMemberRole.id }] },
    },
  });

  const player4 = await prisma.user.create({
    data: {
      name: 'Emma Christensen',
      email: 'emma@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player5 = await prisma.user.create({
    data: {
      name: 'Oliver Pedersen',
      email: 'oliver@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player11 = await prisma.user.create({
    data: {
      name: 'Anna Møller',
      email: 'anna.moller@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player12 = await prisma.user.create({
    data: {
      name: 'Lucas Vestergaard',
      email: 'lucas@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player13 = await prisma.user.create({
    data: {
      name: 'Emma Lund',
      email: 'emma.lund@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player14 = await prisma.user.create({
    data: {
      name: 'Mads Holm',
      email: 'mads@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player15 = await prisma.user.create({
    data: {
      name: 'Alma Kristensen',
      email: 'alma@aarhuskayak.dk',
      password_hash: await generateHash(),
      roles: { connect: { id: clubMemberRole.id } },
    },
  });

  const player16 = await prisma.user.create({
    data: {
      name: 'Carl Johnson',
      email: 'carl.jonson@aarhuskayak.dk',
      password_hash: await generateHash(),
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
    where: { id: player6.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player7.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player8.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player9.id },
    data: { club_id: club1.id },
  });

  await prisma.user.update({
    where: { id: player10.id },
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

  await prisma.user.update({
    where: { id: player11.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player12.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player13.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player14.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player15.id },
    data: { club_id: club2.id },
  });

  await prisma.user.update({
    where: { id: player16.id },
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
      name: 'Krigerne',
      club_id: club1.id,
    },
  });

  const team4 = await prisma.team.create({
    data: {
      name: 'Berserkers',
      club_id: club1.id,
    },
  });

  const team5 = await prisma.team.create({
    data: {
      name: 'Winners',
      club_id: club1.id,
    },
  });

  const team6 = await prisma.team.create({
    data: {
      name: 'Hustlers',
      club_id: club1.id,
    },
  });

  const team7 = await prisma.team.create({
    data: {
      name: 'Sinners',
      club_id: club1.id,
    },
  });

  const team8 = await prisma.team.create({
    data: {
      name: 'Amagerboys',
      club_id: club1.id,
    },
  });

  const team9 = await prisma.team.create({
    data: {
      name: 'Aarhus Thunder',
      club_id: club2.id,
    },
  });

  const team10 = await prisma.team.create({
    data: {
      name: 'Aarhus Bangers',
      club_id: club2.id,
    },
  });

  const team11 = await prisma.team.create({
    data: {
      name: 'Aarhus Hakkedrenge',
      club_id: club2.id,
    },
  });

  const team12 = await prisma.team.create({
    data: {
      name: 'Aarhus Girlpower',
      club_id: club2.id,
    },
  });

  const team13 = await prisma.team.create({
    data: {
      name: 'Aarhus Girlbosses',
      club_id: club2.id,
    },
  });

  const team14 = await prisma.team.create({
    data: {
      name: 'Aarhus Paladins',
      club_id: club2.id,
    },
  });

  const team15 = await prisma.team.create({
    data: {
      name: 'Aarhus Raketterne',
      club_id: club2.id,
    },
  });

  const team16 = await prisma.team.create({
    data: {
      name: 'Aarhus Basarmene',
      club_id: club2.id,
    },
  });

  console.log('Created teams');

  // Create team memberships
  const currentDate = new Date();
  const joinDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of current year

  await prisma.teamMembership.createMany({
    data: [
      { team_id: team1.id, user_id: manager1.id, from_date: joinDate },
      { team_id: team1.id, user_id: player1.id, from_date: joinDate },
      { team_id: team2.id, user_id: player2.id, from_date: joinDate },
      { team_id: team2.id, user_id: player3.id, from_date: joinDate },
      { team_id: team3.id, user_id: player6.id, from_date: joinDate },
      { team_id: team3.id, user_id: player7.id, from_date: joinDate },
      { team_id: team4.id, user_id: player8.id, from_date: joinDate },
      { team_id: team4.id, user_id: player9.id, from_date: joinDate },
      { team_id: team5.id, user_id: player10.id, from_date: joinDate },
      { team_id: team5.id, user_id: manager1.id, from_date: joinDate },
      { team_id: team6.id, user_id: player1.id, from_date: joinDate },
      { team_id: team6.id, user_id: player2.id, from_date: joinDate },
      { team_id: team7.id, user_id: player3.id, from_date: joinDate },
      { team_id: team7.id, user_id: player6.id, from_date: joinDate },
      { team_id: team8.id, user_id: player7.id, from_date: joinDate },
      { team_id: team8.id, user_id: player8.id, from_date: joinDate },
      { team_id: team9.id, user_id: manager2.id, from_date: joinDate },
      { team_id: team9.id, user_id: player4.id, from_date: joinDate },
      { team_id: team10.id, user_id: player5.id, from_date: joinDate },
      { team_id: team10.id, user_id: player11.id, from_date: joinDate },
      { team_id: team11.id, user_id: player12.id, from_date: joinDate },
      { team_id: team11.id, user_id: player13.id, from_date: joinDate },
      { team_id: team12.id, user_id: player14.id, from_date: joinDate },
      { team_id: team12.id, user_id: player15.id, from_date: joinDate },
      { team_id: team13.id, user_id: player16.id, from_date: joinDate },
      { team_id: team13.id, user_id: manager2.id, from_date: joinDate },
      { team_id: team14.id, user_id: player4.id, from_date: joinDate },
      { team_id: team14.id, user_id: player5.id, from_date: joinDate },
      { team_id: team15.id, user_id: player11.id, from_date: joinDate },
      { team_id: team15.id, user_id: player12.id, from_date: joinDate },
      { team_id: team16.id, user_id: player13.id, from_date: joinDate },
      { team_id: team16.id, user_id: player14.id, from_date: joinDate },
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
      { tournament_id: tournament1.id, date: new Date(2026, 8, 15) },
      { tournament_id: tournament1.id, date: new Date(2026, 9, 5) },
      { tournament_id: tournament2.id, date: new Date(2026, 10, 20) },
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
        division_id: ligaDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team4.id,
        division_id: ligaDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team5.id,
        division_id: firstDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team6.id,
        division_id: firstDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team7.id,
        division_id: firstDivision.id,
      },
      {
        tournament_id: tournament1.id,
        team_id: team8.id,
        division_id: firstDivision.id,
      },
    ],
  });

  console.log('Created tournament teams');

  console.log('Didnt create matches, do it in the tournamentplanner');

  console.log('FINISH seeding fakeData');
}