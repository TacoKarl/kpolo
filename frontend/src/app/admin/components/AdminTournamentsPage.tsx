'use client';

import {useEffect, useState} from "react";

import {useApolloClient, useMutation, useQuery} from "@apollo/client/react";
import {
    CreateTournamentDocument,
    GetClubsWithTeamsDocument,
    GetTournamentsDocument,
    UpdateTournamentDocument
} from "@/generated/graphql";
import {Toast} from "@/app/components/ui/Toast";
import {Card} from "@/components/Card";
import cardStyles from "@/components/Card/Card.module.css"
import formStyles from "@/styles/Forms.module.css"
import {Button} from "@/components/Button";

type EditableDivision = {
    id: number;
    name: string;
    public: boolean;
    teams: number[]; // store team IDs only
};
type EditableDate = {
    date: string;
    public: boolean;
};

export default function AdminTournamentsPage() {
    const client = useApolloClient();
    const { data: clubsData, loading: clubsLoading } = useQuery(GetClubsWithTeamsDocument);
    const clubs = clubsData?.clubs ?? [];

    const {data: tournamentsData, loading: tournamentsLoading } = useQuery(GetTournamentsDocument);

    const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
    const selectedTournament = tournamentsData?.tournaments.find(
        (t) => t.id === Number(selectedTournamentId)
    );

    const [editName, setEditName] = useState("");
    const [editSeason, setEditSeason] = useState("");
    const [editDivisions, setEditDivisions] = useState<EditableDivision[]>([]);
    const [editDates, setEditDates] = useState<EditableDate[]>([]);

    const [updateTournament] = useMutation(UpdateTournamentDocument);
    const [toastOpen, setToastOpen] = useState(false);

    const [tournamentName, setTournamentName] = useState("")
    const [tournamentSeason, setTournamentSeason] = useState("")

    const [dates, setDates] = useState<DateItem[]>([])

    const [divisions, setDivisions] = useState<Division[]>([])

    const [showDates, setShowDates] = useState(false)
    const [showDivisions, setShowDivisions] = useState(false)

    const [createTournament, { loading }] = useMutation(CreateTournamentDocument)

    const toggleDates = () => setShowDates(!showDates)
    const toggleDivisions = () => setShowDivisions(!showDivisions)


    const addDate = () => {
        setDates([...dates, { date: "", public: false }])
    }

    const addDivision = () => {
        setDivisions([
            ...divisions,
            {
                id: Date.now(),
                name: "",
                public: false,
                teams: []
            }
        ])
    }

    const handleCreateTournament = async () => {
        try {
            await createTournament({
                variables: {
                    input: {
                        name: tournamentName,
                        season: tournamentSeason,
                        divisions: divisions.map(d => ({ name: d.name })), // DivisionInput[]
                        dates: dates.map(d => ({ date: new Date(d.date).toISOString() })), // ISO strings
                        teamAssignments: divisions.flatMap((div, divIndex) =>
                            div.teams
                                .filter(id => id !== 0)
                                .map(teamId => ({
                                    teamId: Number(teamId), // ✅ sørg for Int
                                    divisionIndex: divIndex
                                }))
                        ),
                    },
                },
            });

            alert("Turnering oprettet!");
        } catch (error) {
            console.error(error);
            alert("Der skete en fejl ved oprettelse af turneringen.");
        }
    };


    useEffect(() => {
        if (!selectedTournament) return;

        // map dates
        const datesArray = selectedTournament.dates ?? [];
        const divisionArray = selectedTournament.divisions ?? [];
        setEditDates(
            datesArray
                .filter(d => d?.date)
                .map(d => ({
                    date: new Date(d.date).toISOString().slice(0, 10),
                    public: true,
                }))
        );


        // map divisions
        setEditDivisions(
            divisionArray.map(d => ({
                id: d.id,
                name: d.name,
                public: true,
                // Convert the string ID from Apollo/GraphQL to a Number
                teams: d.teams?.map(t => Number(t.team.id)) ?? [],
            }))
        );

        setEditName(selectedTournament.name);
        setEditSeason(selectedTournament.season);
    }, [selectedTournamentId, selectedTournament]);

    const removeTeamFromDivision = (divisionIndex: number, teamIndex: number) => {
        const updated = [...editDivisions]; // brug editDivisions i stedet for divisions
        if (!updated[divisionIndex]) return; // sikkerhedstjek
        updated[divisionIndex].teams.splice(teamIndex, 1); // fjern team
        setEditDivisions(updated); // opdater state
    };

    const removeDivision = (divisionIndex: number) => {
        const updated = [...divisions];
        updated.splice(divisionIndex, 1);
        setDivisions(updated);
    };

    const addTeamToDivision = (divisionIndex: number) => {
        const updated = [...divisions]
        updated[divisionIndex].teams.push(0)
        setDivisions(updated)
    }
    const handleAddDivision = () => {
        setEditDivisions([...editDivisions, { id: Date.now(), name: "", teams: [], public: false }]);
    };

    const handleAddDate = () => {
        setEditDates([...editDates, { date: "", public: false }]);
    };

    const handleSaveTournament = async () => {
        if (!selectedTournament) return;

        try {
            await updateTournament({
                variables: {
                    id: Number(selectedTournament.id),
                    input: {
                        name: editName,
                        season: editSeason,
                        divisions: editDivisions.map(d => ({ name: d.name })),
                        dates: editDates.map(d => ({ date: new Date(d.date).toISOString() })), // ISO strings
                        teamAssignments: editDivisions.flatMap((div, divIndex) =>
                            div.teams
                                .filter(id => id !== 0)
                                .map(teamId => ({
                                    teamId: Number(teamId), // ✅ sørg for Int
                                    divisionIndex: divIndex
                                }))
                        ),
                    },
                },
            });

            await client.refetchQueries({
                include: [GetTournamentsDocument],
            });

            setSelectedTournamentId(null);
            setToastOpen(true);
        } catch (error) {
            console.error(error);
            alert("Der skete en fejl ved opdatering af turneringen.");
        }
    };

    return (
        <>
            <div>
                <h1>Allerede registrerede turneringer</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournamentsData?.tournaments.map(t => (
                        <Card
                            key={t.id}
                            onClick={() => setSelectedTournamentId(prev =>
                                prev === String(t.id) ? null : String(t.id)
                            )}
                        >
                            <h2 className={cardStyles.title}>{t.name}</h2>
                            <p className={cardStyles.text}>Sæson: {t.season}</p>
                            <p className={cardStyles.text}>Divisioner: {t.divisions?.length ?? 0}</p>
                            <p className={cardStyles.text}>
                                Datoer: {t.dates?.map(d => new Date(d.date).toLocaleDateString("da-DK")).join(", ")}
                            </p>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <Card variant='form'>
                        <h1 className={cardStyles.title}>Registrer ny turnering</h1>
                        <input
                            className={formStyles.input}
                            type={"text"}
                            placeholder={"Danmarksturneringen"}
                            onChange={(e) =>
                                setTournamentName(e.target.value)}
                        />
                        <input
                            className={formStyles.input}
                            type={"text"}
                            placeholder={"Sæson"}
                            onChange={(e) =>
                                setTournamentSeason(e.target.value)}
                        />
                        <div className="flex items-center gap-3">
                            <h2 className={cardStyles.title}>Tilføj datoer:</h2>
                            <label className="switch">
                                <input className={cardStyles.text} type="checkbox" id="publicToggle" onClick={toggleDates} />
                                <span className="slider"></span>
                            </label>
                        </div>
                        {dates.map((d, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    className={cardStyles.text}
                                    type="date"
                                    value={d.date}
                                    onChange={(e) => {
                                        const updated = [...dates]
                                        updated[index].date = e.target.value
                                        setDates(updated)
                                    }}
                                />
                            </div>
                        ))}
                        <Button
                            variant={'outline'}
                            className="hover:cursor-pointer border-black"
                            onClick={addDate}
                        >
                            +
                        </Button>
                        <div className="flex items-center gap-3">
                            <h2>Tilføj Divisioner</h2>
                            <button
                                onClick={toggleDivisions}
                                className="border px-2 rounded"
                            >
                                {showDivisions ? "Offentlig" : "Privat"}
                            </button>
                        </div>
                        {divisions.map((div, divIndex) => (
                            <div key={div.id} className="bg-zinc-50  border-zinc-300  rounded-lg p-4 mb-4 shadow-sm relative w-fit ">

                                <input
                                    type="text"
                                    placeholder="Division navn"
                                    value={div.name}
                                    onChange={(e) => {
                                        const updated = [...divisions];
                                        updated[divIndex].name = e.target.value;
                                        setDivisions(updated);
                                    }}
                                    className={formStyles.input}
                                />
                                <Button
                                    type="button"
                                    variant='danger'
                                    onClick={() => removeDivision(divIndex)}
                                    className=""
                                >
                                    Slet
                                </Button>
                                {div.teams.map((teamId, teamIndex) => (
                                    <div key={teamIndex} className="flex gap-2 items-center w-fit">
                                        <select
                                            value={teamId}
                                            onChange={(e) => {
                                                const updated = [...divisions];
                                                updated[divIndex].teams[teamIndex] = Number(e.target.value);
                                                setDivisions(updated);
                                            }}
                                            className={formStyles.select}
                                        >
                                            <option value={0}>Vælg hold</option>
                                            {clubs.map((club) => (
                                                <optgroup key={club.id} label={club.name}>
                                                    {club.teams?.map((team) => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <Button
                                            variant='danger'
                                            type="button"
                                            onClick={() => removeTeamFromDivision(divIndex, teamIndex)}
                                            className=""
                                        >
                                            Slet
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant={'outline'}
                                    onClick={() => addTeamToDivision(divIndex)}
                                    className=""
                                >
                                    + Tilføj hold
                                </Button>
                            </div>

                        ))}
                        <Button
                            variant={'outline'}
                            className="hover:cursor-pointer border-2 rounded-lg"
                            onClick={addDivision}
                        >
                            + Tilføj division
                        </Button>
                            <Button
                                variant='primary'
                                className="hover:cursor-pointer"
                                onClick={handleCreateTournament}
                            >
                                Publicer
                            </Button>
                    </Card>
                    </div>
                {selectedTournament && (
                        <Card>
                        <h2 className="text-xl font-semibold mb-4">Rediger Turnering</h2>

                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border p-2 rounded mb-2 w-full"
                        />
                        <input
                            value={editSeason}
                            onChange={(e) => setEditSeason(e.target.value)}
                            className="border p-2 rounded mb-4 w-full"
                        />

                        <h3 className="font-medium mb-2">Datoer</h3>
                        {editDates.map((d, idx) => (
                            <div key={idx} className="flex gap-2 mb-1 items-center">
                                <input
                                    type="date"
                                    value={d.date}
                                    onChange={(e) => {
                                        const updated = [...editDates];
                                        updated[idx].date = e.target.value;
                                        setEditDates(updated);
                                    }}
                                    className="border p-1 rounded"
                                />
                            </div>
                        ))}
                        <Button onClick={handleAddDate} variant={'outline'}>
                            + Tilføj dato
                        </Button>

                        <h3 className="font-medium mb-2">Divisioner</h3>
                        {editDivisions.map((div, divIndex) => (
                            <div key={div.id} className="border p-2 rounded mb-2">
                                <input
                                    value={div.name}
                                    onChange={(e) => {
                                        const updated = [...editDivisions];
                                        updated[divIndex].name = e.target.value;
                                        setEditDivisions(updated);
                                    }}
                                    className="border p-1 rounded mb-1 w-full"
                                />

                                {div.teams.map((teamId, teamIndex) => (
                                    <div key={teamIndex} className="flex gap-2 items-center">
                                        <select
                                            value={teamId}
                                            onChange={(e) => {
                                                const updated = [...editDivisions];
                                                updated[divIndex].teams[teamIndex] = Number(e.target.value);
                                                setEditDivisions(updated);
                                            }}
                                            className="border p-1 rounded w-full mb-1"
                                        >
                                            <option value={0}>Vælg hold</option>
                                            {clubs.map(c => (
                                                <optgroup key={c.id} label={c.name}>
                                                    {c.teams?.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                        <Button
                                            type="button"
                                            variant={'danger'}
                                            onClick={() => removeTeamFromDivision(divIndex, teamIndex)}
                                            className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                                        >
                                            Slet
                                        </Button>
                                    </div>
                                ))}

                                <Button
                                    variant={'outline'}
                                    onClick={() => {
                                        const updated = [...editDivisions];
                                        updated[divIndex].teams.push(0);
                                        setEditDivisions(updated);
                                    }}
                                    className="bg-green-500 text-white px-2 py-1 rounded"
                                >
                                    + Tilføj hold
                                </Button>
                            </div>
                        ))}
                        <button onClick={handleAddDivision} className="bg-green-500 text-white px-2 py-1 rounded mb-4">
                            + Tilføj division
                        </button>

                        <button onClick={handleSaveTournament} className="bg-blue-600 text-white px-3 py-2 rounded">
                            Gem ændringer
                        </button>
                        </Card>
                )}
                </div>

                <Toast
                    message="Turnering opdateret"
                    open={toastOpen}
                    onClose={() => setToastOpen(false)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card variant='blackSpace'>none</Card>

            </div>

        </>
    )
}