import { minutesToTime, generateGrundspil} from "./tournament.service";
import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Match, Team} from "./tournament.types";

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
// 8 hold → 28 unikke par → 56 kampe i alt (2 gange)


const dates = [
    new Date("2025-06-01"),
    new Date("2025-06-08"),
    new Date("2025-06-15"),
];
function createSeededRandom(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function assertMaxTwoConsecutiveMatches(matches: Match[], teams: Team[]): void {
    const slots = new Map<string, Set<number>>();

    matches.forEach(({match_date, team1_id, team2_id}) => {
        const slotDate = new Date(match_date);
        const slotKey = `${slotDate.toISOString().slice(0, 16)}`;
        const teamsInSlot = slots.get(slotKey) ?? new Set<number>();

        teamsInSlot.add(team1_id);
        teamsInSlot.add(team2_id);
        slots.set(slotKey, teamsInSlot);
    });

    const orderedSlots = [...slots.entries()].sort(([slotA], [slotB]) => {
        return slotA.localeCompare(slotB);
    });

    teams.forEach(({id, name}) => {
        let streak = 0;
        let previousSlotTime: number | null = null;

        orderedSlots.forEach(([slotKey, teamsInSlot]) => {
            const currentSlotTime = new Date(slotKey).getTime();

            if (
                previousSlotTime === null ||
                currentSlotTime - previousSlotTime > 30 * 60 * 1000
            ) {
                streak = 0;
            }

            streak = teamsInSlot.has(id) ? streak + 1 : 0;
            if (streak > 2) {
                throw new Error(`${name} spiller ${streak} kampe i streg ved slot ${slotKey}`);
            }

            previousSlotTime = currentSlotTime;
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
    beforeEach(() => {
        jest.spyOn(Math, "random").mockImplementation(createSeededRandom(1));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("Generer rigtigt antal kampe", () => {
        const matches = generateGrundspil(teamList, 2, dates, 10, 0, 0);
        expect(matches).toHaveLength(56)
    })
    it('Hvert hold møder hinanden præcist 2 gange', () => {
        const matches = generateGrundspil(teamList, 2, dates, 10, 0, 0);
        const counts: Record<string, Record<string, number>> = {}

        matches.forEach(({team1_id, team2_id}) => {
            const team1 = String(team1_id);
            const team2 = String(team2_id);

            counts[team1] ??= {};
            counts[team2] ??= {};
            counts[team1][team2] = (counts[team1][team2] ?? 0) + 1;
            counts[team2][team1] = (counts[team2][team1] ?? 0) + 1;
        });
        teamList.forEach(t1 => {
            teamList.forEach(t2 => {
                if (t1.name !== t2.name) {
                    expect(counts[String(t1.id)][String(t2.id)]).toBe(2);
                }
            });
        });
    });
    it("et hold spiller højst 2 kampe i streg før en pause", () => {
        const matches = generateGrundspil(teamList, 2, dates, 10, 0, 0);
        assertMaxTwoConsecutiveMatches(matches, teamList);
    });
})
