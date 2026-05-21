'use client';

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    GetTournamentsForSelectorDocument,
    GetTournamentMatchesDocument,
    GenerateTournamentPlanDocument,
} from "@/generated/graphql";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { TournamentPlanner } from "./TournamentPlanner";
import { PlanRow } from "./components";
import { matchDateToSlot, toDateKey } from "@/app/lib/dateUtils";

export default function Page() {
    const [selectedId, setSelectedId] = useState("");
    const [fields, setFields] = useState(2);
    const [startTime, setStartTime] = useState(8);
    const [generateKey, setGenerateKey] = useState(0);
    const [generateError, setGenerateError] = useState<string | null>(null);

    const { data: tournamentsData, loading } = useQuery(GetTournamentsForSelectorDocument);
    const { data: matchesData, loading: matchesLoading, refetch } = useQuery(GetTournamentMatchesDocument, {
        variables: { tournamentId: selectedId },
        skip: !selectedId,
    });

    const [generatePlan, { loading: generating }] = useMutation(GenerateTournamentPlanDocument);

    const handleGenerate = async () => {
        if (!selectedId) return;
        setGenerateError(null);
        try {
            await generatePlan({
                variables: { tournamentId: parseInt(selectedId), fields, startTime },
            });
            await refetch();
            setGenerateKey(k => k + 1);
        } catch (err) {
            console.error("Fejl ved generering:", err);
            setGenerateError("Kunne ikke generere turneringsplan. Prøv igen.");
        }
    };

    const tournament = matchesData?.tournament;

    const dates = useMemo(
        () => tournament?.dates?.flatMap((d) => {
            const dateKey = toDateKey(d.date);
            return dateKey ? [{ id: String(d.id), date: d.date }] : [];
        }) ?? [],
        [tournament]
    );

    const initialMatches = useMemo((): PlanRow[] => {
        if (!tournament?.matches?.length) return [];
        return tournament.matches.flatMap(m => {
            const slot = matchDateToSlot(m.match_date);
            const matchDateKey = toDateKey(m.match_date);
            if (!slot || !matchDateKey) return [];

            const court = m.field ? `Bane ${m.field}` : 'Bane 1';
            const tournamentDate = dates.find((d) => toDateKey(d.date) === matchDateKey);

            return [{
                id: String(m.id),
                slot,
                match: `${m.home_team.name} vs ${m.away_team.name}`,
                division: m.division?.name ?? '',
                court,
                status: 'Planlagt',
                dateId: tournamentDate?.id,
            }];
        });
    }, [tournament, dates]);

    const slotDefinitions = useMemo(() => {
        if (!tournament?.matches?.length) return ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00"];
        const slotSet = new Set<string>();
        tournament.matches.forEach(m => {
            const slot = matchDateToSlot(m.match_date);
            if (slot) slotSet.add(slot);
        });
        return slotSet.size ? Array.from(slotSet).sort() : ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00"];
    }, [tournament]);

    const courts = useMemo(() => {
        if (!tournament?.matches?.length) return Array.from({ length: fields }, (_, i) => `Bane ${i + 1}`);
        const fieldSet = new Set<number>();
        tournament.matches.forEach(m => { if (m.field) fieldSet.add(m.field); });
        const sorted = Array.from(fieldSet).sort((a, b) => a - b);
        return sorted.length ? sorted.map(f => `Bane ${f}`) : Array.from({ length: fields }, (_, i) => `Bane ${i + 1}`);
    }, [tournament, fields]);

    const teamsByDivision = useMemo(() => {
        if (!tournament?.teams?.length) return [];
        const divMap: Record<string, { divisionName: string; teams: string[] }> = {};
        for (const tt of tournament.teams) {
            const divId = String(tt.division.id);
            if (!divMap[divId]) divMap[divId] = { divisionName: tt.division.name, teams: [] };
            divMap[divId].teams.push(tt.team.name);
        }
        return Object.values(divMap);
    }, [tournament]);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Kampplanlægger</h1>

            <Card hoverable={false}>
                <label className="block text-sm font-medium mb-1">Vælg Turnering</label>
                <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="w-full md:w-1/3 border rounded p-2"
                >
                    <option value="">{loading ? "Indlæser..." : "Vælg..."}</option>
                    {tournamentsData?.tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </Card>

            {selectedId && !matchesLoading && (
                <>
                    {teamsByDivision.length > 0 && (
                        <Card hoverable={false}>
                            <div className="flex flex-col md:flex-row md:items-end gap-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2">Hold i turneringen</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {teamsByDivision.map(div => (
                                            <div key={div.divisionName}>
                                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">{div.divisionName}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {div.teams.map(name => (
                                                        <span key={name} className="text-xs bg-gray-100 border rounded px-2 py-0.5">{name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-end gap-3 shrink-0">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Baner</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={fields}
                                            onChange={e => setFields(parseInt(e.target.value) || 1)}
                                            className="w-16 border rounded p-1.5 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Starttid (time)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={startTime}
                                            onChange={e => setStartTime(parseInt(e.target.value) || 8)}
                                            className="w-20 border rounded p-1.5 text-sm"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={generating}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {generating ? "Genererer..." : "Generér Kampe"}
                                    </Button>
                                </div>
                            </div>
                            {generateError && (
                                <p className="mt-3 text-sm font-medium text-red-600">{generateError}</p>
                            )}
                        </Card>
                    )}

                    <TournamentPlanner
                        key={`${selectedId}-${generateKey}`}
                        tournamentId={parseInt(selectedId)}
                        initialDates={dates}
                        courts={courts}
                        slotDefinitions={slotDefinitions}
                        initialMatches={initialMatches}
                    />
                </>
            )}
        </div>
    );
}
