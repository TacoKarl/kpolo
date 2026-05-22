import {Team, Match} from "./tournament.types.js";

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function minutesToTime(totalMinutes: number): string {
    if (totalMinutes <= 0) {
        return "00:00"
    }
    while (totalMinutes > 1440) {
        totalMinutes -= 1440;
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function createMatchDate(baseDate: Date, totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const d = new Date(baseDate);
    d.setUTCHours(hours, minutes, 0, 0);
    return d.toISOString();
}

function generateGrundspil(
    teamList: Team[],
    fields: number,
    dates: Date[],
    startTime: number,
    tournamentId: number,
    divisionId: number | null
): Match[] {
    const SLOT_DURATION = 30;
    const BASE_MINUTES = startTime * 60;
    const days = dates.length;

    const firstPass: [Team, Team][] = [];
    const secondPass: [Team, Team][] = [];
    for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
            firstPass.push([teamList[i], teamList[j]]);
            secondPass.push([teamList[i], teamList[j]]);
        }
    }

    const pairs = [...firstPass, ...secondPass];


    let shuffledPairs = shuffle([...pairs]);
    for (let i = 0; i < days; i++) {
        shuffledPairs = shuffle([...shuffledPairs]);
    }

    const dayBuckets: [Team, Team][][] = Array.from({ length: days }, () => []);
    shuffledPairs.forEach((pair, idx) => {
        dayBuckets[idx % days].push(pair);
    });

    const matches: Match[] = [];

    dayBuckets.forEach((dayPairs, dayIndex) => {
        const baseDate = dates[dayIndex];
        const teamConsecutive: Record<number, number> = {};
        const remaining = [...dayPairs];
        let slotIndex = 0;
        const lastSlotPairs = new Set<string>();

        while (remaining.length > 0) {
            const usedTeams = new Set<number>();
            const slotMatches: [Team, Team][] = [];
            const toRemove: number[] = [];
            const thisSlotPairs = new Set<string>();

            // Pick up to `fields` non-conflicting matches for this slot
            for (let i = 0; i < remaining.length && slotMatches.length < fields; i++) {
                const [t1, t2] = remaining[i];
                const pairKey = `${t1.id}|${t2.id}`;

                const t1Consecutive = teamConsecutive[t1.id] ?? 0;
                const t2Consecutive = teamConsecutive[t2.id] ?? 0;

                if (
                    !usedTeams.has(t1.id) &&
                    !usedTeams.has(t2.id) &&
                    !lastSlotPairs.has(pairKey) &&
                    t1Consecutive < 2 &&
                    t2Consecutive < 2 ) {
                    slotMatches.push([t1, t2]);
                    usedTeams.add(t1.id);
                    usedTeams.add(t2.id);
                    thisSlotPairs.add(pairKey);
                    toRemove.push(i);
                }
            }
            slotMatches.forEach(([t1, t2]) => {
                teamConsecutive[t1.id] = (teamConsecutive[t1.id] ?? 0) + 1;
                teamConsecutive[t2.id] = (teamConsecutive[t2.id] ?? 0) + 1;
            });

            // Safety: if guard blocks everything, clear it and retry
            if (slotMatches.length === 0) {
                teamList.forEach(({ id }) => {
                    teamConsecutive[id] = 0;
                });
                lastSlotPairs.clear();
                slotIndex++;
                continue;
            }

            teamList.forEach(({ id }) => {
                if (!usedTeams.has(id)) {
                    teamConsecutive[id] = 0;
                }
            });

            // Remove scheduled matches (reverse order to preserve indices)
            for (let i = toRemove.length - 1; i >= 0; i--) {
                remaining.splice(toRemove[i], 1);
            }

            const slotStartMinutes = BASE_MINUTES + slotIndex * SLOT_DURATION;
            const matchDate = createMatchDate(baseDate, slotStartMinutes);  // ← rigtig dato

            slotMatches.forEach(([team1, team2], fieldIdx) => {
                matches.push({
                    tournament_id: tournamentId,
                    division_id: divisionId,
                    home_team_id: team1.id,
                    home_team_score: null,
                    away_team_id: team2.id,
                    away_team_score: null,
                    winner_team_id: null,
                    field: fieldIdx + 1,
                    match_date: matchDate,
                });
            });
            lastSlotPairs.clear();
            thisSlotPairs.forEach(p => lastSlotPairs.add(p));
            slotIndex++;
        }
    });
    return matches;
}

// Test
/*
const teamList: Team[] = [
    { id: 1, name: 'Hold A' },
    { id: 2, name: 'Hold B' },
    { id: 3, name: 'Hold C' },
    { id: 4, name: 'Hold D' },
    { id: 5, name: 'Hold E' },
    { id: 6, name: 'Hold F' },
    { id: 7, name: 'Hold G' },
    { id: 8, name: 'Hold H' },
];
*/


/*
const dates = [
    new Date("2025-06-01"),
    new Date("2025-06-08"),
    new Date("2025-06-15"),
];
*/

//const kampe = generateGrundspil(teamList, 2, dates, 10, 1, null);
/*function printSchedule(matches: Match[]): void {
    const days: Record<string, Match[]> = {};

    matches.forEach(m => {
        const dateKey = m.match_date.split('T')[0]; // ← "2025-06-01" uden tid
        if (!days[dateKey]) days[dateKey] = [];
        days[dateKey].push(m);
    });

    Object.entries(days).forEach(([day, dayMatches]) => {
        // Sortér kampe inden for dagen kronologisk
        dayMatches.sort((a, b) => a.match_date.localeCompare(b.match_date));

        console.log(`\n${'='.repeat(52)}`);
        console.log(`  DAY ${day}  —  ${dayMatches.length} matches`);
        console.log('='.repeat(52));
        console.log(`${'Time'.padEnd(8)} ${'Match'.padEnd(28)} Field`);
        console.log('-'.repeat(52));

        let lastTime = '';
        dayMatches.forEach(m => {
            const time = m.match_date.split('T')[1].slice(0, 5); // ← "10:30"

            if (lastTime && time !== lastTime) {
                console.log('-'.repeat(52));
            }

            const match = `${m.team1_id} vs ${m.team2_id}`;
            console.log(
                `${time.padEnd(8)}` +
                `${match.padEnd(28)}` +
                `Field ${m.field}`
            );
            lastTime = time;
        });
    });

    console.log(`\n${'='.repeat(52)}`);
    console.log(`  TOTAL: ${matches.length} matches`);
    console.log('='.repeat(52));
}
*/
export {shuffle, minutesToTime, generateGrundspil}
