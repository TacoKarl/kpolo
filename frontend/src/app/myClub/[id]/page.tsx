'use client';

import { useParams } from 'next/navigation';
import { useQuery } from "@apollo/client/react";
import { GetClubDocument } from "@/generated/graphql";
import "../myClub.css"

export default function MyClubPage() {
    const params = useParams();
    const id = params.id as string;

    const { data, loading, error } = useQuery(GetClubDocument, {
        variables: { id }
    });

    if (loading) return <p className="status">Loading...</p>;
    if (error) return <p className="status error">Error: {error.message}</p>;

    const club = data?.club;
    if (!club) return <p className="status">Club not found</p>;
    const teams = club.teams ?? [];

    return (
        <div className="my-club-page">
            <div className="my-club-card">

                <div className="my-club-header">
                    <h1>{club.name}</h1>
                </div>

                <div className="my-club-info">
                    <div className="info-box">
                        <span className="label">Region</span>
                        <span>{club.region}</span>
                    </div>

                    <div className="info-box">
                        <span className="label">Address</span>
                        <span>{club.address || 'N/A'}</span>
                    </div>

                    <div className="info-box">
                        <span className="label">Contact Info</span>
                        <span>{club.contact_info || 'N/A'}</span>
                    </div>

                    <div className="info-box">
                        <span className="label">Website</span>
                        <span>
                            {club.website ? (
                                <a href={club.website} target="_blank" rel="noopener noreferrer">
                                    {club.website}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </span>
                    </div>

                    <div className="info-box">
                        <span className="label">Status</span>
                        <span>{club.isActive ? 'Active' : 'Inactive'}</span>
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
                                    <div className="team-info">
                                        <div className="team-name">{team.name}</div>
                                        <div className="team-status">
                                            {team.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}

