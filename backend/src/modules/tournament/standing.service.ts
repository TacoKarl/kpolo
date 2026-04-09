import {Standing, Team} from "./tournament.types.js";

function createStandings(teamList: Team[]): Record<string, Standing> {
    return Object.fromEntries(teamList.map(t => [t.name, {
        team: t.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
    }]));
}

function recordResult(
    standings: Record<string, Standing>,
    team1: string,
    team2: string,
    score1: number,
    score2: number
): void {
    const t1 = standings[team1];
    const t2 = standings[team2];

    t1.played++;
    t2.played++;

    if (score1 > score2) {
        t1.wins++;    t1.points += 3;
        t2.losses++;
    } else if (score2 > score1) {
        t2.wins++;    t2.points += 3;
        t1.losses++;
    } else {
        t1.draws++;   t1.points += 1;
        t2.draws++;   t2.points += 1;
    }
}

function printStandings(standings: Record<string, Standing>): void {
    const sorted = Object.values(standings).sort((a, b) => b.points - a.points);

    console.log('\n' + '='.repeat(52));
    console.log('  STANDINGS');
    console.log('='.repeat(52));
    console.log(`${'Team'.padEnd(12)} ${'P'.padEnd(5)} ${'W'.padEnd(5)} ${'D'.padEnd(5)} ${'L'.padEnd(5)} Pts`);
    console.log('-'.repeat(52));
    sorted.forEach(s => {
        console.log(
            `${s.team.padEnd(12)} ` +
            `${String(s.played).padEnd(5)} ` +
            `${String(s.wins).padEnd(5)} ` +
            `${String(s.draws).padEnd(5)} ` +
            `${String(s.losses).padEnd(5)} ` +
            `${s.points}`
        );
    });
    console.log('='.repeat(52));
}

const teamList: Team[] = [
    { name: 'Hold A' },
    { name: 'Hold B' },
    { name: 'Hold C' },
    { name: 'Hold D' },
    { name: 'Hold E' },
    { name: 'Hold F' },
    { name: 'Hold G' },
    { name: 'Hold H' },
];

const standings = createStandings(teamList);

recordResult(standings, 'Hold A', 'Hold B', 3, 1); // A wins
recordResult(standings, 'Hold C', 'Hold D', 2, 2); // draw
recordResult(standings, 'Hold E', 'Hold F', 0, 2); // F wins

printStandings(standings);