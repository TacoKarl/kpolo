'use client';
import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import {Button} from "@/components/Button";

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
                <div>
                    <p>Navn: {user.name}</p>
                    {user.avatarUrl && <img src={user.avatarUrl} alt="Profilbillede" className="w-24 h-24 rounded-full" />}

                    <Button
                        onClick={handleLogout}
                        variant='danger'>
                        Log ud
                    </Button>
                </div>
            )}
        </div>
    )
}
