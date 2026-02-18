"use client";
import { useState } from "react";
import { Triangle } from "../components/ui/Triangle";
type ActiveTab = "turneringer" | "events";

export default function Page() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("turneringer");

    const [open, setOpen] = useState<{ turneringerFuture: boolean; turneringerPast: boolean; eventsFuture: boolean; eventsPast: boolean }>({
        turneringerFuture: true,
        turneringerPast: false,
        eventsFuture: true,
        eventsPast: false
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-white px-16 py-32 dark:bg-black sm:items-start">
                <div
                    role="tablist"
                    aria-label="Turneringer og events"
                    className="flex w-full gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "turneringer"}
                        className={[
                            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
                            activeTab === "turneringer"
                                ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100"
                                : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-black/40",
                        ].join(" ")}
                        onClick={() => setActiveTab("turneringer")}
                    >
                        Turneringer
                    </button>

                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "events"}
                        className={[
                            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
                            activeTab === "events"
                                ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100"
                                : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-black/40",
                        ].join(" ")}
                        onClick={() => setActiveTab("events")}
                    >
                        Begivenheder
                    </button>
                </div>

                {activeTab === "turneringer" && (
                    <section role="tabpanel" className="w-full">
                        <button
                            type="button"
                            onClick={() =>
                                setOpen((s) => ({ ...s, turneringerFuture: !s.turneringerFuture }))
                            }
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.turneringerFuture}
                            aria-controls="panel-turneringer"
                        >
                            <Triangle isOpen={open.turneringerFuture} />
                            <span>Kommender & Aktuelle Turneringer</span>
                        </button>

                        {open.turneringerFuture && (
                            <div
                                id="panel-turneringer"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                <li>DT2026</li>
                                <li>VT2026</li>
                                <li>osv...</li>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                setOpen((s) => ({ ...s, turneringerPast: !s.turneringerPast }))
                            }
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.turneringerPast}
                            aria-controls="panel-turneringer"
                        >
                            <Triangle isOpen={open.turneringerPast} />
                            <span>Afholdte Turneringer</span>
                        </button>

                        {open.turneringerPast && (
                            <div
                                id="panel-turneringer"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                <li>DT2025</li>
                                <li>VT2025</li>
                                <li>DT2024</li>
                                <li>vT2024</li>
                                <li>osv...</li>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === "events" && (
                    <section role="tabpanel" className="w-full">
                        <button
                            type="button"
                            onClick={() => setOpen((s) => ({ ...s, eventsFuture: !s.eventsFuture }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.eventsFuture}
                            aria-controls="panel-events"
                        >
                            <Triangle isOpen={open.eventsFuture} />
                            <span>Kommende & aktuelle Begivenheder</span>
                        </button>

                        {open.eventsFuture && (
                            <div
                                id="panel-events"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                Crazy calendar view type shit
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setOpen((s) => ({ ...s, eventsPast: !s.eventsPast }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.eventsPast}
                            aria-controls="panel-events"
                        >
                            <Triangle isOpen={open.eventsPast} />
                            <span>Afholdte Begivenheder</span>
                        </button>

                        {open.eventsPast && (
                            <div
                                id="panel-events"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                Crazy calendar view type shit
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
