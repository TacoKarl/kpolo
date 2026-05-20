'use client';

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Triangle } from "../components/ui/Triangle";
import { GetTournamentsDocument } from "@/generated/graphql";

export default function Page() {
    const { data, loading, error } = useQuery(GetTournamentsDocument);
    const [open, setOpen] = useState({
        future: true,
        past: false,
    });

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
                            {loading && <p>Indlæser...</p>}
                            {error && <p>Fejl ved indlæsning af turneringer: {error.message}</p>}
                            {data && (
                                <ul>
                                    {data.tournaments.map(t => (
                                        <li key={t.id}>{t.season} - {t.name}</li>
                                    ))}
                                </ul>
                            )}
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
                            <ul>
                                <li>DT2025</li>
                                <li>VT2025</li>
                                <li>DT2024</li>
                                <li>VT2024</li>
                                <li>osv...</li>
                            </ul>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
