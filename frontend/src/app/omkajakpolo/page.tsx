import Image from "next/image";

export default function Home() {
  return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
            <Image className="filter brightness-90 contrast-15 "
              src="/bear-in-kajak.svg"
              alt="Kajakpolo Bjørn logo"
              width={500}
              height={500}
              priority
            />
          <h1 className="max-w-xs text-3xl leading-10 tracking-tight text-black ">
            Kajakpolo er en holdsport på vandet, hvor to fem-mandshold i hver deres kajak forsøger at score mål mod hinanden med en bold i et hængende mål cirka to meter over vandoverfladen
          </h1>
        </div>
  );
}
