'use client';

import {gql} from "@apollo/client";
import { GetClubsData, Club } from "../types/graphql";
import {useQuery} from "@apollo/client/react";
import Link from "next/link";

type ClubPreview = {
    id: string
    name: string
    city: string
    address: string
}

const GET_CLUBS = gql`
    query GetClubs {
        clubs {
            id
            name
            city
            address
            contact_info
            website
        }
    }
`;

export default function clubsPage () {
    // const { loading, error, data } = useQuery<GetClubsData>(GET_CLUBS);
    // const jyllandClubs = data?.clubs.filter(c => getRegion(c) === "Jylland") ?? [];
    // const fynClubs = data?.clubs.filter(c => getRegion(c) === "Fyn") ?? [];
    // const sjællandClubs = data?.clubs.filter(c => getRegion(c) === "Sjælland") ?? [];

    // TODO: Klubber skal have kontaktinfo, og en webadresse
    // TODO: Når databasen er sat op, hent data derfra i stedet for dummy data


    const dummyClubs: ClubPreview[] = [
        { id: "1", name: "Aarhus Kajakklub", city: "Aarhus", address: "Åboulevarden 15" },
        { id: "2", name: "Odense Kajakklub", city: "Odense", address: "Flakhaven 7" },
        { id: "3", name: "Fredericia Vandklub", city: "Fredericia", address: "Vestre Ringvej 10" },
        { id: "4", name: "Svendborg Kajakklub", city: "Svendborg", address: "Havnegade 5" },
        { id: "5", name: "København Kajakklub", city: "København", address: "Nyhavn 23" },
        { id: "6", name: "Roskilde Kajakklub", city: "Roskilde", address: "Helligkorsvej 12" },
        { id: "7", name: "Silkeborg Kajakklub", city: "Silkeborg", address: "Østergade 3" },
    ];

    const jyllandClubs = dummyClubs.filter(c => getRegionPreview(c) === "Jylland") ?? [];
    const fynClubs = dummyClubs.filter(c => getRegionPreview(c) === "Fyn") ?? [];
    const sjællandClubs = dummyClubs.filter(c => getRegionPreview(c) === "Sjælland") ?? [];

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error.message}</p>;

    return (
        <>
            <div className="min-h-screen flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center mt-10">
                    Find din nærmeste klub
                </h1>
                <div className="flex w-full max-w-6xl justify-between mt-16 px-8">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Jylland</h2>
                        <ul className="mt-4 space-y-2">
                            {jyllandClubs.map(club => (
                                <li key={club.id}>
                                    <Link href={`/clubs/${club.id}`}>{club.name}</Link> – {club.city}
                                    <br/>
                                    {club.address}
                                    <br/>
                                    Find mere info her: <a href="https://www.example.dk">www.example.dk</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Fyn</h2>
                        <ul className="mt-4 space-y-2">
                            {fynClubs.map(club => (
                                <li key={club.id}>
                                    <Link href={`/clubs/${club.id}`}>{club.name}</Link> – {club.city}
                                    <br/>
                                    {club.address}
                                    <br/>
                                    Find mere info her: <a href="https://www.example.dk">www.example.dk</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Sjælland</h2>
                        <ul className="mt-4 space-y-2">
                            {sjællandClubs.map(club => (
                                <li key={club.id}>
                                    <Link href={`/clubs/${club.id}`}>{club.name}</Link> – {club.city}
                                    <br/>
                                    {club.address}
                                    <br/>
                                    Find mere info her: <a href="https://www.example.dk">www.example.dk</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}

function getRegion(club: Club): "Jylland" | "Fyn" | "Sjælland" {
    const city = club.city.toLowerCase();

    // Eksempel på simpel filtrering – tilpas til jeres byer
    if (["aarhus", "fredericia", "silkeborg"].includes(city)) return "Jylland";
    if (["odense", "svendborg"].includes(city)) return "Fyn";
    return "Sjælland";
}

function getRegionPreview(club: ClubPreview): "Jylland" | "Fyn" | "Sjælland" {
    const city = club.city.toLowerCase();

    // Eksempel på simpel filtrering – tilpas til jeres byer
    if (["aarhus", "fredericia", "silkeborg"].includes(city)) return "Jylland";
    if (["odense", "svendborg"].includes(city)) return "Fyn";
    return "Sjælland";
}