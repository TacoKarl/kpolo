'use client';
import { useQuery } from "@apollo/client/react";
import { GetClubsDocument, GetClubsQuery } from "@/generated/graphql";

export function useClubs() {
    const { data, loading, error } = useQuery<GetClubsQuery>(GetClubsDocument);

    const clubs = data?.clubs ?? [];

    // Filtrering efter regioner
    const jyllandClubs = clubs.filter(c =>
        ["aarhus", "fredericia", "silkeborg"].includes(c.city.toLowerCase())
    );

    const fynClubs = clubs.filter(c =>
        ["odense", "svendborg"].includes(c.city.toLowerCase())
    );

    const sjællandClubs = clubs.filter(c =>
        !["aarhus", "fredericia", "silkeborg", "odense", "svendborg"].includes(c.city.toLowerCase())
    );

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