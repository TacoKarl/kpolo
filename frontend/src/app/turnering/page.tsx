"use client";

import {useEffect, useState} from "react";


export default function TurneringPage () {
    // const [kampe, setKampe] = useState<Kamp[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [valgtLiga, setValgtLiga] = useState("alle");
    //
    // useEffect(() => {
    //     async function fetchKampe() {
    //         try {
    //             const res = await fetch(`http://localhost:3000/tournaments/${params.id}/matches`);
    //             if (!res.ok) throw new Error("Kunne ikke hente kampe");
    //             const data = await res.json();
    //             setKampe(data.matches);
    //         } catch (err) {
    //             if (err instanceof Error) {
    //                 setError(err.message);
    //             } else {
    //                 setError("Ukendt fejl");
    //             }
    //         }
    //         finally {
    //             setLoading(false);
    //         }
    //     }
    //
    //     fetchKampe();
    // }, [params.id]);

    // const kampe = await res.json();
    const kampe = [
        { number: 1, pitch: "Bane 1", starttid: "15.15", hold1: "Team A", hold2: "Team B", resultat: "2-1", liga:"kvinde" },
        { number: 2, pitch: "Bane 2", starttid: "15.30", hold1: "Team C", hold2: "Team D", resultat: "0-3", liga:"kvinde" },
        { number: 1, pitch: "Bane 2", starttid: "15.30", hold1: "Team C", hold2: "Team D", resultat: "0-3", liga:"liga" },
        { number: 2, pitch: "Bane 2", starttid: "15.30", hold1: "Team C", hold2: "Team D", resultat: "0-3", liga:"liga" },
        { number: 1, pitch: "Bane 2", starttid: "15.30", hold1: "Team C", hold2: "Team D", resultat: "0-3", liga:"1. div." },
        { number: 2, pitch: "Bane 2", starttid: "15.30", hold1: "Team C", hold2: "Team D", resultat: "0-3", liga:"1. div." },
    ];

    const ligaer = ["alle", ...new Set(kampe.map((k) => k.liga))];
    const showLiga = valgtLiga === "alle";

    const filtreredeKampe = valgtLiga === "alle"
        ? kampe
        : kampe.filter((k) => k.liga === valgtLiga);

    if (loading) return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
            <p className="text-zinc-400">Henter kampe...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <>
        <div className="min-h-screen bg-zinc-900 text-white font-sans">

            <div className="bg-zinc-800 py-6 px-8 border-b border-zinc-700">
                <h1 className="text-2xl font-bold tracking-wide">DT 2 – Lørdag</h1>
            </div>

            <div className="px-8 py-4 flex gap-2 border-b border-zinc-700 bg-zinc-800">
                {ligaer.map((liga) => (
                    <button
                        key={liga}
                        onClick={() => setValgtLiga(liga)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            valgtLiga === liga
                                ? "bg-white text-zinc-900"
                                : "bg-zinc-700 text-white hover:bg-zinc-600"
                        }`}
                    >
                        {liga.charAt(0).toUpperCase() + liga.slice(1)}
                    </button>
                ))}
            </div>

            <div className="px-8 py-6">
                <table className="w-full text-sm border-collapse">
                    <thead>
                    <tr className="text-zinc-400 uppercase text-xs tracking-wider border-b border-zinc-700">
                        <th className="text-left py-3 pr-6">Kamp nr.</th>
                        <th className="text-left py-3 pr-6">Bane</th>
                        <th className="text-left py-3 pr-6">Starttid</th>
                        <th className="text-left py-3 pr-6">Ude</th>
                        <th className="text-left py-3 pr-6">Hjemme</th>
                        <th className="text-left py-3 pr-6">Resultat</th>
                        {showLiga && <th className="text-left py-3">Liga</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {filtreredeKampe.map((kamp, index) => (
                        <tr
                            key={index}
                            className={`border-b border-zinc-800 transition-colors hover:bg-zinc-800 ${
                                index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-850"
                            }`}
                        >
                            <td className="py-3 pr-6">{kamp.number}</td>
                            <td className="py-3 pr-6">{kamp.pitch}</td>
                            <td className="py-3 pr-6">{kamp.starttid}</td>
                            <td className="py-3 pr-6 font-medium">{kamp.hold1}</td>
                            <td className="py-3 pr-6 font-medium">{kamp.hold2}</td>
                            <td className="py-3 pr-6 font-bold text-green-400">{kamp.resultat}</td>
                            {showLiga && (
                                <td className="py-3">
                    <span className="bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded">
                      {kamp.liga}
                    </span>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>

                <p className="text-zinc-500 text-xs mt-4">{filtreredeKampe.length} kampe vist</p>
            </div>
        </div>
        </>
    )
}
