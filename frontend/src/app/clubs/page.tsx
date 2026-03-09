'use client';

import { useGetClubsQuery } from '@/generated/graphql';
import Link from 'next/link';

export default function ClubsPage() {
    const { data, loading, error } = useGetClubsQuery();

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const clubs = data?.clubs ?? [];

    const jyllandClubs = clubs.filter(c => ['aarhus', 'fredericia', 'silkeborg'].includes(c.city.toLowerCase()));
    const fynClubs = clubs.filter(c => ['odense', 'svendborg'].includes(c.city.toLowerCase()));
    const sjællandClubs = clubs.filter(c => ![...].includes(c.city.toLowerCase()));

    return (
        <div className="flex justify-between">
            <RegionList title="Jylland" clubs={jyllandClubs} />
            <RegionList title="Fyn" clubs={fynClubs} />
            <RegionList title="Sjælland" clubs={sjællandClubs} />
        </div>
    );
}

function RegionList({ title, clubs }: any) {
    return (
        <div>
            <h2>{title}</h2>
            <ul>
                {clubs.map((c: any) => (
                    <li key={c.id}>
                        <Link href={`/clubs/${c.id}`}>{c.name}</Link> – {c.city}
                    </li>
                ))}
            </ul>
        </div>
    );
}