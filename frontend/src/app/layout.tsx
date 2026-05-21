import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Script from "next/script";
import ApolloAppProvider from "@/app/providers/ApolloProvider";
import { getMeWithTelemetry } from "@/app/lib/getMe"; // Points to our diagnostic hook

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
    // Use the telemetry method strictly here to collect execution steps
    const { user: initialUser, logs: serverLogs } = await getMeWithTelemetry();

    return (
        <html lang="en">
        <head>
            <title>Kajakpolo Danmark</title>
            <link rel="preconnect" href="https://challenges.cloudflare.com"/>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ApolloAppProvider>

            {/* Visual Dev Debug Overlay Panel */}
            <div className="bg-zinc-950 border-b-2 border-amber-500/40 text-emerald-400 font-mono p-4 text-xs max-h-64 overflow-y-auto w-full select-all relative z-[9999]">
                <div className="font-bold text-amber-400 mb-2 border-b border-zinc-800 pb-1 flex justify-between">
                    <span>🔍 [PRODUCTION SERVER SYSTEM DIALOGUE]</span>
                    <span className="text-zinc-500 text-[10px]">Refresh page to re-trigger execution</span>
                </div>
                {serverLogs.length === 0 ? (
                    <p className="text-zinc-500 italic">No console steps generated during render timeline.</p>
                ) : (
                    serverLogs.map((log, index) => (
                        <div key={index} className="py-0.5 leading-relaxed break-all">
                            {log}
                        </div>
                    ))
                )}
            </div>

            <Navbar user={initialUser}/>
            {children}
        </ApolloAppProvider>
        <Footer />
        <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            async
            defer
            strategy="beforeInteractive"
        />
        </body>
        </html>
    );
}