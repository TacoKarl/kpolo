'use client';

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

type PlanRow = {
    slot: string;
    match: string;
    division: string;
    court: string;
    status: string;
};

const dummyRows: PlanRow[] = [
    { slot: "08:00 - 08:30", match: "Team A vs Team B", division: "U12", court: "Bane 1", status: "Planned" },
    { slot: "08:30 - 09:00", match: "Team C vs Team D", division: "U12", court: "Bane 2", status: "Planned" },
    { slot: "09:00 - 09:30", match: "Team E vs Team F", division: "U14", court: "Bane 1", status: "Planned" },
    { slot: "09:30 - 10:00", match: "Team G vs Team H", division: "U14", court: "Bane 2", status: "Planned" },
    { slot: "10:00 - 10:30", match: "Team I vs Team J", division: "U16", court: "Bane 3", status: "Planned" },
];

export default function Page() {
    const [selectedTournamentId, setSelectedTournamentId] = useState("");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("");

    const tournaments = useMemo(
        () => [
            { id: "1", name: "Sommer Cup 2026" },
            { id: "2", name: "Vinter Serie 2026" },
            { id: "3", name: "Mesterskab 2026" },
        ],
        []
    );

    const algorithms = useMemo(
        () => [
            { id: "simple-seed", name: "Simple seed" },
            { id: "balanced-slots", name: "Balanced slots" },
            { id: "court-rotation", name: "Court rotation" },
        ],
        []
    );

    const courts = useMemo(
        () => Array.from(new Set(dummyRows.map((row) => row.court))),
        []
    );

    const groupedByCourt = useMemo(() => {
        return courts.map((court) => ({
            court,
            rows: dummyRows.filter((row) => row.court === court),
        }));
    }, [courts]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tournament Plan</h1>
                <p className="text-sm text-gray-600">
                    Vælg en turnering og en algoritme for at generere en kampplan.
                </p>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Turnering</label>
                        <select
                            value={selectedTournamentId}
                            onChange={(e) => setSelectedTournamentId(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Vælg turnering</option>
                            {tournaments.map((tournament) => (
                                <option key={tournament.id} value={tournament.id}>
                                    {tournament.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Algoritme</label>
                        <select
                            value={selectedAlgorithm}
                            onChange={(e) => setSelectedAlgorithm(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Vælg algoritme</option>
                            {algorithms.map((algorithm) => (
                                <option key={algorithm.id} value={algorithm.id}>
                                    {algorithm.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="primary"
                            disabled={!selectedTournamentId || !selectedAlgorithm}
                            className="w-full"
                        >
                            Generér plan
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                {groupedByCourt.map(({ court, rows }) => (
                    <Card key={court}>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">{court}</h2>
                            <p className="text-sm text-gray-600">
                                Her kommer senere cell view og drag-and-drop for denne bane.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="border px-3 py-2">Tidsrum</th>
                                    <th className="border px-3 py-2">Kamp</th>
                                    <th className="border px-3 py-2">Division</th>
                                    <th className="border px-3 py-2">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((row, index) => (
                                    <tr key={`${court}-${row.slot}-${index}`} className="odd:bg-white even:bg-gray-50">
                                        <td className="border px-3 py-2 whitespace-nowrap">{row.slot}</td>
                                        <td className="border px-3 py-2">{row.match}</td>
                                        <td className="border px-3 py-2">{row.division}</td>
                                        <td className="border px-3 py-2">{row.status}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}