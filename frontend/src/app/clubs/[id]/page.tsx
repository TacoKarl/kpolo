'use client'; // hvis du skal bruge Apollo eller client-side fetching

import { useParams } from 'next/navigation';
import { gql } from '@apollo/client';
import {useQuery} from "@apollo/client/react";
import { GetClubData } from '../../types/graphql'; // tilpas type

const GET_CLUB = gql`
    query GetClub($id: ID!) {
        club(id: $id) {
            id
            name
            city
            address
        }
    }
`;

export default function ClubPage() {
    const { id } = useParams();

    // Client-side fetch med Apollo
    const { loading, error, data } = useQuery<GetClubData>(GET_CLUB, {
        variables: { id },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    const club = data?.club;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">{club?.name}</h1>
            <p>By: {club?.city}</p>
            <p>Adresse: {club?.address}</p>
        </div>
    );
}