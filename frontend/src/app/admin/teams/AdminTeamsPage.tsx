'use client';

import { useMemo, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
    CreateTeamDocument,
    GetClubDocument,
    GetClubMembersDocument,
    GetClubsWithTeamsDocument,
    GetTeamForEditDocument,
    SetTeamActiveDocument,
    UpdateTeamDocument,
} from "@/generated/graphql";
import { Toast } from "@/app/components/ui/Toast";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import "./AdminTeamsPage.css";
import type { Me } from "@/generated/graphql";

type EditTeamFormProps = {
    team: {
        id: string;
        name: string;
        isActive: boolean;
        members: { id: string; name: string; email: string }[];
    };
    clubMembers: { id: string; name: string; email: string }[];
    updating: boolean;
    togglingActive: boolean;
    onSaveName: (id: number, nameValue: string) => Promise<void>;
    onSaveMembers: (id: number, memberIds: number[]) => Promise<void>;
    onInactivate: (id: number) => Promise<void>;
    onRestore: (id: number) => Promise<void>;
};

function EditTeamForm({
    team,
    clubMembers,
    updating,
    togglingActive,
    onSaveName,
    onSaveMembers,
    onInactivate,
    onRestore,
}: EditTeamFormProps) {
    const [editTeamName, setEditTeamName] = useState(false);
    const [editTeamMembers, setEditTeamMembers] = useState(false);
    const [editTeamNameValue, setEditTeamNameValue] = useState(team.name);
    const [editMemberIds, setEditMemberIds] = useState<number[]>(
        team.members.map((m) => Number(m.id))
    );
    const [confirmInactivateOpen, setConfirmInactivateOpen] = useState(false);

    const originalTeamName = team.name;
    const originalMemberIds = team.members.map((m) => Number(m.id));
    const isTeamNameDirty = editTeamNameValue !== originalTeamName;
    const isTeamMembersDirty =
        editMemberIds.length !== originalMemberIds.length ||
        editMemberIds.some((id) => !originalMemberIds.includes(id));

    return (
        <div className="flex flex-col gap-3 w-full">
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
                            onClick={() => onSaveName(Number(team.id), editTeamNameValue)}
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
                                onClick={() => onSaveMembers(Number(team.id), editMemberIds)}
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
                {clubMembers.length === 0 ? (
                    <p>Ingen medlemmer i denne klub.</p>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {clubMembers.map((member) => {
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

            {team.isActive ? (
                <button
                    type="button"
                    onClick={() => setConfirmInactivateOpen(true)}
                    disabled={togglingActive}
                    className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                    Inaktivér hold
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => onRestore(Number(team.id))}
                    disabled={togglingActive}
                    className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                    Genopret hold
                </button>
            )}

            {team.isActive && (
                <ConfirmDialog
                    open={confirmInactivateOpen}
                    title="Inaktivér hold"
                    message="Denne handling gør holdet inaktivt. Det vil ikke længere kunne ses på hjemmesiden."
                    confirmationLabel="Skriv holdets navn for at bekræfte inaktivering"
                    expectedText={team.name}
                    confirmLabel="Ok"
                    cancelLabel="Afbryd"
                    onConfirm={() => onInactivate(Number(team.id))}
                    onCancel={() => setConfirmInactivateOpen(false)}
                />
            )}
        </div>
    );
}

type Props = {
    initialUser?: Me | null;
    clubId?: string | number | null;
};

type TeamCard = {
    id: string;
    name: string;
    isActive: boolean;
    clubName: string;
};

export default function AdminTeamsPage({ clubId }: Props) {
    const client = useApolloClient();
    const fixedClubId = clubId !== null && clubId !== undefined && clubId !== "" ? String(clubId) : null;
    const [showInactive, setShowInactive] = useState(false);

    const { data: singleClubData, loading: singleClubLoading } = useQuery(GetClubDocument, {
        variables: { id: fixedClubId!, includeInactive: showInactive },
        skip: !fixedClubId,
    });

    const { data: allClubsData, loading: allClubsLoading } = useQuery(GetClubsWithTeamsDocument, {
        variables: { includeInactive: showInactive },
        skip: !!fixedClubId,
    });

    const clubsLoading = fixedClubId ? singleClubLoading : allClubsLoading;
    const clubs = useMemo(
        () =>
            fixedClubId
                ? (singleClubData?.club ? [singleClubData.club] : [])
                : (allClubsData?.clubs ?? []),
        [fixedClubId, singleClubData, allClubsData]
    );

    const flattenedTeams = useMemo<TeamCard[]>(() => {
        return clubs.flatMap((club) =>
            (club.teams ?? []).map((team) => ({
                id: team.id,
                name: team.name,
                isActive: team.isActive,
                clubName: club.name,
            }))
        );
    }, [clubs]);

    const [name, setName] = useState("");
    const [selectedClubId, setSelectedClubId] = useState(fixedClubId ?? "");
    const [memberIds, setMemberIds] = useState<number[]>([]);
    const [toastOpen, setToastOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    const { data: membersData, loading: membersLoading } = useQuery(GetClubMembersDocument, {
        variables: { id: selectedClubId, includeInactive: showInactive },
        skip: !selectedClubId,
    });
    const members = membersData?.club?.members ?? [];

    const [createTeam, { loading: creating }] = useMutation(CreateTeamDocument);
    const [updateTeam, { loading: updating }] = useMutation(UpdateTeamDocument);
    const [setTeamActive, { loading: togglingActive }] = useMutation(SetTeamActiveDocument);

    const { data: editTeamData } = useQuery(GetTeamForEditDocument, {
        variables: { id: selectedTeamId ?? "", includeInactive: showInactive },
        skip: !selectedTeamId,
    });
    const editTeam = editTeamData?.team;
    const editClubMembers = editTeam?.club?.members ?? [];

    const clubsRefetchDocument = fixedClubId ? GetClubDocument : GetClubsWithTeamsDocument;

    const toggleMember = (userId: number) => {
        setMemberIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateTeam = async () => {
        if (!name || !selectedClubId) return;

        await createTeam({
            variables: {
                name,
                clubId: Number(selectedClubId),
                memberIds,
            },
        });
        await client.refetchQueries({
            include: [clubsRefetchDocument],
        });

        setName("");
        setMemberIds([]);
        setToastOpen(true);
    };

    const handleSaveTeamName = async (id: number, nameValue: string) => {
        await updateTeam({
            variables: {
                id,
                name: nameValue,
            },
        });
        await client.refetchQueries({
            include: [clubsRefetchDocument, GetTeamForEditDocument],
        });
    };

    const handleSaveTeamMembers = async (id: number, memberIdsValue: number[]) => {
        await updateTeam({
            variables: {
                id,
                memberIds: memberIdsValue,
            },
        });
        await client.refetchQueries({
            include: [clubsRefetchDocument, GetTeamForEditDocument],
        });
    };

    const handleInactivateTeam = async (id: number) => {
        await setTeamActive({
            variables: { id, isActive: false },
        });
        await client.refetchQueries({
            include: [clubsRefetchDocument],
        });
        setSelectedTeamId(null);
    };

    const handleRestoreTeam = async (id: number) => {
        await setTeamActive({
            variables: { id, isActive: true },
        });
        await client.refetchQueries({
            include: [clubsRefetchDocument],
        });
        setSelectedTeamId(null);
    };

    return (
        <div className="admin-teams-container">
            <div className="admin-create-section">
                <Card>
                    <h3 className="text-lg font-semibold mb-2">Opret nyt hold</h3>
                    <input
                        placeholder="Holdnavn"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 rounded"
                    />

                    {fixedClubId ? (
                        <div className="w-full border p-2 rounded bg-gray-50 text-gray-700">
                            {clubs[0]?.name ?? "Valgt klub"}
                        </div>
                    ) : (
                        <select
                            value={selectedClubId}
                            onChange={(e) => {
                                setSelectedClubId(e.target.value);
                                setMemberIds([]);
                            }}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Vælg klub</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="w-full border p-2 rounded">
                        <div className="font-medium mb-2">Vælg spillere</div>
                        {!selectedClubId ? (
                            <p className="text-red-500">Vælg en klub for at se spillere.</p>
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
                                            <span>
                                                {member.name} ({member.email})
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <Button onClick={handleCreateTeam} disabled={creating} className="w-full">
                        Opret hold
                    </Button>
                </Card>
            </div>

            <div className="admin-divider" />

            <div className="admin-list-section">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">Vælg hold at redigere:</h3>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                        />
                        Vis inaktive
                    </label>
                </div>

                {clubsLoading ? (
                    <p>Loading...</p>
                ) : flattenedTeams.length === 0 ? (
                    <p>Ingen hold at vise.</p>
                ) : (
                    <div className="admin-teams-grid">
                        {flattenedTeams.map((team) => (
                            <button
                                key={team.id}
                                type="button"
                                onClick={() => setSelectedTeamId(team.id)}
                                className={`admin-team-card ${
                                    selectedTeamId === team.id ? "admin-team-card-selected" : ""
                                } ${team.isActive ? "" : "admin-team-card-inactive"}`}
                            >
                                <div className="admin-team-card-name">{team.name}</div>
                                <div className="admin-team-card-club">{team.clubName}</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="admin-divider" />

            <div className="admin-edit-section">
                <Card>
                    {editTeam ? (
                        <EditTeamForm
                            key={editTeam.id}
                            team={{
                                ...editTeam,
                                members: editTeam.members ?? [],
                            }}
                            clubMembers={editClubMembers}
                            updating={updating}
                            togglingActive={togglingActive}
                            onSaveName={handleSaveTeamName}
                            onSaveMembers={handleSaveTeamMembers}
                            onInactivate={handleInactivateTeam}
                            onRestore={handleRestoreTeam}
                        />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">Rediger hold</h3>
                            <p>Vælg et hold fra listen for at redigere det.</p>
                        </div>
                    )}
                </Card>
            </div>

            <Toast message="Hold Oprettet" open={toastOpen} onClose={() => setToastOpen(false)} />
        </div>
    );
}
