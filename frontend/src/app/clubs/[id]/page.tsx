'use client';

import { useParams } from 'next/navigation';
import { useGetClubQuery } from '@/generated/graphql';

export default function ClubPage() {
    const { id } = useParams();
    const { data, loading, error } = useGetClubQuery({ variables: { id: id as string } });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const club = data?.club;
    if (!club) return <p>Club not found</p>;

    return (
        <div>
            <h1>{club.name}</h1>
            <p>City: {club.city}</p>
            <p>Address: {club.address}</p>
        </div>
    );
}