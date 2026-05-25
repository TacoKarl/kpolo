// Denne fil er nærmest 100% AI genereret, for at teste en af kravene i vores Accept Test

import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma';
import * as bcrypt from "bcrypt"
import {UserRoles} from '../../src/auth/userRoles'

function createTournamentDay(baseDate: Date, dayOffset: number) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

function createSlotDate(baseDate: Date, minutesFromMidnight: number) {
  const date = new Date(baseDate);
  const hours = Math.floor(minutesFromMidnight / 60);
  const minutes = minutesFromMidnight % 60;
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

export async function seedMegaFakeData(prisma: PrismaClient) {
  console.log('START seeding megaFakeData...');

  // Fetch roles
  const clubMemberRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubMember },
  });

  const clubAdminRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubAdmin },
  });

  const trainerRole = await prisma.role.findUniqueOrThrow({
    where: { role: UserRoles.ClubTrainer },
  });

  console.log('Fetched roles');

  // Hash password for all users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create 20 clubs
  console.log('Creating 20 clubs...');
  const clubs = [];
  const clubNames = [
    'CPH Kayakers', 'De Hvide fra Aarhus', 'Odense Water Sports',
    'Aalborg Maritime Club', 'Randers Paddling Society', 'Vejle Kayak Team',
    'Silkeborg Waterway Club', 'Kolding Kayak Association', 'Horsens Water Polo',
    'Svendborg Marine Society', 'Nyborg Aquatic Club', 'Slagelse Kayak Team',
    'Ribe Water Sports', 'Tønder Coastal Club', 'Skagen Nordic Paddlers',
    'Frederikshavn Arctic Club', 'Hirtshals Viking Kayaks', 'Holstebro Rapids Team',
    'Ikast Waterway Club', 'Herning Lake Polo'
  ];

  const regions = [
    'Sjælland', 'Jylland', 'Jylland', 'Jylland', 'Jylland',
    'Jylland', 'Jylland', 'Jylland', 'Jylland', 'Fyn',
    'Fyn', 'Sjælland', 'Jylland', 'Jylland', 'Jylland',
    'Jylland', 'Jylland', 'Jylland', 'Jylland', 'Jylland'
  ];

  for (let i = 0; i < 20; i++) {
    const club = await prisma.club.create({
      data: {
        name: clubNames[i],
        region: regions[i],
        address: `Havnevej ${45 + i}, ${8000 + i} City ${i}`,
      },
    });
    clubs.push(club);
  }
  console.log('Created 20 clubs');

  // Create 1000+ users (50 users per club on average)
  console.log('Creating 1000+ users...');
  const firstNames = ['Anna', 'Emma', 'Marie', 'Sofia', 'Laura', 'Sophia', 'Olivia', 'Isabella', 'Mia', 'Ava',
    'Lars', 'Peter', 'Mikkel', 'Anders', 'Henrik', 'Christian', 'Martin', 'Tom', 'Klaus', 'Erik'];
  const lastNames = ['Hansen', 'Jensen', 'Nielsen', 'Andersen', 'Christensen', 'Larsen', 'Petersen', 'Pedersen',
    'Madsen', 'Jorgensen', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez'];

  const users = [];
  let userCount = 0;

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const usersPerClub = 50 + Math.floor(Math.random() * 10); // 50-60 users per club
    
    for (let u = 0; u < usersPerClub; u++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      const email = `user${userCount}@kpolo.dk`;

      const roles = [{ id: clubMemberRole.id }];
      
      // Some users are club admins or trainers
      if (Math.random() < 0.05) {
        roles.push({ id: clubAdminRole.id });
      }
      if (Math.random() < 0.1) {
        roles.push({ id: trainerRole.id });
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: passwordHash,
          club_id: club.id,
          roles: { connect: roles },
        },
      });
      users.push(user);
      userCount++;

      if (userCount % 100 === 0) {
        console.log(`  Created ${userCount} users...`);
      }
    }
  }
  console.log(`Created ${users.length} users total`);

  // Create 50+ teams (2-3 teams per club on average)
  console.log('Creating 50+ teams...');
  const teams = [];
  const teamNames = ['Warriors', 'Vikings', 'Thunder', 'Dragons', 'Eagles', 'Sharks', 'Wolves', 'Tigers',
    'Panthers', 'Bears', 'Lions', 'Hawks', 'Falcons', 'Phoenixes', 'Glaciers', 'Rapids', 'Waves', 'Currents'];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const teamsPerClub = 3 + Math.floor(Math.random() * 2); // 3-4 teams per club
    const usedTeamNamesInClub = new Set<string>();

    for (let t = 0; t < teamsPerClub; t++) {
      let teamName: string;
      let attempts = 0;
      
      // Ensure unique team name within the club
      do {
        const baseName = teamNames[Math.floor(Math.random() * teamNames.length)];
        teamName = `${baseName} ${String.fromCharCode(65 + t)}`; // A, B, C, etc.
        attempts++;
      } while (usedTeamNamesInClub.has(teamName) && attempts < 10);
      
      usedTeamNamesInClub.add(teamName);
      
      const team = await prisma.team.create({
        data: {
          name: teamName,
          club_id: club.id,
        },
      });
      teams.push(team);
    }
  }
  console.log(`Created ${teams.length} teams total`);

  // Create team memberships
  console.log('Creating team memberships...');
  const currentDate = new Date();
  const joinDate = new Date(currentDate.getFullYear(), 0, 1);

  let teamMembershipCount = 0;
  for (const team of teams) {
    // Get users from the same club
    const clubUsers = users.filter(u => u.club_id === team.club_id);
    
    // Assign 10-20 users per team
    const usersPerTeam = 10 + Math.floor(Math.random() * 11);
    const teamUsers: { name: string; email: string; password_hash: string; id: number; club_id: number | null; }[] = [];
    for (let i = 0; i < usersPerTeam && i < clubUsers.length; i++) {
      const randomUser = clubUsers[Math.floor(Math.random() * clubUsers.length)];
      if (!teamUsers.includes(randomUser)) {
        teamUsers.push(randomUser);
      }
    }

    const membershipData = teamUsers.map(u => ({
      team_id: team.id,
      user_id: u.id,
      from_date: joinDate,
    }));

    if (membershipData.length > 0) {
      await prisma.teamMembership.createMany({
        data: membershipData,
      });
      teamMembershipCount += membershipData.length;
    }
  }
  console.log(`Created ${teamMembershipCount} team memberships`);

  // Create tournaments
  console.log('Creating tournaments...');
  const tournaments = [];
  const seasons = ['2024-2025', '2025-2026', '2026-2027'];
  
  for (const season of seasons) {
    const tournament = await prisma.tournament.create({
      data: {
        season,
        name: `Dansk Kajakpolo Turnering`,
      },
    });
    tournaments.push(tournament);

    // Create a second tournament per season
    const tournament2 = await prisma.tournament.create({
      data: {
        season,
        name: `Det Regionale Mesterskab`,
      },
    });
    tournaments.push(tournament2);
  }
  console.log(`Created ${tournaments.length} tournaments`);

  // Create divisions for each tournament
  console.log('Creating divisions...');
  const divisions = [];
  for (const tournament of tournaments) {
    const liga = await prisma.division.create({
      data: {
        tournament_id: tournament.id,
        name: 'Liga',
      },
    });
    divisions.push(liga);

    const firstDiv = await prisma.division.create({
      data: {
        tournament_id: tournament.id,
        name: '1. Division',
      },
    });
    divisions.push(firstDiv);

    const secondDiv = await prisma.division.create({
      data: {
        tournament_id: tournament.id,
        name: '2. Division',
      },
    });
    divisions.push(secondDiv);
  }
  console.log(`Created ${divisions.length} divisions`);

  // Assign teams to tournaments
  console.log('Assigning teams to tournaments...');
  let tournamentTeamCount = 0;
  for (const tournament of tournaments) {
    const tournamentDivisions = divisions.filter(d => d.tournament_id === tournament.id);
    
    // Assign ~25 teams per tournament (distribute across divisions)
    const teamsForTournament = teams.slice(0, Math.min(25, teams.length));
    
    for (const team of teamsForTournament) {
      const division = tournamentDivisions[Math.floor(Math.random() * tournamentDivisions.length)];
      
      await prisma.tournamentTeam.create({
        data: {
          tournament_id: tournament.id,
          team_id: team.id,
          division_id: division.id,
        },
      });
      tournamentTeamCount++;
    }
  }
  console.log(`Created ${tournamentTeamCount} tournament team assignments`);

  // Create tournament dates and scheduled matches
  console.log('Creating tournament dates and matches...');
  const matchesArray: {
    tournament_id: number;
    division_id: number | null;
    home_team_id: number;
    away_team_id: number;
    home_team_score: number | null;
    away_team_score: number | null;
    winner_team_id: number | null;
    field: number;
    match_date: Date;
  }[] = [];

  const slotMinutes = Array.from({ length: 17 }, (_, i) => 8 * 60 + i * 30); // 08:00 -> 16:00
  const datesPerTournament = 20;
  const baseTournamentDate = new Date(Date.UTC(2024, 0, 1));

  let matchCount = 0;
  let tournamentDateCount = 0;

  for (const tournament of tournaments) {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournament_id: tournament.id },
    });

    if (tournamentTeams.length < 2) continue;

    const tournamentDatesForTournament = Array.from({ length: datesPerTournament }, (_, dayIndex) => ({
      tournament_id: tournament.id,
      date: createTournamentDay(baseTournamentDate, dayIndex),
    }));

    await prisma.tournamentDate.createMany({
      data: tournamentDatesForTournament,
    });
    tournamentDateCount += tournamentDatesForTournament.length;

    const opponentOffset = Math.max(1, Math.floor(tournamentTeams.length / 3));

    tournamentDatesForTournament.forEach((tournamentDate, dayIndex) => {
      slotMinutes.forEach((minutesFromMidnight, slotIndex) => {
        const homeIndex = (dayIndex * slotMinutes.length + slotIndex) % tournamentTeams.length;
        const awayIndex = (homeIndex + opponentOffset) % tournamentTeams.length;

        const homeTeam = tournamentTeams[homeIndex];
        const awayTeam = tournamentTeams[awayIndex];
        const homeScore = Math.floor(Math.random() * 10);
        const awayScore = Math.floor(Math.random() * 10);
        const winnerId = homeScore > awayScore ? homeTeam.team_id :
          awayScore > homeScore ? awayTeam.team_id : null;

        matchesArray.push({
          tournament_id: tournament.id,
          division_id: homeTeam.division_id,
          home_team_id: homeTeam.team_id,
          away_team_id: awayTeam.team_id,
          home_team_score: homeScore,
          away_team_score: awayScore,
          field: (slotIndex % 5) + 1,
          winner_team_id: winnerId,
          match_date: createSlotDate(tournamentDate.date, minutesFromMidnight),
        });

        matchCount++;
      });
    });

    console.log(`  Created ${tournamentDatesForTournament.length} tournament dates and ${slotMinutes.length * tournamentDatesForTournament.length} matches for ${tournament.name}`);
  }

  if (matchesArray.length > 0) {
    await prisma.match.createMany({
      data: matchesArray,
    });
  }
  console.log(`Created ${tournamentDateCount} tournament dates total`);
  console.log(`Created ${matchCount} matches total`);
  // Create 12 fines across different clubs
  console.log('Creating fines...');

  function randomDateBetween(yearMin: number, yearMax: number) {
    const year = yearMin + Math.floor(Math.random() * (yearMax - yearMin + 1));
    const month = Math.floor(Math.random() * 12);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const day = 1 + Math.floor(Math.random() * daysInMonth);
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return new Date(Date.UTC(year, month, day, hour, minute, 0, 0));
  }

  function shuffle<T>(arr: T[]) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const reasons = [
    'Manglende indbetaling af årligt medlemskontingent',
    'Bøde for ødelagt udstyr ved træning',
    'Forsinket betaling af turneringsgebyr for hold',
    'Overtrædelse af sikkerhedsregler ved klubarrangement',
    'Parkering på forbudt område ved hallen',
    'Skader forårsaget på klubbens både under kamp',
    'Manglende aflevering af nøgle efter låsning',
    'Bortkommen båd uden registrering og ansvar',
    'Forsinket afmelding til træning uden grund',
    'Uautoriseret udlevering af klubudstyr til gæstespiller',
    'Manglende rengøring af klubfaciliteter efter brug',
    'Bøde for overtrædelse af svømmehalsregler under træning',
  ];

  const clubCandidates = clubs.length >= 12 ? shuffle(clubs).slice(0, 12) : Array.from({ length: 12 }, (_, i) => clubs[i % clubs.length]);

  const finesData = clubCandidates.map((club, idx) => {
    const amount = 200 + Math.floor(Math.random() * (3000 - 200 + 1));
    const date = randomDateBetween(2024, 2026);
    const paid = idx < 9; // first 9 are paid
    return {
      club_id: club.id,
      reason: reasons[idx % reasons.length],
      amount,
      date,
      paid,
    };
  });

  await prisma.fine.createMany({ data: finesData });
  console.log(`Created ${finesData.length} fines`);

  console.log('FINISH seeding megaFakaData');
  console.log(`\n=== SUMMARY ===`);
  console.log(`Users: ${users.length}`);
  console.log(`Teams: ${teams.length}`);
  console.log(`Clubs: ${clubs.length}`);
  console.log(`Tournaments: ${tournaments.length}`);
  console.log(`Matches: ${matchCount}`);
}
