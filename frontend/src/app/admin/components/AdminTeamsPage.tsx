'use client';

import { useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
    CreateTeamDocument,
    GetClubMembersDocument,
    GetClubsWithTeamsDocument,
} from "@/generated/graphql";
import { Toast } from "@/app/components/ui/Toast";

export default function AdminTeamsPage() {
    const client = useApolloClient();
    const { data: clubsData, loading: clubsLoading } = useQuery(GetClubsWithTeamsDocument);
    const clubs = clubsData?.clubs ?? [];

    const [name, setName] = useState("");
    const [clubId, setClubId] = useState("");
    const [memberIds, setMemberIds] = useState<number[]>([]);
    const [toastOpen, setToastOpen] = useState(false);

    const { data: membersData, loading: membersLoading } = useQuery(GetClubMembersDocument, {
        variables: { id: clubId },
        skip: !clubId,
    });
    const members = membersData?.club?.members ?? [];

    const [createTeam, { loading: creating }] = useMutation(CreateTeamDocument);

    const toggleMember = (userId: number) => {
        setMemberIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateTeam = async () => {
        if (!name || !clubId) return;

        await createTeam({
            variables: {
                name,
                clubId: Number(clubId),
                memberIds,
            },
        });
        await client.refetchQueries({
            include: [GetClubsWithTeamsDocument, GetClubMembersDocument],
        });

        setName("");
        setMemberIds([]);
        setToastOpen(true);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Alle hold</h3>
            {clubsLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <div key={club.id}>
                            <h4 className="font-medium mb-2">{club.name}</h4>
                            <ul className="ml-4">
                                {club.teams.map((t) => (
                                    <li key={t.id}>{t.name}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex flex-col gap-2 max-w-md">
                <h3 className="text-lg font-semibold mb-2">Opret nyt hold</h3>
                <input
                    placeholder="Holdnavn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 rounded"
                />

                <select
                    value={clubId}
                    onChange={(e) => {
                        setClubId(e.target.value);
                        setMemberIds([]);
                    }}
                    className="border p-2 rounded"
                >
                    <option value="">Vælg klub</option>
                    {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                            {club.name}
                        </option>
                    ))}
                </select>

                <div className="border p-2 rounded">
                    <div className="font-medium mb-2">Vælg spillere</div>
                    {!clubId ? (
                        <p>Vælg en klub for at se spillere.</p>
                    ) : membersLoading ? (
                        <p>Loading...</p>
                    ) : members.length === 0 ? (
                        <p>Ingen medlemmer i denne klub.</p>
                    ) : (
                        <ul className="flex flex-col gap-1">
                            {members.map((member) => {
                                const memberId = Number(member.id);
                                return (
                                    <li key={member.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={memberIds.includes(memberId)}
                                            onChange={() => toggleMember(memberId)}
                                        />
                                        <span>{member.name} ({member.email})</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <button
                    onClick={handleCreateTeam}
                    disabled={creating}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Opret hold
                </button>
            </div>
            <Toast
                message="Hold Oprettet"
                open={toastOpen}
                onClose={() => setToastOpen(false)}
            />
        </div>
    );
}
