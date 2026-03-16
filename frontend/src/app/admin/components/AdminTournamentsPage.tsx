import {useState} from "react";

export default function AdminTournamentsPage() {
    const [tournamentName, setTournamentName] = useState("")

    const [dates, setDates] = useState<DateItem[]>([])
    const [divisions, setDivisions] = useState<Division[]>([])
    const [teams, setTeams] = useState<Team[]>([])

    const [showDates, setShowDates] = useState(false)
    const [showDivisions, setShowDivisions] = useState(false)
    const [showTeams, setShowTeams] = useState(false)

    const allTeams: ClubTeam[] = [
        { id: 1, name: "Aarhus BK" },
        { id: 2, name: "KB" },
        { id: 3, name: "Brøndby" },
        { id: 4, name: "FC Midtjylland" }
    ]

    const toggleDates = () => setShowDates(!showDates)
    const toggleDivisions = () => setShowDivisions(!showDivisions)
    const toggleTeams = () => setShowTeams(!showTeams)

    const addDate = () => {
        setDates([...dates, { date: "", public: false }])
    }

    const addDivision = () => {
        setDivisions([...divisions, { id: Date.now(), name: "", public: false }])
    }

    const addTeam = () => {
        setTeams([...teams, { teamId: 0, divisionId: 0, public: false }])
    }

    return (
        <>
            <div>
                <h1>Registrer ny turnering</h1>
                <input type={"text"} placeholder={"Danmarksturneringen 2026"}/>
                <div className="flex items-center gap-3">
                    <h2>Tilføj datoer:</h2>
                    <button
                        onClick={toggleDates}
                        className="border px-2 rounded"
                    >
                        {showDates ? "Offentlig" : "Privat"}
                    </button>
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
                {divisions.map((d, index) => (
                    <div key={index} className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="(Liga, Dame, U15, 1. Div...)"
                            value={d.name}
                            onChange={(e) => {
                                const updated = [...divisions]
                                updated[index].name = e.target.value
                                setDivisions(updated)
                            }}
                        />
                    </div>
                ))}
                <button
                    className="hover:cursor-pointer border-black border-2 rounded-lg h-7 w-7"
                    onClick={addDivision}
                >
                    +
                </button>
                <div className="flex items-center gap-3">
                    <h2>Tilføj Hold</h2>
                    <button
                        onClick={toggleTeams}
                        className="border px-2 rounded"
                    >
                        {showTeams ? "Offentlig" : "Privat"}
                    </button>
                </div>
                {teams.map((t, index) => (
                    <div key={index} className="flex gap-2">

                        {/* HOLD */}
                        <select
                            disabled={teams.length === 0}
                            value={t.teamId}
                            onChange={(e) => {
                                const updated = [...teams]
                                updated[index].teamId = Number(e.target.value)
                                setTeams(updated)
                            }}
                        >
                            <option value={0}>Vælg hold</option>

                            {allTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>

                        {/* DIVISION */}
                        <select
                            disabled={divisions.length === 0}
                            value={t.divisionId}
                            onChange={(e) => {
                                const updated = [...teams]
                                updated[index].divisionId = Number(e.target.value)
                                setTeams(updated)
                            }}
                        >
                            <option value={0}>Vælg division</option>

                            {divisions.map((div) => (
                                <option key={div.id} value={div.id}>
                                    {div.name}
                                </option>
                            ))}
                        </select>

                    </div>
                ))}
                <button
                    className="hover:cursor-pointer border-black border-2 rounded-lg h-7 w-7"
                    onClick={addTeam}
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