import Image from "next/image";

export default function PrivacyPolicy() {
    return (
        <div className="flex min-h-screen flex-col items-center bg-zinc-50 font-sans p-8 md:p-24 text-zinc-800">
            <div className="flex flex-col items-center mb-16 text-center">
                <Image className="filter brightness-90 contrast-15 "
                    src="/bear-in-kajak.svg"
                    alt="Kajakpolo Bjørn logo"
                    width={120}
                    height={120}
                    priority
                />
                <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-black">
                    Privatlivspolitik & Information om Bachelorprojekt
                </h1>
                <p className="mt-4 text-zinc-600 max-w-md italic">
                    Denne side er udviklet som en del af et bachelorprojekt til Kajakpolo Danmark.
                </p>
            </div>

            <hr className="w-full max-w-3xl border-zinc-200 mb-12" />

            <div className="w-full max-w-3xl space-y-10">

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">1. Dataansvarlig</h2>
                    <p>
                        Ansvarlig for databehandlingen på denne platform er: <br />
                        <strong>Projektgruppen <i>Kajakpolo Danmark Turneringsplatform</i></strong> i samarbejde med Kajakpolo Danmark. <br />
                        Kontakt: <span className="underline">au201705873@uni.au.dk</span>
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">2. Indsamling af oplysninger</h2>
                    <p>
                        Vi begrænser indsamlingen af data til et absolut minimum. Vi opbevarer udelukkende:
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li><strong>Navn:</strong> Til identifikation af brugeren i systemet.</li>
                        <li><strong>E-mailadresse:</strong> Til login-funktionalitet og nødvendig kommunikation.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">3. Cookies</h2>
                    <p>
                        Denne hjemmeside benytter kun <strong>funktionsvigtige cookies</strong>. Det betyder:
                    </p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Ingen tracking eller markedsføringscookies.</li>
                        <li>Ingen tredjepartscookies (som f.eks. Google Analytics eller Facebook-pixels).</li>
                        <li>Cookierne bruges kun til at huske din session (at du er logget ind).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold mb-3 text-black">4. Opbevaring og sikkerhed</h2>
                    <p>
                        Dine data opbevares sikkert i vores database og deles ikke med tredjeparter.
                        Da dette er et bachelorprojekt, vil alle personhenførbare data blive slettet senest ved projektets afslutning og bedømmelse den <strong>25. juni 2026</strong>.
                    </p>
                </section>

                {/* Kontakt/Kajakpolo DK */}
                <section className="bg-black text-white p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-2">Du har ret til dine data</h2>
                    <p className="text-zinc-300">
                        Har du spørgsmål til dine data eller applikationens sikkerhed?
                        Du er velkommen til at række ud til os på nedenstående studiemail:<br></br>
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

            <footer className="mt-20 text-sm text-zinc-400">
                Sidst opdateret: April 2026
            </footer>
        </div>
    );
}