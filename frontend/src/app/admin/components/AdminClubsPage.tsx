'use client';

import { useState } from "react";
import { useClubs } from "@/app/components/hooks/useClubs";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import {
    CreateClubDocument,
    GetClubsDocument,
    GetUsersDocument,
    SetClubActiveDocument,
    UpdateClubDocument,
} from "@/generated/graphql";
import { Toast } from "@/app/components/ui/Toast";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

export default function AdminClubsPage() {
    const client = useApolloClient();
    const [showInactive, setShowInactive] = useState(false);
    const { regions, loading, clubs } = useClubs(showInactive);

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [region, setRegion] = useState("");
    const [managerEmail, setManagerEmail] = useState("");
    const [toastOpen, setToastOpen] = useState(false);
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [editName, setEditName] = useState(false);
    const [editAddress, setEditAddress] = useState(false);
    const [editRegion, setEditRegion] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");
    const [editAddressValue, setEditAddressValue] = useState("");
    const [editRegionValue, setEditRegionValue] = useState("");
    const [confirmInactivateOpen, setConfirmInactivateOpen] = useState(false);

    const [createClub, { loading: creating }] = useMutation(CreateClubDocument);
    const [updateClub, { loading: updating }] = useMutation(UpdateClubDocument, {
        refetchQueries: [GetClubsDocument],
    });
    const [inactivateClub, { loading: inactivating }] = useMutation(SetClubActiveDocument);
    const [setClubActive, { loading: togglingActive }] = useMutation(SetClubActiveDocument);

    const { data: usersData, loading: usersLoading } = useQuery(GetUsersDocument);
    const users = usersData?.users ?? [];

    const handleCreateClub = async () => {
        if (!name || !address || !region || !managerEmail) return;

        await createClub({
            variables: {
                name,
                address,
                region,
                managerEmail,
            },
        });
        await client.refetchQueries({
            include: [GetClubsDocument],
        });

        setName("");
        setAddress("");
        setRegion("");
        setManagerEmail("");
        setToastOpen(true);
    };

    const selectedClub = selectedClubId
        ? clubs.find((club) => club.id === selectedClubId)
        : undefined;

    const handleSelectClub = (clubId: string) => {
        const club = clubs.find((c) => c.id === clubId);
        if (!club) return;

        setSelectedClubId(clubId);
        setEditNameValue(club.name);
        setEditAddressValue(club.address ?? "");
        setEditRegionValue(club.region ?? "");
        setEditName(false);
        setEditAddress(false);
        setEditRegion(false);
    };

    const originalName = selectedClub?.name ?? "";
    const originalAddress = selectedClub?.address ?? "";
    const originalRegion = selectedClub?.region ?? "";
    const isNameDirty = editNameValue !== originalName;
    const isAddressDirty = editAddressValue !== originalAddress;
    const isRegionDirty = editRegionValue !== originalRegion;

    const handleSaveClubName = async () => {
        if (!selectedClubId) return;
        await updateClub({
            variables: {
                id: Number(selectedClubId),
                name: editNameValue,
            },
        });
        setEditName(false);
    };

    const handleSaveClubAddress = async () => {
        if (!selectedClubId) return;
        await updateClub({
            variables: {
                id: Number(selectedClubId),
                address: editAddressValue,
            },
        });
        setEditAddress(false);
    };

    const handleSaveClubRegion = async () => {
        if (!selectedClubId) return;
        await updateClub({
            variables: {
                id: Number(selectedClubId),
                region: editRegionValue,
            },
        });
        setEditRegion(false);
    };

    const handleInactivateClub = async () => {
        if (!selectedClubId) return;
        await inactivateClub({
            variables: { id: Number(selectedClubId), isActive: false },
        });
        await client.refetchQueries({
            include: [GetClubsDocument],
        });
        setConfirmInactivateOpen(false);
        setSelectedClubId(null);
    };

    const handleRestoreClub = async () => {
        if (!selectedClubId) return;
        await setClubActive({
            variables: { id: Number(selectedClubId), isActive: true },
        });
        await client.refetchQueries({
            include: [GetClubsDocument],
        });
        setSelectedClubId(null);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Klubber du bestyrer:</h3>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    Vis inaktive
                </label>
            </div>
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
                                        <button
                                            type="button"
                                            onClick={() => handleSelectClub(c.id)}
                                            className={`text-left hover:underline ${
                                                c.isActive ? "" : "text-gray-400"
                                            }`}
                                        >
                                            {c.name}
                                        </button>
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

                <select
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="border p-2 rounded"
                    disabled={usersLoading}
                >
                    <option value="">Vælg manager (email)</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.email}>
                            {u.email}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleCreateClub}
                    disabled={creating}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Opret klub
                </button>
            </div>

            {selectedClub && (
                <div className="mt-8 flex flex-col gap-3 max-w-md">
                    <h3 className="text-lg font-semibold">Rediger klub</h3>

                    <div className="flex items-center gap-2">
                        <input
                            value={editNameValue}
                            readOnly={!editName}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className={`border p-2 rounded flex-1 ${
                                editName ? "" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                        {!editName ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditNameValue(originalName);
                                    setEditName(true);
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
                                        setEditNameValue(originalName);
                                        setEditName(false);
                                    }}
                                    className="border px-3 py-2 rounded transition hover:bg-gray-50 active:bg-gray-100"
                                >
                                    Fortryd
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveClubName}
                                    disabled={updating || !isNameDirty}
                                    className={`border px-3 py-2 rounded transition ${
                                        updating || !isNameDirty
                                            ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Gem
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            value={editAddressValue}
                            readOnly={!editAddress}
                            onChange={(e) => setEditAddressValue(e.target.value)}
                            className={`border p-2 rounded flex-1 ${
                                editAddress ? "" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        />
                        {!editAddress ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditAddressValue(originalAddress);
                                    setEditAddress(true);
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
                                        setEditAddressValue(originalAddress);
                                        setEditAddress(false);
                                    }}
                                    className="border px-3 py-2 rounded transition hover:bg-gray-50 active:bg-gray-100"
                                >
                                    Fortryd
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveClubAddress}
                                    disabled={updating || !isAddressDirty}
                                    className={`border px-3 py-2 rounded transition ${
                                        updating || !isAddressDirty
                                            ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Gem
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={editRegionValue}
                            disabled={!editRegion}
                            onChange={(e) => setEditRegionValue(e.target.value)}
                            className={`border p-2 rounded flex-1 ${
                                editRegion ? "" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            <option value="">Vælg region</option>
                            <option value="Jylland">Jylland</option>
                            <option value="Fyn">Fyn</option>
                            <option value="Sjælland">Sjælland</option>
                        </select>
                        {!editRegion ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditRegionValue(originalRegion);
                                    setEditRegion(true);
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
                                        setEditRegionValue(originalRegion);
                                        setEditRegion(false);
                                    }}
                                    className="border px-3 py-2 rounded transition hover:bg-gray-50 active:bg-gray-100"
                                >
                                    Fortryd
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveClubRegion}
                                    disabled={updating || !isRegionDirty}
                                    className={`border px-3 py-2 rounded transition ${
                                        updating || !isRegionDirty
                                            ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                                            : "bg-green-600 text-white border-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    Gem
                                </button>
                            </>
                        )}
                    </div>

                    {selectedClub.isActive ? (
                        <button
                            type="button"
                            onClick={() => setConfirmInactivateOpen(true)}
                            disabled={inactivating}
                            className="mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        >
                            Inaktivér klub
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleRestoreClub}
                            disabled={togglingActive}
                            className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                        >
                            Genopret klub
                        </button>
                    )}
                </div>
            )}
            {selectedClub?.isActive && (
                <ConfirmDialog
                    open={confirmInactivateOpen}
                    title="Inaktivér klub"
                    message="Denne handling gør klubben inaktiv. Den vil ikke længere kunne ses på hjemmesiden, og alle kamphold tilknyttet klubben vil også blive skjult."
                    confirmationLabel="Skriv klubbens navn for at bekræfte inaktivering"
                    expectedText={selectedClub?.name ?? ""}
                    confirmLabel="Ok"
                    cancelLabel="Afbryd"
                    onConfirm={handleInactivateClub}
                    onCancel={() => setConfirmInactivateOpen(false)}
                />
            )}
            <Toast
                message="Klub oprettet"
                open={toastOpen}
                onClose={() => setToastOpen(false)}
            />
        </div>
    )
}
