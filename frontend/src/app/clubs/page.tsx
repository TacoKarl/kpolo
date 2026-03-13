'use client';
import { useClubs } from "@/app/components/hooks/useClubs";
import Link from "next/link";

export default function ClubsPage() {
    const { loading, error, regions } = useClubs();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className="flex justify-between">
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
        city: string;
    }[];
};

function RegionList({ title, clubs }: RegionListProps) {
    return (
        <div>
            <h2>{title}</h2>
            <ul>
                {clubs.map(c => (
                    <li key={c.id}>
                        <Link href={`/clubs/${c.id}`}>{c.name}</Link> – {c.city}
                    </li>
                ))}
            </ul>
        </div>
    );
}