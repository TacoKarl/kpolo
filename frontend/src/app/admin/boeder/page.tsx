'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
    CreateFineDocument,
    GetClubsDocument,
    GetFinesDocument,
    UpdateFineDocument,
} from '@/generated/graphql';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { Toast } from '@/app/components/ui/Toast';
import { Tooltip } from '@/app/components/ui/Tooltip';

export default function BoederPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedFineId, setSelectedFineId] = useState<number | null>(null);
    const [showPaidFines, setShowPaidFines] = useState(false);

    // Form state
    const [clubId, setClubId] = useState('');
    const [reason, setReason] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Query data
    const { data: finesData, loading: finesLoading, refetch: refetchFines } = useQuery(GetFinesDocument, {
        variables: { clubId: undefined, includePaid: showPaidFines },
    });

    const { data: clubsData, loading: clubsLoading } = useQuery(GetClubsDocument, {
        variables: { includeInactive: false },
    });

    // Mutations
    const [createFine, { loading: creatingFine }] = useMutation(CreateFineDocument, {
        onCompleted: () => {
            setToastMessage('Bøde oprettet med succes!');
            setToastOpen(true);
            setClubId('');
            setReason('');
            setAmount('');
            setDate('');
            refetchFines();
        },
        onError: (error) => {
            setToastMessage(`Fejl: ${error.message}`);
            setToastOpen(true);
        },
    });

    const [updateFine, { loading: updatingFine }] = useMutation(UpdateFineDocument, {
        onCompleted: () => {
            setToastMessage('Bøde markeret som betalt!');
            setToastOpen(true);
            refetchFines();
        },
        onError: (error) => {
            setToastMessage(`Fejl: ${error.message}`);
            setToastOpen(true);
        },
    });

    const fines = finesData?.fines ?? [];
    const clubs = clubsData?.clubs ?? [];

    const handleCreateFine = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clubId || !reason || !amount || !date) {
            setToastMessage('Udfyld alle felter');
            setToastOpen(true);
            return;
        }

        await createFine({
            variables: {
                fine: {
                    club_id: Number(clubId),
                    reason,
                    amount: Number(amount),
                    date: new Date(date).toISOString(),
                    paid: false,
                },
            },
        });
    };

    const handleMarkAsPaid = (fineId: number) => {
        setSelectedFineId(fineId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmMarkPaid = async () => {
        if (selectedFineId === null) return;

        await updateFine({
            variables: {
                fine: {
                    id: selectedFineId,
                    paid: true,
                },
            },
        });

        setConfirmDialogOpen(false);
        setSelectedFineId(null);
    };

    const formatDate = (dateString: string | Date | undefined) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString('da-DK', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '0 DKK';
        return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' }).format(amount);
    };

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 p-8">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="mb-8 text-4xl font-bold text-zinc-900">Bøder</h1>

                {/* Create Fine Form */}
                <div className="mb-8">
                    <Card variant="form">
                        <h2 className="mb-4 text-2xl font-semibold text-zinc-900">Opret ny bøde</h2>
                        <form onSubmit={handleCreateFine} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Club Dropdown */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-zinc-700">Klub</label>
                                    <select
                                        value={clubId}
                                        onChange={(e) => setClubId(e.target.value)}
                                        className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">Vælg klub</option>
                                        {clubs.map((club) => (
                                            <option key={club.id} value={club.id}>
                                                {club.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-zinc-700">Beløb (DKK)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="f.eks. 500"
                                        className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-zinc-700">Dato</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                {/* Reason */}
                                <div className="col-span-2">
                                    <label className="block mb-2 text-sm font-medium text-zinc-700">Årsag</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="f.eks. Udsendelse af fejlagtig startliste"
                                        className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="submit"
                                    disabled={isMounted ? (creatingFine || clubsLoading) : false}
                                    variant="primary"
                                >
                                    {creatingFine ? 'Opretter...' : 'Opret bøde'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Fines List */}
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-zinc-900">Alle bøder</h2>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-sm font-medium text-zinc-700">Vis betalte bøder</span>
                            <input
                                type="checkbox"
                                checked={showPaidFines}
                                onChange={(e) => setShowPaidFines(e.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                            />
                        </label>
                    </div>
                    {finesLoading ? (
                        <p className="text-zinc-600">Indlæser bøder...</p>
                    ) : fines.length === 0 ? (
                        <p className="text-zinc-600">Ingen bøder registreret.</p>
                    ) : (
                        <div className="space-y-2">
                            {fines.map((fine) => fine && (
                                <Card key={fine.id} variant="info" hoverable={false}>
                                    <div className="grid grid-cols-12 gap-4 items-start">
                                         {/* Club Name */}
                                         <div className="col-span-4">
                                             <p className="text-sm font-medium text-zinc-600 mb-1">Klub</p>
                                             <p className="text-lg font-semibold text-zinc-900 truncate">{fine.club?.name}</p>
                                         </div>

                                         {/* Reason Icon with Tooltip */}
                                         <div className="col-span-1">
                                             <p className="text-sm font-medium text-zinc-600 mb-1">Årsag</p>
                                             <Tooltip content={fine.reason}>
                                                 <svg
                                                     className="h-6 w-6 text-blue-600 hover:text-blue-700 transition-colors"
                                                     fill="currentColor"
                                                     viewBox="0 0 20 20"
                                                 >
                                                     <path
                                                         fillRule="evenodd"
                                                         d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                         clipRule="evenodd"
                                                     />
                                                 </svg>
                                             </Tooltip>
                                         </div>

                                         {/* Amount */}
                                         <div className="col-span-2 text-right">
                                             <p className="text-sm font-medium text-zinc-600 mb-1">Beløb</p>
                                             <p className="text-lg font-semibold text-zinc-900">
                                                 {formatCurrency(fine.amount)}
                                             </p>
                                         </div>

                                         {/* Date */}
                                         <div className="col-span-1.5 text-right">
                                             <p className="text-sm font-medium text-zinc-600 mb-1">Dato</p>
                                             <p className="text-zinc-900">{formatDate(fine.date)}</p>
                                         </div>

                                         {/* Paid Status */}
                                         <div className="col-span-1.5 text-center">
                                             <p className="text-sm font-medium text-zinc-600 mb-1">Status</p>
                                             <p
                                                 className={`text-sm font-semibold ${
                                                     fine.paid ? 'text-green-600' : 'text-red-600'
                                                 }`}
                                             >
                                                 {fine.paid ? 'Betalt' : 'Ubetalt'}
                                             </p>
                                         </div>

                                         {/* Action Button */}
                                         <div className="col-span-2">
                                             <Button
                                                 variant="secondary"
                                                 onClick={() => handleMarkAsPaid(fine.id)}
                                                 disabled={updatingFine}
                                                 inactive={fine.paid}
                                                 className="w-full text-sm"
                                             >
                                                 {fine.paid ? 'Allerede betalt' : 'Markér som betalt'}
                                             </Button>
                                         </div>
                                     </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialogOpen}
                title="Marker som betalt"
                message="Er du sikker på, at du vil markere denne bøde som betalt?"
                onConfirm={handleConfirmMarkPaid}
                onCancel={() => {
                    setConfirmDialogOpen(false);
                    setSelectedFineId(null);
                }}
            />

            {/* Toast */}
            <Toast message={toastMessage} open={toastOpen} onClose={() => setToastOpen(false)} />
        </div>
    );
}
