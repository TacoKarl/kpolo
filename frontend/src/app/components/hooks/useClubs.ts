'use client';
import { useQuery } from "@apollo/client/react";
import {
    GetClubsDocument,
    GetClubsQuery,
    GetClubDocument,
    GetClubQuery,
    Club,
} from "@/generated/graphql";
import type { DocumentNode } from 'graphql';

// Now supports optionally fetching a single club by id (used for Club Admins)
export function useClubs(includeInactive = false, clubId?: number | string) {
    // Call hook unconditionally; pick document and variables dynamically to satisfy hooks rules
    const document: DocumentNode = (clubId ? GetClubDocument : GetClubsDocument) as unknown as DocumentNode;
    type AllQuery = GetClubsQuery | GetClubQuery;
    const variables = clubId ? { id: String(clubId), includeInactive } : { includeInactive };
    const { data, loading, error } = useQuery<AllQuery>(document, { variables });

    if (clubId) {
        const clubData = data as GetClubQuery | undefined;
        const club = clubData?.club ? [clubData.club] : [];

        const jyllandClubs = club.filter((c) => c.region?.toLowerCase() === "jylland");
        const fynClubs = club.filter((c) => c.region?.toLowerCase() === "fyn");
        const sjaellandClubs = club.filter((c) => c.region?.toLowerCase() === "sjælland");

        return {
            loading,
            error,
            clubs: club,
            regions: {
                Jylland: jyllandClubs,
                Fyn: fynClubs,
                Sjælland: sjaellandClubs,
            },
        };
    }

    const clubsData = data as GetClubsQuery | undefined;
    const clubs = clubsData?.clubs ?? [];

    // Filtrering efter regioner
    const jyllandClubs = clubs.filter((c) => c.region?.toLowerCase() === "jylland");
    const fynClubs = clubs.filter((c) => c.region?.toLowerCase() === "fyn");
    const sjaellandClubs = clubs.filter((c) => c.region?.toLowerCase() === "sjælland");

    return {
        loading,
        error,
        clubs,
        regions: {
            Jylland: jyllandClubs,
            Fyn: fynClubs,
            Sjælland: sjaellandClubs,
        },
    };
}
