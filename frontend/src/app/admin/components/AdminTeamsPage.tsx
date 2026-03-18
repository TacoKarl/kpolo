'use client';

import { useEffect, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
    CreateTeamDocument,
    GetClubMembersDocument,
    GetClubsWithTeamsDocument,
    GetTeamForEditDocument,
    UpdateTeamDocument,
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
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [editTeamName, setEditTeamName] = useState(false);
    const [editTeamMembers, setEditTeamMembers] = useState(false);
    const [editTeamNameValue, setEditTeamNameValue] = useState("");
    const [editMemberIds, setEditMemberIds] = useState<number[]>([]);

    const { data: membersData, loading: membersLoading } = useQuery(GetClubMembersDocument, {
        variables: { id: clubId },
        skip: !clubId,
    });
    const members = membersData?.club?.members ?? [];

    const [createTeam, { loading: creating }] = useMutation(CreateTeamDocument);
    const [updateTeam, { loading: updating }] = useMutation(UpdateTeamDocument);

    const { data: editTeamData } = useQuery(GetTeamForEditDocument, {
        variables: { id: selectedTeamId ?? "" },
        skip: !selectedTeamId,
    });
    const editTeam = editTeamData?.team;
    const editClubMembers = editTeam?.club?.members ?? [];
    const originalTeamName = editTeam?.name ?? "";
    const originalMemberIds = editTeam?.members.map((m) => Number(m.id)) ?? [];
    const isTeamNameDirty = editTeamNameValue !== originalTeamName;
    const isTeamMembersDirty =
        editMemberIds.length !== originalMemberIds.length ||
        editMemberIds.some((id) => !originalMemberIds.includes(id));

    useEffect(() => {
        if (!editTeam) return;
        setEditTeamNameValue(editTeam.name);
        setEditMemberIds(editTeam.members.map((m) => Number(m.id)));
        setEditTeamName(false);
        setEditTeamMembers(false);
    }, [editTeam?.id]);

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

    const handleSaveTeamName = async () => {
        if (!editTeam) return;

        await updateTeam({
            variables: {
                id: Number(editTeam.id),
                name: editTeamNameValue,
            },
        });
        await client.refetchQueries({
            include: [GetClubsWithTeamsDocument, GetTeamForEditDocument],
        });

        setEditTeamName(false);
    };

    const handleSaveTeamMembers = async () => {
        if (!editTeam) return;

        await updateTeam({
            variables: {
                id: Number(editTeam.id),
                memberIds: editMemberIds,
            },
        });
        await client.refetchQueries({
            include: [GetClubsWithTeamsDocument, GetTeamForEditDocument],
        });

        setEditTeamMembers(false);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Hold du bestyrer:</h3>
            {clubsLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="grid grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <div key={club.id}>
                            <h4 className="font-medium mb-2">{club.name}</h4>
                            <ul className="ml-4">
                                {club.teams.map((t) => (
                                    <li key={t.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTeamId(t.id)}
                                            className="text-left hover:underline"
                                        >
                                            {t.name}
                                        </button>
                                    </li>
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

            {editTeam && (
                <div className="mt-8 flex flex-col gap-3 max-w-md">
                    <h3 className="text-lg font-semibold">Rediger hold</h3>

                    <div className="flex items-center gap-2">
                        <input
                            value={editTeamNameValue}
                            readOnly={!editTeamName}
                            onChange={(e) => setEditTeamNameValue(e.target.value)}
                            className={`border p-2 rounded flex-1 ${
                                editTeamName ? "" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                        {!editTeamName ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditTeamNameValue(originalTeamName);
                                    setEditTeamName(true);
                                }}
                                className="text-blue-600 hover:underline"
                            >
                                Rediger
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditTeamNameValue(originalTeamName);
                                        setEditTeamName(false);
                                    }}
                                    className="text-red-500 hover:underline"
                                >
                                    Fortryd
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTeamName}
                                    disabled={updating || !isTeamNameDirty}
                                    className={`border px-3 py-2 rounded transition ${
                                        updating || !isTeamNameDirty
                                            ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Gem
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border p-2 rounded">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Holdspillere</span>
                            {!editTeamMembers ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditMemberIds(originalMemberIds);
                                        setEditTeamMembers(true);
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    Rediger
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditMemberIds(originalMemberIds);
                                            setEditTeamMembers(false);
                                        }}
                                        className="text-red-500 hover:underline"
                                    >
                                        Fortryd
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveTeamMembers}
                                        disabled={updating || !isTeamMembersDirty}
                                        className={`border px-3 py-1 rounded transition ${
                                            updating || !isTeamMembersDirty
                                                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                                                : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                        }`}
                                    >
                                        Gem
                                    </button>
                                </div>
                            )}
                        </div>
                        {editClubMembers.length === 0 ? (
                            <p>Ingen medlemmer i denne klub.</p>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {editClubMembers.map((member) => {
                                    const memberId = Number(member.id);
                                    return (
                                        <li key={member.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editMemberIds.includes(memberId)}
                                                onChange={() => {
                                                    if (!editTeamMembers) return;
                                                    setEditMemberIds((prev) =>
                                                        prev.includes(memberId)
                                                            ? prev.filter((id) => id !== memberId)
                                                            : [...prev, memberId]
                                                    );
                                                }}
                                                disabled={!editTeamMembers}
                                            />
                                            <span>{member.name} ({member.email})</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                </div>
            )}
            <Toast
                message="Hold Oprettet"
                open={toastOpen}
                onClose={() => setToastOpen(false)}
            />
        </div>
    );
}
