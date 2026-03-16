'use client';

import { useId, useState } from "react";
import { useIsAdmin } from "@/app/components/hooks/useIsAdmin";
import AdminClubsPage from "@/app/admin/components/AdminClubsPage";
import AdminTournamentsPage from "@/app/admin/components/AdminTournamentsPage";
import AdminTeamsPage from "@/app/admin/components/AdminTeamsPage";

type ActiveTab = "tournament" | "clubs" | "teams";

export default function AdminPage() {
    const isAdmin = useIsAdmin();

    const tabsId = useId();
    const tournamentTabId = `${tabsId}-tab-tournament`;
    const clubTabId = `${tabsId}-tab-clubs`;
    const teamTabId = `${tabsId}-tab-teams`;
    const tournamentPanelId = `${tabsId}-panel-tournament`;
    const clubsPanelId = `${tabsId}-panel-clubs`;

    const [activeTab, setActiveTab] = useState<ActiveTab>("tournament");

    return (
        <div className="p-6">
            {isAdmin ? (
                <>
                    <div
                        role="tablist"
                        aria-label="Turneringer og events"
                        className="flex w-full gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <button
                            id={tournamentTabId}
                            aria-controls={tournamentPanelId}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "tournament"}
                            className={[
                                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
                                activeTab === "tournament"
                                    ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100"
                                    : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-black/40",
                            ].join(" ")}
                            onClick={() => setActiveTab("tournament")}
                        >
                            Turneringer
                        </button>

                        <button
                            id={clubTabId}
                            aria-controls={clubsPanelId}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "clubs"}
                            className={[
                                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
                                activeTab === "clubs"
                                    ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100"
                                    : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-black/40",
                            ].join(" ")}
                            onClick={() => setActiveTab("clubs")}
                        >
                            Klubber
                        </button>

                        <button
                            id={teamTabId}
                            aria-controls={teamTabId}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === "teams"}
                            className={[
                                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition",
                                activeTab === "teams"
                                    ? "bg-white text-zinc-900 shadow-sm dark:bg-black dark:text-zinc-100"
                                    : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-black/40",
                            ].join(" ")}
                            onClick={() => setActiveTab("teams")}
                        >
                            Hold
                        </button>
                    </div>
                    <div className="mt-4">
                        {activeTab === "tournament" && (
                            <AdminTournamentsPage/>
                        )}
                        {activeTab === "clubs" && (
                            <AdminClubsPage/>
                        )}
                        {activeTab === "teams" && (
                            <AdminTeamsPage/>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    <p>You are not authorized to view this page</p>
                </div>
            )}
        </div>
    );
}