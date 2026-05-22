import {Button} from "@/components/Button";
import { getMe } from "@/app/lib/getMe";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import "./profil.css"

export default async function profilePage () {
    const user = await getMe();
    if (!user) {
        return (
            <div className="profile-wrapper">
                <div className="profile-card">
                    <h1>Profil</h1>

                    <p>Du er ikke logget ind.</p>

                    <Button>
                        <Link href="/login">Log ind</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const getInitials = (name: string) => {
        const parts = name.trim().split(" ");

        if (parts.length === 1) {
            return parts[0][0].toUpperCase();
        }

        return (
            parts[0][0] + parts[parts.length - 1][0]
        ).toUpperCase();
    };

    return (
        <div className="profile-wrapper">
            <div className="profile-card">

                {/* HEADER */}
                <div className="profile-header">
                    <div className="initials">
                        {getInitials(user.name)}
                    </div>

                    <div>
                        <h1>{user.name}</h1>
                        <p>Kajakpolo Danmark</p>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="profile-content">

                    <h2>Profiloplysninger</h2>

                    <div className="info-grid">

                        <div className="info-box">
                            <span className="label">Navn</span>
                            <span>{user.name}</span>
                        </div>

                        <div className="info-box">
                            <span className="label">Klub</span>
                            <span>{user.clubName ?? "Ingen klub"}</span>
                        </div>

                        <div className="info-box">
                            <span className="label">Roller</span>
                            <span>
                                {user.roles?.join(", ") || "Ingen roller"}
                            </span>
                        </div>

                    </div>

                    <div className="logout">
                        <LogoutButton />
                    </div>

                </div>

            </div>
        </div>
    );
}
