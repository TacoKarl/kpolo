'use client';

import { useState } from "react";
import { Triangle } from "../components/ui/Triangle";

export default function Page() {
    const [open, setOpen] = useState({
        future: true,
        past: false,
    });

    const eventsFutureSkeleton = Array.from({ length: 10 }, (_, i) => ({
        id: `future-${i + 1}`,
        title: `Event ${i + 1}`,
        dateLabel: "Dato",
    }));

    const eventsPastSkeleton = Array.from({ length: 10 }, (_, i) => ({
        id: `past-${i + 1}`,
        title: `Event ${i + 1}`,
        dateLabel: "Dato",
    }));

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
                            <div className="grid grid-cols-6 gap-2">
                                {eventsFutureSkeleton.map(item => (
                                    <div
                                        key={item.id}
                                        className="aspect-square rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-800 shadow-sm"
                                    >
                                        <div className="font-medium">{item.title}</div>
                                        <div className="mt-1 text-[11px] text-zinc-600">{item.dateLabel}</div>
                                    </div>
                                ))}
                            </div>
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
                            <div className="grid grid-cols-6 gap-2">
                                {eventsPastSkeleton.map(item => (
                                    <div
                                        key={item.id}
                                        className="aspect-square rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-800 shadow-sm"
                                    >
                                        <div className="font-medium">{item.title}</div>
                                        <div className="mt-1 text-[11px] text-zinc-600">{item.dateLabel}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

