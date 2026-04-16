'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GetTournamentsForSelectorDocument, GetTournamentMatchesDocument } from "@/generated/graphql";
import { Card } from "@/components/Card";
import { TournamentPlanner } from "./TournamentPlanner";

const MOCK_MATCHES = [
    { id: "row-1", slot: "08:00 - 08:30", match: "Team A vs Team B", division: "Dame", court: "Bane 1", status: "Planned" },
    { id: "row-2", slot: "08:30 - 09:00", match: "Team C vs Team D", division: "Dame", court: "Bane 2", status: "Planned" },
];

export default function Page() {
    const [selectedId, setSelectedId] = useState("");
    const { data: tournamentsData, loading } = useQuery(GetTournamentsForSelectorDocument);
    const { data: matchesData, loading: matchesLoading } = useQuery(GetTournamentMatchesDocument, {
        variables: { tournamentId: selectedId }, skip: !selectedId,
    });

    const dates = useMemo(() => matchesData?.tournament?.dates?.map(d => ({ id: String(d.id), date: d.date })) ?? [], [matchesData]);
    const courts = useMemo(() => ["Bane 1", "Bane 2"], []);
    const slots = useMemo(() => ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00"], []);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Kampplanlægger</h1>
            <Card hoverable={false}>
                <label className="block text-sm font-medium mb-1">Vælg Turnering</label>
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full md:w-1/3 border rounded p-2">
                    <option value="">{loading ? "Indlæser..." : "Vælg..."}</option>
                    {tournamentsData?.tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </Card>

            {selectedId && !matchesLoading && (
                <TournamentPlanner
                    key={selectedId}
                    initialDates={dates}
                    courts={courts}
                    slotDefinitions={slots}
                    initialMatches={MOCK_MATCHES}
                />
            )}
        </div>
    );
}