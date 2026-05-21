'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GetTournamentMatchesDocument } from '@/generated/graphql';

export default function TournamentPage() {
    const params = useParams();
    const tournamentId = params?.id ? String(params.id) : null;

    const { data, loading, error } = useQuery(GetTournamentMatchesDocument, {
        variables: { tournamentId: tournamentId || '' },
        skip: !tournamentId,
    });

    if (!tournamentId) {
        return (
            <div className="min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center">
                <p>Turnering ikke fundet.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center">
                <p>Henter turnering...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-50 text-zinc-900 flex items-center justify-center">
                <p>Fejl: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-zinc-900 mb-6">
                    {data?.tournament?.name}
                </h1>
                <p className="text-zinc-600">Turnering med ID: {tournamentId}</p>
            </div>
        </div>
    );
}


