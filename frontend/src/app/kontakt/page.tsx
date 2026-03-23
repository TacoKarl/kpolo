import Image from "next/image";

export default function Home() {
  return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
            <Image
              src="/file.svg"
              alt="Kontakt"
              width={500}
              height={500}
              priority
            />
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black ">
            Kontakt os på: PLACEHOLDER@gmail.com
          </h1>
        </div>
  );
}
