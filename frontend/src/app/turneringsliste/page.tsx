"use client";
import { useState } from "react";
import { Triangle } from "../components/ui/Triangle";

export default function Turneringsliste() {
    const [open, setOpen] = useState<{ first: boolean; second: boolean }>({
        first: false,
        second: false,
    });

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 py-32 px-16 bg-white dark:bg-black sm:items-start">
                <button
                    type="button"
                    onClick={() => setOpen((s) => ({ ...s, first: !s.first }))}
                    className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    aria-expanded={open.first}
                    aria-controls="panel-first"
                >
                    <Triangle isOpen={open.first} />
                    <span>Kommende turneringer</span>
                </button>

                {open.first && (
                    <div
                        id="panel-first"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                    >
                        Ting
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setOpen((s) => ({ ...s, second: !s.second }))}
                    className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-3 text-left font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    aria-expanded={open.second}
                    aria-controls="panel-second"
                >
                    <Triangle isOpen={open.second} />
                    <span>Forrige turneringer</span>
                </button>

                {open.second && (
                    <div
                        id="panel-second"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                    >
                        Flere ting
                    </div>
                )}
            </main>
        </div>
    );
}
