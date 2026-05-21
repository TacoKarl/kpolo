import 'dotenv/config';
import { PrismaClient } from '../../src/generated/prisma';
import * as bcrypt from "bcrypt"
import {UserRoles} from '../../src/auth/userRoles'

export async function seedMegaFakeData(prisma: PrismaClient) {
  console.log('START seeding megaFakaData...');

  // Fetch roles
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

  // Create 20 clubs
  console.log('Creating 20 clubs...');
  const clubs = [];
  const clubNames = [
    'Copenhagen Kayak Polo Club', 'Aarhus Kayak Club', 'Odense Water Sports',
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
    const teamsPerClub = 2 + Math.floor(Math.random() * 2); // 2-3 teams per club

    for (let t = 0; t < teamsPerClub; t++) {
      const teamName = `${club.name} ${teamNames[Math.floor(Math.random() * teamNames.length)]}`;
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
  const seasons = ['2024-2025', '2025-2026'];
  
  for (const season of seasons) {
    const tournament = await prisma.tournament.create({
      data: {
        season,
        name: `Danish Kayak Polo League ${season}`,
      },
    });
    tournaments.push(tournament);

    // Create a second tournament per season
    const tournament2 = await prisma.tournament.create({
      data: {
        season,
        name: `Regional Championship ${season}`,
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

  // Create 1000+ matches
  console.log('Creating 1000+ matches...');
  let matchCount = 0;
  const batchSize = 100;
  const matchesArray = [];

  for (const tournament of tournaments) {
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournament_id: tournament.id },
    });

    if (tournamentTeams.length < 2) continue;

    const tournamentDivisions = divisions.filter(d => d.tournament_id === tournament.id);

    // Create matches for round-robin style tournament
    // Generate ~250 matches per tournament
    const targetMatches = 250;
    const baseDate = new Date(2024, 0, 1);

    for (let m = 0; m < targetMatches; m++) {
      const teamA = tournamentTeams[Math.floor(Math.random() * tournamentTeams.length)];
      const teamB = tournamentTeams[Math.floor(Math.random() * tournamentTeams.length)];

      // Ensure different teams
      if (teamA.team_id === teamB.team_id) continue;

      const matchDay = Math.floor(Math.random() * 200); // Spread across 200 days
      const matchDate = new Date(baseDate);
      matchDate.setDate(matchDate.getDate() + matchDay);

      const homeScore = Math.floor(Math.random() * 10);
      const awayScore = Math.floor(Math.random() * 10);
      const winnerId = homeScore > awayScore ? teamA.team_id : 
                       awayScore > homeScore ? teamB.team_id : null;

      matchesArray.push({
        tournament_id: tournament.id,
        division_id: teamA.division_id,
        home_team_id: teamA.team_id,
        away_team_id: teamB.team_id,
        home_team_score: homeScore,
        away_team_score: awayScore,
        field: (m % 5) + 1,
        winner_team_id: winnerId,
        match_date: matchDate,
      });

      matchCount++;

      // Batch create every 100 matches
      if (matchesArray.length >= batchSize) {
        await prisma.match.createMany({
          data: matchesArray,
        });
        console.log(`  Created ${matchCount} matches...`);
        matchesArray.length = 0;
      }
    }
  }

  // Create remaining matches
  if (matchesArray.length > 0) {
    await prisma.match.createMany({
      data: matchesArray,
    });
  }
  console.log(`Created ${matchCount} matches total`);

  console.log('FINISH seeding megaFakaData');
  console.log(`\n=== SUMMARY ===`);
  console.log(`Users: ${users.length}`);
  console.log(`Teams: ${teams.length}`);
  console.log(`Clubs: ${clubs.length}`);
  console.log(`Tournaments: ${tournaments.length}`);
  console.log(`Matches: ${matchCount}`);
}
