import Image from "next/image";

export default function Home() {
  return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Image
              src="/bear-in-kajak.svg"
              alt="Kajakpolo Bjørn logo"
              width={500}
              height={500}
              priority
            />
          <h1 className="max-w-xs text-3xl leading-10 tracking-tight text-black dark:text-zinc-50">
            Kajakpolo er en holdsport på vandet, hvor to fem-mandshold i hver deres kajak forsøger at score mål mod hinanden med en bold i et hængende mål cirka to meter over vandoverfladen
          </h1>
        </div>
  );
}
