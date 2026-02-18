import Image from "next/image";

export default function Home() {
  return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Image
              className="light:invert"
              src="/globe.svg"
              alt="Globus"
              width={500}
              height={500}
              priority
            />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Denne side er lavet som et bachelorprojekt til Kajakpolo Danmark.
          </h1>
        </div>
  );
}
