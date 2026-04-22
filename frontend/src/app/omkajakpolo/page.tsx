import Image from "next/image";

export default function HvadErKajakpolo() {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">

            {/* === Hero & Definition Sektion === */}
            <div className="relative flex flex-col items-center justify-center p-8 md:p-16 border-b border-zinc-200 bg-white">
                <Image
                    className="filter brightness-90 contrast-15 mb-8"
                    src="/bear-in-kajak.svg"
                    alt="Kajakpolo Bjørn logo"
                    width={100}
                    height={100}
                    priority
                />
                <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold text-black text-center leading-[0.9] tracking-tighter mb-6">
                    Om Kajakpolo
                </h1>
                <p className="max-w-xl text-xl md:text-2xl text-zinc-600 text-center leading-relaxed tracking-tight">
                    Glem alt om kedelige svømmebaner. Kajakpolo er en eksplosiv blanding af håndbold, basketball og racerbåd. To hold på fem mand i specialbyggede kajakker kæmper om en bold på en bane, hvor alt kan ske – og vandet sprøjter om ørerne på dig.
                </p>
            </div>

            {/* === Action / Beskrivelse Sektion === */}
            <div className="w-full max-w-7xl mx-auto p-8 md:p-16 grid md:grid-cols-2 gap-12 md:gap-24 items-center">

                {/* Tekstboks med beskrivelse */}
                <div className="space-y-6">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Sådan Spilles Det</h2>
                    <p className="text-3xl font-semibold tracking-tight text-black leading-snug">
                        Høj intensitet, præcision og taktisk overblik.
                    </p>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                        Målet er enkelt: Scor i modstanderens mål, der hænger to meter over vandet. Men vejen dertil er alt andet end simpel. Spillere kaster bolden med én hånd, bruger pagajen til at blokere, og kæmper om position på banen.
                    </p>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                        Der er kamp til stregen, og en velplaceret pagaj eller et dristigt skud kan ændre alt på sekunder. Det er en sport, der kræver en sjælden kombination af styrke, balance og holdsamarbejde.
                    </p>
                </div>

                {/* placeholder */}
                <div className="aspect-[4/5] bg-zinc-950 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
                    <span className="text-6xl">🤽</span>
                    <p className="font-mono text-zinc-500">[Indsæt: Et action-shot med spillere i kamp]</p>
                </div>
            </div>

            {/* === Historie Sektion (Danmark) === */}
            <div className="w-full max-w-7xl mx-auto p-8 md:p-16 pb-24 md:pb-32 grid md:grid-cols-2 gap-12 md:gap-24 items-center border-t border-zinc-200">

                {/* Tidslinje-agtig følelse */}
                <div className="space-y-6 md:order-last">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Fra Gummibåde til Verdenselite</h2>
                    <p className="text-3xl font-semibold tracking-tight text-black leading-snug">
                        Danmarks indtog i sporten var alt andet end strømlinet.
                    </p>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                        Det startede som en sjov aktivitet i gummibåde i de danske kanaler. Men i løbet af få år transformerede sporten sig. Fra hobby-projekt til professionel elite.
                    </p>
                    <p className="text-lg text-zinc-700 leading-relaxed">
                        Danmark har i dag etableret sig som en stærk nation på den internationale scene, med medaljer og top-placeringer ved VM og EM. Det er en historie om dedikation, udvikling og en uendelig passion for spillet på vandet.
                    </p>
                </div>

                {/* Vibe-billede 2 / placeholder */}
                <div className="aspect-[4/3] bg-zinc-200 rounded-3xl flex flex-col items-center justify-center p-8 text-center text-zinc-800 space-y-4">
                    <span className="text-6xl">🇩🇰</span>
                    <p className="font-mono text-zinc-500">[Indsæt: Dansk flag ved et stævne, evt. fra VM i Kina 2024?]</p>
                </div>

            </div>
            <section className="w-full max-w-7xl mx-auto px-8 mb-24">
                <div className="group relative overflow-hidden rounded-3xl bg-black p-8 md:p-12 text-center transition-all hover:bg-zinc-900">
                    {/* Subtil baggrunds-effekt */}
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-all group-hover:bg-white/10" />

                    <h3 className="relative z-10 text-2xl md:text-3xl font-bold tracking-tight text-white mb-6">
                        Vil du gerne prøve sporten?
                    </h3>

                    <p className="relative z-10 mx-auto max-w-lg text-zinc-400 mb-8 text-lg">
                        Find klubber nær dig og officielle regler direkte hos kilden.
                    </p>

                    <a
                        href="https://sites.google.com/kano-kajak.dk/kajakpolodanmark/forside" // Erstat med det præcise link hvis nødvendigt
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black transition-transform hover:scale-105 active:scale-95"
                    >
                        Se mere på den officielle side for Kajakpolo Danmark
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </div>
            </section>

        </div>
    );
}