import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Script from "next/script";
import ApolloAppProvider from "@/app/providers/ApolloProvider";
import { getMe } from "@/app/lib/getMe";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kajakpolo Danmark",
  description: "Kajakpolo Danmarks forside",
};

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: React.ReactNode;
}>) {
  // Pull both user context and telemetry lists
  const { user: initialUser, logs: serverLogs } = await getMe();

  return (
      <html lang="en">
      <head>
        <title>Kajakpolo Danmark</title>
        <link rel="preconnect" href="https://challenges.cloudflare.com"/>
      </head>
      <body className="antialiased">
      <ApolloAppProvider>
        <Navbar user={initialUser}/>

        {/* Visual Dev Overlay Panel for Production Logging */}
        <div className="bg-zinc-900 border-b border-yellow-600/30 text-emerald-400 font-mono p-4 text-xs max-h-60 overflow-y-auto w-full select-all">
          <div className="font-bold text-yellow-500 mb-2 border-b border-zinc-800 pb-1">
            🔍 [PRODUCTION SERVER DIALOGUE]
          </div>
          {serverLogs.length === 0 ? (
              <p className="text-zinc-500">No logs generated. Execution skipped.</p>
          ) : (
              serverLogs.map((log, index) => (
                  <div key={index} className="py-0.5 leading-relaxed break-all">
                    {log}
                  </div>
              ))
          )}
        </div>

        {children}
      </ApolloAppProvider>
      <Footer />
      </body>
      </html>
  );
}