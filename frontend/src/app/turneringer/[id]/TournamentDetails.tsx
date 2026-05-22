"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
    GetTournamentMatchesDocument,
    type GetTournamentMatchesQuery,
} from "@/generated/graphql";
import { parseDateLike } from "@/app/lib/dateUtils";

type Tournament = NonNullable<GetTournamentMatchesQuery["tournament"]>;
type Match = NonNullable<Tournament["matches"]>[number];

function formatDate(value: string | null | undefined) {
    const date = value ? parseDateLike(value) : null;
    if (!date) return "Ukendt dato";

    return new Intl.DateTimeFormat("da-DK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function formatTime(value: string | null | undefined) {
    const date = value ? parseDateLike(value) : null;
    if (!date) return "Ukendt tid";

    // The backend encodes scheduled slot times using UTC hours (setUTCHours).
    // Read the UTC hours/minutes to display the intended slot time instead of
    // letting the runtime local timezone convert it (which previously produced 00:00).
    const hh = String(date.getUTCHours()).padStart(2, "0");
    const mm = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function formatDivisionLabel(value: string) {
    return value === "alle" ? "Alle" : value.charAt(0).toUpperCase() + value.slice(1);
}

function formatResult(match: Match) {
    const homeScore = match.home_team_score;
    const awayScore = match.away_team_score;

    if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
        return "-";
    }

    return `${homeScore}-${awayScore}`;
}

export function TournamentDetails({ tournamentId }: { tournamentId: string }) {
    const { data, loading, error } = useQuery(GetTournamentMatchesDocument, {
        variables: { tournamentId },
        skip: !tournamentId,
    });
    const [selectedDivision, setSelectedDivision] = useState("alle");

    const tournament = data?.tournament as Tournament | null | undefined;

    const matches = useMemo(() => {
        const source = tournament?.matches ?? [];

        return [...source].sort((a, b) => {
            const aTime = parseDateLike(a.match_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = parseDateLike(b.match_date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            if (aTime !== bTime) return aTime - bTime;

            const aField = a.field ?? Number.MAX_SAFE_INTEGER;
            const bField = b.field ?? Number.MAX_SAFE_INTEGER;
            if (aField !== bField) return aField - bField;

            return a.id - b.id;
        });
    }, [tournament?.matches]);

    const divisionNames = useMemo(() => {
        const divisions = new Set<string>();

        for (const match of matches) {
            divisions.add(match.division?.name ?? "Ukendt division");
        }

        return ["alle", ...Array.from(divisions)];
    }, [matches]);

    const filteredMatches =
        selectedDivision === "alle"
            ? matches
            : matches.filter((match) => (match.division?.name ?? "Ukendt division") === selectedDivision);

    const showDivisionColumn = selectedDivision === "alle";
    const title = tournament ? `${tournament.name}${tournament.season ? ` – ${tournament.season}` : ""}` : "Turnering";
    const formattedDates = tournament?.dates
        ?.map((date) => formatDate(String(date.date)))
        .filter((date) => date !== "Ukendt dato") ?? [];

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
                <p className="text-zinc-400">Henter turnering...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
                <p className="text-red-400">Fejl: {error.message}</p>
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
                <p className="text-zinc-400">Turnering ikke fundet.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans">
            <div className="bg-zinc-800 py-6 px-8 border-b border-zinc-700">
                <h1 className="text-2xl font-bold tracking-wide">{title}</h1>
                {formattedDates.length > 0 && (
                    <p className="mt-1 text-sm text-zinc-400">
                        Datoer: {formattedDates.join(", ")}
                    </p>
                )}
            </div>

            <div className="px-8 py-4 flex gap-2 border-b border-zinc-700 bg-zinc-800 flex-wrap">
                {divisionNames.map((division) => (
                    <button
                        key={division}
                        type="button"
                        onClick={() => setSelectedDivision(division)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            selectedDivision === division
                                ? "bg-white text-zinc-900"
                                : "bg-zinc-700 text-white hover:bg-zinc-600"
                        }`}
                    >
                        {formatDivisionLabel(division)}
                    </button>
                ))}
            </div>

            <div className="px-8 py-6 overflow-x-auto">
                {filteredMatches.length > 0 ? (
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-700">
                                <th className="text-left py-3 pr-6">Kamp nr.</th>
                                <th className="text-left py-3 pr-6">Bane</th>
                                <th className="text-left py-3 pr-6">Starttid</th>
                                <th className="text-left py-3 pr-6">Ude</th>
                                <th className="text-left py-3 pr-6">Hjemme</th>
                                <th className="text-left py-3 pr-6">Resultat</th>
                                {showDivisionColumn && <th className="text-left py-3">Liga</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMatches.map((match, index) => {
                                const divisionName = match.division?.name ?? "Ukendt division";
                                const startTime = formatTime(match.match_date);

                                return (
                                    <tr
                                        key={match.id}
                                        className={`border-b border-zinc-800 transition-colors hover:bg-zinc-800 ${
                                            index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-850"
                                        }`}
                                    >
                                        <td className="py-3 pr-6">{index + 1}</td>
                                        <td className="py-3 pr-6">{match.field ? `Bane ${match.field}` : "-"}</td>
                                        <td className="py-3 pr-6">{startTime}</td>
                                        <td className="py-3 pr-6 font-medium">{match.away_team.name}</td>
                                        <td className="py-3 pr-6 font-medium">{match.home_team.name}</td>
                                        <td className="py-3 pr-6 font-bold text-green-400">{formatResult(match)}</td>
                                        {showDivisionColumn && (
                                            <td className="py-3">
                                                <span className="bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded">
                                                    {divisionName}
                                                </span>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-zinc-400">Ingen kampe i den valgte kategori.</p>
                )}

                <p className="text-zinc-500 text-xs mt-4">{filteredMatches.length} kampe vist</p>
            </div>
        </div>
    );
}



