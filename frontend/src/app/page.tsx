import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="light:invert"
          src="/bear-in-kajak.svg" //TODO: Kajak Bjørn
          alt="Kajakpolo  Bjørn logo"
          width={500}
          height={500}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Velkommen til Kajakpolo Danmarks Hjemmeside
          </h1>
        </div>
      </main>
    </div>
  );
}
