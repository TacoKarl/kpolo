'use client';

import { useMemo } from "react";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Triangle } from "../components/ui/Triangle";
import { GetTournamentsDocument } from "@/generated/graphql";
import { toDateKey } from "../lib/dateUtils";

interface EventItem {
    id: string;
    date: string;
    tournamentName: string;
}

interface EventGridProps {
    events: EventItem[];
    loading?: boolean;
    error?: Error | null;
    emptyMessage: string;
}

function EventGrid({ events, loading, error, emptyMessage }: EventGridProps) {
    const formatDateForDisplay = (dateKey: string) => {
        const date = new Date(`${dateKey}T12:00:00`);
        return date.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
    };

    return (
        <div className="grid grid-cols-6 gap-2">
            {loading && <p>Indlæser...</p>}
            {error && <p>Fejl: {error.message}</p>}
            {!loading && !error && events.length > 0 ? (
                events.map(item => (
                    <div
                        key={item.id}
                        className="aspect-square rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-800 shadow-sm flex flex-col justify-center"
                    >
                        <div className="font-bold text-center mb-1">Kampdag</div>
                        <div className="text-[10px] text-center text-zinc-700 mb-0.5 truncate">{item.tournamentName}</div>
                        <div className="text-[10px] text-center text-zinc-600">{formatDateForDisplay(item.date)}</div>
                    </div>
                ))
            ) : !loading && !error ? (
                <div className="col-span-6 text-center py-4 text-zinc-500">
                    {emptyMessage}
                </div>
            ) : null}
        </div>
    );
}

export default function Page() {
    const { data, loading, error } = useQuery(GetTournamentsDocument);
    const [open, setOpen] = useState({
        future: true,
        past: false,
    });

    const todayKey = toDateKey(new Date());

    const { futureEvents, pastEvents } = useMemo(() => {
        const future: Array<{ id: string; date: string; tournamentName: string }> = [];
        const past: Array<{ id: string; date: string; tournamentName: string }> = [];

        for (const tournament of data?.tournaments ?? []) {
            for (const dateObj of tournament.dates ?? []) {
                const dateKey = toDateKey(dateObj.date);
                if (!dateKey) continue;

                const event = {
                    id: `${tournament.id}-${dateObj.id}`,
                    date: dateKey,
                    tournamentName: tournament.name,
                };

                if (todayKey && dateKey >= todayKey) {
                    future.push(event);
                } else {
                    past.push(event);
                }
            }
        }

        // Sort by date
        future.sort((a, b) => a.date.localeCompare(b.date));
        past.sort((a, b) => b.date.localeCompare(a.date));

        return { futureEvents: future, pastEvents: past };
    }, [data?.tournaments, todayKey]);


    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-white px-16 py-32 sm:items-start">
                <h1 className="text-3xl font-bold text-zinc-900">Begivenheder</h1>

                <section className="w-full">
                    <button
                        type="button"
                        onClick={() => setOpen(s => ({ ...s, future: !s.future }))}
                        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200"
                        aria-expanded={open.future}
                        aria-controls="panel-eventsFuture"
                    >
                        <Triangle isOpen={open.future} />
                        <span>Kommende & aktuelle Begivenheder</span>
                    </button>

                    {open.future && (
                        <div
                            id="panel-eventsFuture"
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800"
                        >
                            <EventGrid
                                events={futureEvents}
                                loading={loading}
                                error={error}
                                emptyMessage="Ingen kommende eller aktuelle begivenheder."
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen(s => ({ ...s, past: !s.past }))}
                        className="mt-4 flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200"
                        aria-expanded={open.past}
                        aria-controls="panel-eventsPast"
                    >
                        <Triangle isOpen={open.past} />
                        <span>Afholdte Begivenheder</span>
                    </button>

                    {open.past && (
                        <div
                            id="panel-eventsPast"
                            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800"
                        >
                            <EventGrid
                                events={pastEvents}
                                emptyMessage="Ingen afholdte begivenheder."
                            />
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

