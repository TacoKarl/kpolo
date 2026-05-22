'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { getLogoutUrl } from "@/app/lib/apiUrls";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);

        try {
            await fetch(getLogoutUrl(), {
                method: "POST",
                credentials: "include",
            });
        } finally {
            router.replace("/");
            router.refresh();
        }
    };

    return (
        <Button onClick={handleLogout} disabled={isLoading} variant={'danger'}>
            {isLoading ? "Logger ud..." : "Log ud"}
        </Button>
    );
}
