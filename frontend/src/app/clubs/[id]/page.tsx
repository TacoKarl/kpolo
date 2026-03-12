'use client';

import { useParams } from 'next/navigation';
import { useQuery } from "@apollo/client/react";
import { GetClubDocument } from "@/generated/graphql";

export default function ClubPage() {
    const params = useParams();
    const id = params.id as string;

    const { data, loading, error } = useQuery(GetClubDocument, {
        variables: { id }
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const club = data?.club;
    if (!club) return <p>Club not found</p>;
    const teams = club.teams ?? [];

    return (
        <div>
            <h1>{club.name}</h1>
            <p>City: {club.city}</p>
            <p>Address: {club.address}</p>
            <h2>Teams</h2>
            {teams.length === 0 ? (
                <p>Der er ingen hold registeret til denne klub.</p>
            ) : (
                <ul>
                    {teams.map((team) => (
                        <li key={team.id}>{team.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
