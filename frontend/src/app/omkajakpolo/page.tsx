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
            Kajakpolo er en sportsgren, bestående af to hold der ror i kajak, mens de prøver at score mål med en bold.
          </h1>
        </div>
  );
}
