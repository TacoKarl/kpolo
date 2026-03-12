'use client';
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

export default function profilePage () {
    const { user, setUser } = useUser();
    const router = useRouter();

    const handleLogout = () => {
        // Ryd context og localStorage
        setUser(null);
        localStorage.removeItem("token"); // hvis du også gemmer token separat
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Profil</h1>
            {user && (
                <div className="mt-4 flex flex-col gap-2">
                    <p>Navn: {user.name}</p>
                    {user.avatarUrl && <img src={user.avatarUrl} alt="Profilbillede" className="w-24 h-24 rounded-full" />}

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