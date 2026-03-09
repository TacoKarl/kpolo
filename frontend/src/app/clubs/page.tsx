'use client';

import { useQuery } from "@apollo/client/react";
import { GetClubsDocument } from "@/generated/graphql";
import Link from "next/link";

export default function ClubsPage() {
    const { data, loading, error } = useQuery(GetClubsDocument);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const clubs = data?.clubs ?? [];

    const jyllandClubs = clubs.filter(c =>
        ["aarhus", "fredericia", "silkeborg"].includes(c.city.toLowerCase())
    );

    const fynClubs = clubs.filter(c =>
        ["odense", "svendborg"].includes(c.city.toLowerCase())
    );

    const sjællandClubs = clubs.filter(c =>
        !["aarhus", "fredericia", "silkeborg", "odense", "svendborg"].includes(
            c.city.toLowerCase()
        )
    );

    return (
        <div className="flex justify-between">
            <RegionList title="Jylland" clubs={jyllandClubs} />
            <RegionList title="Fyn" clubs={fynClubs} />
            <RegionList title="Sjælland" clubs={sjællandClubs} />
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
                {clubs.map((c) => (
                    <li key={c.id}>
                        <Link href={`/clubs/${c.id}`}>{c.name}</Link> – {c.city}
                    </li>
                ))}
            </ul>
        </div>
    );
}