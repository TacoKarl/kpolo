import {useState} from "react";
import {useClubs} from "@/app/components/hooks/useClubs";
import {useMutation, useQuery} from "@apollo/client/react";
import {CreateTournamentDocument, GetClubsWithTeamsDocument} from "@/generated/graphql";

export default function AdminTournamentsPage() {
    const [tournamentName, setTournamentName] = useState("")
    const [tournamentSeason, setTournamentSeason] = useState("")
    const { data: clubsData, loading: clubsLoading } = useQuery(GetClubsWithTeamsDocument);
    const clubs = clubsData?.clubs ?? [];

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
        const divisionNames = divisions.map((div) => div.name);
        const allTeamAssignments: { teamId: number; divisionIndex: number }[] = [];

        divisions.forEach((div, divIndex) => {
            div.teams.forEach((teamId) => {
                if (teamId !== 0) {
                    allTeamAssignments.push({ teamId, divisionIndex: divIndex });
                }
            });
        });

        const datesStr = dates.map((d) => d.date);

        await createTournament({
            variables: {
                name: tournamentName,
                season: tournamentSeason,
                divisions: divisions.map(d => d.name),
                dates: dates.map(d => d.date),
                teamAssignments: divisions.flatMap((div, divIndex) =>
                    div.teams.filter(id => id !== 0).map(teamId => ({ teamId, divisionIndex: divIndex }))
                ),
            },
        });

        alert("Turnering oprettet!");
    };

    const removeTeamFromDivision = (divisionIndex: number, teamIndex: number) => {
        const updated = [...divisions];
        updated[divisionIndex].teams.splice(teamIndex, 1); // fjerner ét hold
        setDivisions(updated);
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

    return (
        <>
            <div>
                <h1>Registrer ny turnering</h1>
                <input
                    type={"text"}
                    placeholder={"Danmarksturneringen"}
                    onChange={(e) =>
                        setTournamentName(e.target.value)}
                />
                <input
                    type={"text"}
                    placeholder={"Sæson"}
                    onChange={(e) =>
                        setTournamentSeason(e.target.value)}
                />
                <div className="flex items-center gap-3">
                    <h2>Tilføj datoer:</h2>
                    <label className="switch">
                        <input type="checkbox" id="publicToggle" onClick={toggleDates} />
                            <span className="slider"></span>
                    </label>
                </div>
                {dates.map((d, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
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
                <button
                    className="hover:cursor-pointer border-black border-2 rounded-lg h-7 w-7"
                onClick={addDate}
                >
                    +
                </button>
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
                    <div key={div.id} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-4 mb-4 shadow-sm relative w-full md:w-2/5">
                        <button
                            type="button"
                            onClick={() => removeDivision(divIndex)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                            X
                        </button>

                        <input
                            type="text"
                            placeholder="Division navn"
                            value={div.name}
                            onChange={(e) => {
                                const updated = [...divisions];
                                updated[divIndex].name = e.target.value;
                                setDivisions(updated);
                            }}
                            className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900"
                        />
                        {div.teams.map((teamId, teamIndex) => (
                            <div key={teamIndex} className="flex gap-2 items-center">
                                <select
                                    value={teamId}
                                    onChange={(e) => {
                                        const updated = [...divisions];
                                        updated[divIndex].teams[teamIndex] = Number(e.target.value);
                                        setDivisions(updated);
                                    }}
                                    className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900"
                                >
                                    <option value={0}>Vælg hold</option>
                                    {clubs.map((club) => (
                                        <optgroup key={club.id} label={club.name}>
                                            {club.teams.map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeTeamFromDivision(divIndex, teamIndex)}
                                    className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
                                >
                                    Slet
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => addTeamToDivision(divIndex)}
                            className="bg-green-500 text-white rounded px-3 py-1 hover:bg-green-600"
                        >
                            + Tilføj hold
                        </button>
                    </div>
                ))}
                <button
                    className="hover:cursor-pointer border-black border-2 rounded-lg h-7 w-7"
                    onClick={addDivision}
                >
                    +
                </button>
                <button
                    className="hover:cursor-pointer border-black border-2 rounded-lg h-7"
                    onClick={() => {}}
                >
                    Publicer
                </button>
            </div>
        </>
    )
}