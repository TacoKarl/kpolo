import { getMe } from "@/app/lib/getMe";
import { Button } from "@/components/Button";
import Link from "next/link";
import MyClubContent from "./MyClubContent";
import "./myClub.css"

export default async function MyClubPage() {
    const user = await getMe();

    if (!user) {
        return (
            <div className="my-club-page">
                <div className="my-club-card">
                    <div className="my-club-header">
                        <h1>Min Klub</h1>
                    </div>
                    <div className="status">
                        <p>Du er ikke logget ind.</p>
                        <Button>
                            <Link href="/login">Log ind</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user.clubId) {
        return (
            <div className="my-club-page">
                <div className="my-club-card">
                    <div className="my-club-header">
                        <h1>Min Klub</h1>
                    </div>
                    <div className="status">
                        <p>Du er ikke medlem af en klub.</p>
                    </div>
                </div>
            </div>
        );
    }

    return <MyClubContent clubId={user.clubId} />;
}



