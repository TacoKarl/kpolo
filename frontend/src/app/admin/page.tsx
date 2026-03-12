'use client';

import { useId, useState } from "react";
import { useIsAdmin } from "@/app/components/hooks/useIsAdmin";
import {useClubs} from "@/app/components/hooks/useClubs";

type ActiveTab = "tournament" | "clubs" | "teams";

export default function AdminPage() {
    const isAdmin = useIsAdmin();
    const { regions, loading } = useClubs();

    const tabsId = useId();
    const tournamentTabId = `${tabsId}-tab-tournament`;
    const clubTabId = `${tabsId}-tab-clubs`;
    const teamTabId = `${tabsId}-tab-teams`;
    const tournamentPanelId = `${tabsId}-panel-tournament`;
    const clubsPanelId = `${tabsId}-panel-clubs`;

    const [activeTab, setActiveTab] = useState<ActiveTab>("tournament");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [region, setRegion] = useState("");
    const [email, setEmail] = useState("");
    const [managerId, setManagerId] = useState("");

    const handleCreateClub = async () => {
        /* await createClub(
            name,
            address,
            region,
            email,
            Number(managerId)
        );
         */

        setName("");
        setAddress("");
        setRegion("");
        setEmail("");
        setManagerId("");
    };

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
                        {activeTab === "tournament" && <div>Turneringer indhold her</div>}
                        {activeTab === "clubs" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Alle klubber</h3>
                                {loading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <div className="grid grid-cols-3 gap-6">
                                        {Object.entries(regions).map(([region, clubs]) => (
                                            <div key={region}>
                                                <h4 className="font-medium capitalize mb-2">{region}</h4>
                                                <ul className="ml-4">
                                                    {clubs.map((c) => (
                                                        <li key={c.id}>
                                                            {c.name} – {c.city}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col gap-2 max-w-md">
                                    <h3 className="text-lg font-semibold mb-2">Opret ny klub</h3>
                                    <input
                                        placeholder="Klub navn"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="border p-2 rounded"
                                    />

                                    <input
                                        placeholder="Adresse"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="border p-2 rounded"
                                    />

                                    <select
                                        value={region}
                                        onChange={(e) => setRegion(e.target.value)}
                                        className="border p-2 rounded"
                                    >
                                        <option value="">Vælg region</option>
                                        <option value="Jylland">Jylland</option>
                                        <option value="Fyn">Fyn</option>
                                        <option value="Sjælland">Sjælland</option>
                                    </select>

                                    <input
                                        placeholder="Klub Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border p-2 rounded"
                                    />

                                    <button
                                        onClick={handleCreateClub}
                                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                    >
                                        Opret klub
                                    </button>
                                </div>
                            </div>
                        )}
                        {activeTab === "teams" && <div>Hold indhold her</div>}
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