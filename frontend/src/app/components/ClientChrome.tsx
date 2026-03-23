"use client";

import dynamic from "next/dynamic";
import React from "react";

const Navbar = dynamic(() => import("./navbar"), { ssr: false });

export default function ClientChrome({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
