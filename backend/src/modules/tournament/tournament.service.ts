import {Team, Match} from "./tournament.types.js";

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function minutesToTime(totalMinutes: number): string {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function generateGrundspil(teamList: Team[], fields: number, days: number, startTime: number): Match[] {
    const SLOT_DURATION = 30;
    const BASE_MINUTES = startTime * 60;

    const firstPass: [string, string][] = [];
    const secondPass: [string, string][] = [];
    for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
            firstPass.push([teamList[i].name, teamList[j].name]);
            secondPass.push([teamList[i].name, teamList[j].name]);
        }
    }

    const pairs = [...firstPass, ...secondPass];


    let shuffledPairs = shuffle([...pairs]);
    for (let i = 0; i < days; i++) {
        shuffledPairs = shuffle([...shuffledPairs]);
    }

    const dayBuckets: [string, string][][] = Array.from({ length: days }, () => []);
    shuffledPairs.forEach((pair, idx) => {
        dayBuckets[idx % days].push(pair);
    });

    const matches: Match[] = [];
    let matchNumber = 1;

    dayBuckets.forEach((dayPairs, dayIndex) => {
        const remaining = [...dayPairs];
        let slotIndex = 0;
        const lastSlotPairs = new Set<string>();

        while (remaining.length > 0) {
            const usedTeams = new Set<string>();
            const slotMatches: [string, string][] = [];
            const toRemove: number[] = [];
            const thisSlotPairs = new Set<string>();

            // Pick up to `fields` non-conflicting matches for this slot
            for (let i = 0; i < remaining.length && slotMatches.length < fields; i++) {
                const [t1, t2] = remaining[i];
                const pairKey = `${t1}|${t2}`;
                if (!usedTeams.has(t1) && !usedTeams.has(t2) && !lastSlotPairs.has(pairKey)) {
                    slotMatches.push([t1, t2]);
                    usedTeams.add(t1);
                    usedTeams.add(t2);
                    thisSlotPairs.add(pairKey);
                    toRemove.push(i);
                }
            }

            // Safety: if guard blocks everything, clear it and retry
            if (slotMatches.length === 0) {
                lastSlotPairs.clear();
                continue;
            }

            // Remove scheduled matches (reverse order to preserve indices)
            for (let i = toRemove.length - 1; i >= 0; i--) {
                remaining.splice(toRemove[i], 1);
            }

            const startTime = minutesToTime(BASE_MINUTES + slotIndex * SLOT_DURATION);

            slotMatches.forEach(([team1, team2], fieldIdx) => {
                matches.push({
                    matchNumber: matchNumber++,
                    team1,
                    team2,
                    round: dayIndex + 1,
                    field: fieldIdx + 1,
                    startTime,
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



const grundspilKampe = generateGrundspil(teamList, 2, 3, 10);

function printSchedule(matches: Match[]): void {
    const days: Record<number, Match[]> = {};
    matches.forEach(m => {
        if (!days[m.round]) days[m.round] = [];
        days[m.round].push(m);
    });

    Object.entries(days).forEach(([day, dayMatches]) => {
        console.log(`\n${'='.repeat(52)}`);
        console.log(`  DAY ${day}  —  ${dayMatches.length} matches`);
        console.log('='.repeat(52));
        console.log(`${'Time'.padEnd(8)} ${'#'.padEnd(5)} ${'Match'.padEnd(28)} Field`);
        console.log('-'.repeat(52));

        let lastTime = '';
        dayMatches.forEach(m => {
            if (lastTime && m.startTime !== lastTime) {
                console.log('-'.repeat(52));
            }
            const match = `${m.team1} vs ${m.team2}`;
            console.log(
                `${m.startTime.padEnd(8)} ` +
                `#${String(m.matchNumber).padEnd(4)} ` +
                `${match.padEnd(28)} ` +
                `Field ${m.field}`
            );
            lastTime = m.startTime;
        });
    });

    console.log(`\n${'='.repeat(52)}`);
    console.log(`  TOTAL: ${matches.length} matches`);
    console.log('='.repeat(52));
}

printSchedule(grundspilKampe);