'use client';

import Link from 'next/link';
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Triangle } from "../components/ui/Triangle";
import { GetTournamentsDocument, type GetTournamentsQuery } from "@/generated/graphql";
import { toDateKey } from "../lib/dateUtils";

interface TournamentListProps {
    tournaments: GetTournamentsQuery['tournaments'];
    loading?: boolean;
    error?: Error | null;
    emptyMessage: string;
}

function TournamentList({ tournaments, loading, error, emptyMessage }: TournamentListProps) {
    return (
        <>
            {loading && <p>Indlæser...</p>}
            {error && <p>Fejl ved indlæsning af turneringer: {error.message}</p>}
            {!loading && !error && (
                <ul>
                    {tournaments.length > 0 ? (
                        tournaments.map(t => (
                            <li key={t.id}>
                                <Link href={`/turneringer/${t.id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                                    {t.season} - {t.name}
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li>{emptyMessage}</li>
                    )}
                </ul>
            )}
        </>
    );
}

export default function Page() {
    const { data, loading, error } = useQuery(GetTournamentsDocument);
    const [open, setOpen] = useState({
        future: true,
        past: false,
    });

    const todayKey = toDateKey(new Date());

    const { futureTournaments, pastTournaments } = useMemo(() => {
        const future: GetTournamentsQuery['tournaments'] = [];
        const past: GetTournamentsQuery['tournaments'] = [];

        for (const tournament of data?.tournaments ?? []) {
            const hasFutureOrOngoingDate = tournament.dates?.some((date) => {
                const dateKey = toDateKey(date.date);
                return Boolean(todayKey && dateKey && dateKey >= todayKey);
            }) ?? false;

            if (hasFutureOrOngoingDate) {
                future.push(tournament);
            } else {
                past.push(tournament);
            }
        }

        return { futureTournaments: future, pastTournaments: past };
    }, [data, todayKey]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-white px-16 py-32 sm:items-start">
                <h1 className="text-3xl font-bold text-zinc-900">Turneringer</h1>

                <section className="w-full">
                    <button
                        type="button"
                        onClick={() => setOpen(s => ({ ...s, future: !s.future }))}
                        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200"
                        aria-expanded={open.future}
                        aria-controls="panel-turneringerFuture"
                    >
                        <Triangle isOpen={open.future} />
                        <span>Kommende & Aktuelle Turneringer</span>
                    </button>

                    {open.future && (
                        <div
                            id="panel-turneringerFuture"
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800"
                        >
                            <TournamentList
                                tournaments={futureTournaments}
                                loading={loading}
                                error={error}
                                emptyMessage="Ingen kommende eller aktuelle turneringer."
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen(s => ({ ...s, past: !s.past }))}
                        className="mt-4 flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200"
                        aria-expanded={open.past}
                        aria-controls="panel-turneringerPast"
                    >
                        <Triangle isOpen={open.past} />
                        <span>Afholdte Turneringer</span>
                    </button>

                    {open.past && (
                        <div
                            id="panel-turneringerPast"
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800"
                        >
                            <TournamentList
                                tournaments={pastTournaments}
                                emptyMessage="Ingen afholdte turneringer."
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
