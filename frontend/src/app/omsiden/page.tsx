import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans p-8 md:p-24 text-zinc-800">

            <div className="flex flex-col items-center mb-16 text-center">
                <div className="relative w-32 h-32 mb-6">
                    <Image
                        src="/globe.svg"
                        alt="Projekt Logo"
                        fill
                        className="opacity-80"
                    />
                </div>
                <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-black sm:text-5xl">
                    Om Projektet
                </h1>
                <p className="mt-4 text-lg text-zinc-600 max-w-xl">
                    Et digitalt initiativ skabt for at styrke administrationen af klubber og turneringer i Kajakpolo Danmark.
                </p>
            </div>

            <hr className="w-full max-w-3xl border-zinc-200 mb-16" />

            <div className="w-full max-w-3xl space-y-16">

                {/* Formål */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Formål</h2>
                    <div className="md:col-span-2">
                        <p className="text-lg leading-relaxed">
                            Dette system er udviklet som en del af et <strong>bachelorprojekt</strong> på diplomingeniøruddannelsen i Softwareudvikling på Aarhus Universitet.
                            Målet er at skabe en moderne, brugervenlig platform, der assisterer og optimerer administrationsopgaver for Kajakpolo Danmark.
                        </p>
                    </div>
                </section>

                {/* Hvem er vi? */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Hvem er vi?</h2>
                    <div className="md:col-span-2">
                        <p className="text-lg leading-relaxed">
                            Vi er en projektgruppe af studerende, der brænder for at forene teknologi med sportens verden.
                            Gennem tæt dialog med <strong>Kajakpolo Danmark</strong> har vi identificeret behovet for en centraliseret løsning,
                            der gør hverdagen lettere for både spillere og administratorer.
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            <li className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                <span className="block font-bold text-black">Oliver Rosenkilde</span>
                                <span className="text-sm text-zinc-500">Studerende & Udvikler</span>
                            </li>
                            <li className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                <span className="block font-bold text-black">Thor Nielsen</span>
                                <span className="text-sm text-zinc-500">Studerende & Udvikler</span>
                            </li>
                            <li className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                                <span className="block font-bold text-black">Thomas Christensen</span>
                                <span className="text-sm text-zinc-500">Studerende & Udvikler</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Teknologien */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Teknologien</h2>
                    <div className="md:col-span-2">
                        <p className="text-lg leading-relaxed">
                            Platformen er bygget med moderne webteknologier som <strong>Next.js</strong>, <strong>Tailwind CSS</strong> og sikre database- og api-arkitekturer,
                            der sikrer, at data håndteres efter moderne sikkerhedsstandarder og GDPR-regler.
                        </p>
                    </div>
                </section>

                {/* Kontakt/Kajakpolo DK */}
                <section className="bg-black text-white p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-2">Interesse?</h2>
                    <p className="text-zinc-300">
                        Har du spørgsmål til projektet?
                        Du er velkommen til at række ud til os på nedenstående studiemail:
                        <br></br>
                        au576376@uni.au.dk
                    </p>
                    <div className="mt-6">
                        <a
                            href="mailto:au576376@uni.au.dk"
                            className="inline-block bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors"
                        >
                            Kontakt os her
                        </a>
                    </div>
                </section>
            </div>

            <footer className="mt-24 text-sm text-zinc-400">
                © 2026 Bachelorprojekt – Kajakpolo Danmark Turneringsplatform
            </footer>
        </div>
    );
}