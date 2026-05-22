'use client';

import { useParams } from 'next/navigation';
import { useQuery } from "@apollo/client/react";
import { GetClubDocument } from "@/generated/graphql";
import "../clubs.css"

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
        <div className="club-page">
            <div className="club-card">

                <div className="club-header">
                    <h1>{club.name}</h1>
                </div>

                <div className="club-info">
                    <div className="info-box">
                        <span className="label">Region</span>
                        <span>{club.region}</span>
                    </div>

                    <div className="info-box">
                        <span className="label">Address</span>
                        <span>{club.address}</span>
                    </div>
                </div>

                <div className="teams-section">
                    <h2>Teams</h2>

                    {teams.length === 0 ? (
                        <p className="empty-text">
                            Der er ingen hold registeret til denne klub.
                        </p>
                    ) : (
                        <ul className="teams-list">
                            {teams.map((team) => (
                                <li key={team.id} className="team-card">
                                    {team.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
