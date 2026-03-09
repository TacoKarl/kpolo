'use client';
import { useId, useState } from "react";
import { Triangle } from "../components/ui/Triangle";
import { useGetTournamentsQuery } from "@/generated/graphql"; // <- generated hook

type ActiveTab = "turneringer" | "events";

export default function Page() {
    const { data, loading, error } = useGetTournamentsQuery(); // <- fully typed hook

    const tabsId = useId();
    const turneringerTabId = `${tabsId}-tab-turneringer`;
    const eventsTabId = `${tabsId}-tab-events`;
    const turneringerPanelId = `${tabsId}-panel-turneringer`;
    const eventsPanelId = `${tabsId}-panel-events`;

    const [activeTab, setActiveTab] = useState<ActiveTab>("turneringer");

    const [open, setOpen] = useState({
        turneringerFuture: true,
        turneringerPast: false,
        eventsFuture: true,
        eventsPast: false
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
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 bg-white px-16 py-32 dark:bg-black sm:items-start">
                <div
                    role="tablist"
                    aria-label="Turneringer og events"
                    className="flex w-full gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <button
                        id={turneringerTabId}
                        aria-controls={turneringerPanelId}
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
                        id={eventsTabId}
                        aria-controls={eventsPanelId}
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
                    <section
                        id={turneringerPanelId}
                        aria-labelledby={turneringerTabId}
                        role="tabpanel"
                        className="w-full">

                        {/* Upcoming Tournaments */}
                        <button
                            type="button"
                            onClick={() => setOpen(s => ({ ...s, turneringerFuture: !s.turneringerFuture }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.turneringerFuture}
                            aria-controls="panel-turneringerFuture"
                        >
                            <Triangle isOpen={open.turneringerFuture} />
                            <span>Kommende & Aktuelle Turneringer</span>
                        </button>

                        {open.turneringerFuture && (
                            <div
                                id="panel-turneringerFuture"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
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

                        {/* Past Tournaments */}
                        <button
                            type="button"
                            onClick={() => setOpen(s => ({ ...s, turneringerPast: !s.turneringerPast }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.turneringerPast}
                            aria-controls="panel-turneringerPast"
                        >
                            <Triangle isOpen={open.turneringerPast} />
                            <span>Afholdte Turneringer</span>
                        </button>

                        {open.turneringerPast && (
                            <div
                                id="panel-turneringerPast"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                <ul>
                                    <li>DT2025</li>
                                    <li>VT2025</li>
                                    <li>DT2024</li>
                                    <li>vT2024</li>
                                    <li>osv...</li>
                                </ul>
                            </div>
                        )}

                    </section>
                )}

                {activeTab === "events" && (
                    <section
                        id={eventsPanelId}
                        aria-labelledby={eventsTabId}
                        role="tabpanel"
                        className="w-full">

                        {/* Upcoming Events */}
                        <button
                            type="button"
                            onClick={() => setOpen(s => ({ ...s, eventsFuture: !s.eventsFuture }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.eventsFuture}
                            aria-controls="panel-eventsFuture"
                        >
                            <Triangle isOpen={open.eventsFuture} />
                            <span>Kommende & aktuelle Begivenheder</span>
                        </button>

                        {open.eventsFuture && (
                            <div
                                id="panel-eventsFuture"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                <div className="grid grid-cols-6 gap-2">
                                    {eventsFutureSkeleton.map(item => (
                                        <div
                                            key={item.id}
                                            className="aspect-square rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                        >
                                            <div className="font-medium">{item.title}</div>
                                            <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">{item.dateLabel}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Past Events */}
                        <button
                            type="button"
                            onClick={() => setOpen(s => ({ ...s, eventsPast: !s.eventsPast }))}
                            className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            aria-expanded={open.eventsPast}
                            aria-controls="panel-eventsPast"
                        >
                            <Triangle isOpen={open.eventsPast} />
                            <span>Afholdte Begivenheder</span>
                        </button>

                        {open.eventsPast && (
                            <div
                                id="panel-eventsPast"
                                className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                            >
                                <div className="grid grid-cols-6 gap-2">
                                    {eventsPastSkeleton.map(item => (
                                        <div
                                            key={item.id}
                                            className="aspect-square rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                                        >
                                            <div className="font-medium">{item.title}</div>
                                            <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">{item.dateLabel}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </section>
                )}
            </main>
        </div>
    );
}