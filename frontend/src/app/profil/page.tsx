import {Button} from "@/components/Button";
import { getMe } from "@/app/lib/getMe";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function profilePage () {
    const user = await getMe();
    if (!user) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold">Profil</h1>
                <p>Du er ikke logget ind.</p>
                <Button>
                    <Link href="/login">Log ind</Link>
                </Button>
            </div>
        );
    }


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Profil</h1>

            <div className="space-y-2">
                {/*{user.avatarUrl && <img src={user.avatarUrl} alt="Profilbillede" className="w-24 h-24 rounded-full" />}*/}
                <p>Navn: {user.name}</p>
                <p>Klub: {user.clubName ?? "Ingen klub"}</p>
                <p>Rolle(r): {user.roles.join(", ") || "Ingen roller"}</p>
            </div>

            <LogoutButton />
        </div>
    );
}
