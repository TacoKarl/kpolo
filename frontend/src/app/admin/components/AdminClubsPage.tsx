import {useState} from "react";
import {useClubs} from "@/app/components/hooks/useClubs";

export default function AdminClubsPage() {
    const { regions, loading } = useClubs();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [region, setRegion] = useState("");
    const [email, setEmail] = useState("");
    const [managerId, setManagerId] = useState("");

    const handleCreateClub = async () => {
        /* await createClub(
            name,
            address,
            region,
            email,
            Number(managerId)
        );
         */

        setName("");
        setAddress("");
        setRegion("");
        setEmail("");
        setManagerId("");
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Alle klubber</h3>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {Object.entries(regions).map(([region, clubs]) => (
                        <div key={region}>
                            <h4 className="font-medium capitalize mb-2">{region}</h4>
                            <ul className="ml-4">
                                {clubs.map((c) => (
                                    <li key={c.id}>
                                        {c.name} – {c.city}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-col gap-2 max-w-md">
                <h3 className="text-lg font-semibold mb-2">Opret ny klub</h3>
                <input
                    placeholder="Klub navn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                />

                <input
                    placeholder="Adresse"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">Vælg region</option>
                    <option value="Jylland">Jylland</option>
                    <option value="Fyn">Fyn</option>
                    <option value="Sjælland">Sjælland</option>
                </select>

                <input
                    placeholder="Klub Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 rounded"
                />

                <button
                    onClick={handleCreateClub}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Opret klub
                </button>
            </div>
        </div>
    )
}