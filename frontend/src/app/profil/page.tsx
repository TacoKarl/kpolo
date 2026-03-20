'use client';
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/app/lib/auth";
import { getLogoutUrl } from "@/app/lib/apiUrls";
import Image from "next/image";

export default function ProfilePage () {
    const { user, setUser } = useUser();
    const router = useRouter();

    const handleLogout = async () => {
        clearAccessToken();
        setUser(null);
        try {
            await fetch(getLogoutUrl(), { method: "POST", credentials: "include" });
        } catch {
            // Ignore logout failures; the client state is already cleared.
        }
        router.push("/login");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Profil</h1>
            {user && (
                <div className="mt-4 flex flex-col gap-2">
                    <p>Navn: {user.name}</p>
                    {user.avatarUrl && (
                        <Image
                            src={user.avatarUrl}
                            alt="Profilbillede"
                            width={96}
                            height={96}
                            className="w-24 h-24 rounded-full"
                        />
                    )}

                    <button
                        onClick={handleLogout}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Log ud
                    </button>
                </div>
            )}
        </div>
    )
}
