'use client';
import { useQuery } from "@apollo/client/react";
import { GetClubsDocument, GetClubsQuery } from "@/generated/graphql";

export function useClubs() {
    const { data, loading, error } = useQuery<GetClubsQuery>(GetClubsDocument);

    const clubs = data?.clubs ?? [];

    // Filtrering efter regioner
    const jyllandClubs = clubs.filter(c => c.region?.toLowerCase() === "jylland");
    const fynClubs = clubs.filter(c => c.region?.toLowerCase() === "fyn");
    const sjællandClubs = clubs.filter(c => c.region?.toLowerCase() === "sjælland");

    return {
        loading,
        error,
        clubs,
        regions: {
            Jylland: jyllandClubs,
            Fyn: fynClubs,
            Sjælland: sjællandClubs,
        }
    };
}
