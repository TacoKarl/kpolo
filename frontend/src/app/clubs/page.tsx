'use client';
import { useClubs } from "@/app/components/hooks/useClubs";
import Link from "next/link";
import "./clubs.css";

export default function ClubsPage() {
    const { loading, error, regions } = useClubs();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="regions-grid">
            <RegionList title="Jylland" clubs={regions.Jylland} />
            <RegionList title="Fyn" clubs={regions.Fyn} />
            <RegionList title="Sjælland" clubs={regions.Sjælland} />
        </div>
    );
}

type RegionListProps = {
    title: string;
    clubs: {
        id: string;
        name: string;
        address: string;
    }[];
};

function RegionList({ title, clubs }: RegionListProps) {
    return (
        <div className="regions-card">
            <div className={`region-header`}>
                <h2>{title}</h2>
            </div>

            <ul className="club-list">
                {clubs.map((club) => (
                    <li key={club.id}>
                        <Link
                            href={`/clubs/${club.id}`}
                            className="club-card"
                        >
                            <div className="club-name">
                                {club.name}
                            </div>

                            <div className="club-address">
                                {club.address}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
