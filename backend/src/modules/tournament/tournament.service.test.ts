import {shuffle, minutesToTime, generateGrundspil} from "./tournament.service";
import {describe, expect, it, jest, test} from "@jest/globals";
import {Match, Team} from "./tournament.types";

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
// 8 hold → 28 unikke par → 56 kampe i alt (2 gange)

function createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function assertMaxTwoConsecutiveMatches(matches: Match[], teams: Team[]): void {
    const slots = new Map<string, Set<string>>();

    matches.forEach(({round, startTime, team1, team2}) => {
        const slotKey = `${round}-${startTime}`;
        const teamsInSlot = slots.get(slotKey) ?? new Set<string>();

        teamsInSlot.add(team1);
        teamsInSlot.add(team2);
        slots.set(slotKey, teamsInSlot);
    });

    const orderedSlots = [...slots.entries()].sort(([slotA], [slotB]) => {
        const [roundA, timeA] = slotA.split("-");
        const [roundB, timeB] = slotB.split("-");

        return Number(roundA) !== Number(roundB)
            ? Number(roundA) - Number(roundB)
            : timeA.localeCompare(timeB);
    });

    teams.forEach(({name}) => {
        let streak = 0;
        let currentRound: number | null = null;

        orderedSlots.forEach(([slotKey, teamsInSlot]) => {
            const [round] = slotKey.split("-");
            const slotRound = Number(round);

            if (currentRound !== slotRound) {
                streak = 0;
                currentRound = slotRound;
            }

            streak = teamsInSlot.has(name) ? streak + 1 : 0;
            if (streak > 2) {
                throw new Error(`${name} spiller ${streak} kampe i streg ved slot ${slotKey}`);
            }
        });
    });
}


describe('minutesToTime', () => {
    it('Konverterer hele timer korret', () => {
        expect(minutesToTime(600)).toBe('10:00')
    });
    it("konverterer timer + minutter korrekt", () => {
        expect(minutesToTime(630)).toBe("10:30");
    });

    it("zero-padder enkeltcifrede værdier", () => {
        expect(minutesToTime(65)).toBe("01:05");
    });

    it("håndterer 0 minutter", () => {
        expect(minutesToTime(0)).toBe("00:00");
    });
    it("håndterer over 24 timer", () => {
        expect(minutesToTime(2940 + 1440)).toBe("01:00");
    });
    it("håndterer under 0 min", () => {
        expect(minutesToTime(-200)).toBe("00:00");
    });
})
describe("Tournament Generate Grundspil", () => {
    const matches = generateGrundspil(teamList, 2, 3, 10)
    it("Generer rigtigt antal kampe", () => {
        expect(matches).toHaveLength(56)
    })
    it('Hvert hold møder hinanden præcist 2 gange', () => {
        const counts: Record<string, Record<string, number>> = {}

        matches.forEach(({ team1, team2}) => {
            counts[team1] ??= {};
            counts[team2] ??= {};
            counts[team1][team2] = (counts[team1][team2] ?? 0) + 1;
            counts[team2][team1] = (counts[team2][team1] ?? 0) + 1;
        });
        teamList.forEach(t1 => {
            teamList.forEach(t2 => {
                if (t1.name !== t2.name) {
                    expect(counts[t1.name][t2.name]).toBe(2);
                }
            });
        });
    });
    it("et hold spiller højst 2 kampe i streg før en pause", () => {
        const matches = generateGrundspil(teamList, 2, 3, 10);

        // Sortér alle kampe kronologisk (dag → tidspunkt)
        const sorted = [...matches].sort((a, b) =>
            a.round !== b.round
                ? a.round - b.round
                : a.startTime.localeCompare(b.startTime)
        );

        // Opbyg en liste af unikke tidslots i orden
        const slots = [...new Set(sorted.map(m => `${m.round}-${m.startTime}`))];

        // Tjek hvert hold
        const teamNames = teamList.map(t => t.name);
        teamNames.forEach(team => {
            let consecutive = 0;

            slots.forEach(slot => {
                const [round, time] = slot.split("-");
                const playedThisSlot = sorted.some(
                    m =>
                        m.round === Number(round) &&
                        m.startTime === time &&
                        (m.team1 === team || m.team2 === team)
                );

                if (playedThisSlot) {
                    consecutive++;
                    expect(consecutive).toBeLessThanOrEqual(2); // max 2 i streg
                } else {
                    consecutive = 0; // pause → nulstil
                }
            });
        });
    });
})
