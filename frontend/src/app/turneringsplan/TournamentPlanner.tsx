'use client';

import { useMemo, useState } from "react";
import {useApolloClient, useMutation} from "@apollo/client/react"
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from "@dnd-kit/core";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { MatchCard, SlotCellView, PlanRow, SlotCell, DragOrigin } from "./components";

import { CreateTournamentDateDocument, DeleteTournamentDateDocument } from "@/generated/graphql";


interface Props {
    tournamentId: number;
    initialDates: { id: string; date: string }[];
    courts: string[];
    slotDefinitions: string[];
    initialMatches: PlanRow[];
}

export function TournamentPlanner({ tournamentId, initialDates, courts, slotDefinitions, initialMatches }: Props) {
    // Tournament Date stuff
    const [localDates, setLocalDates] = useState(initialDates);
    const [deletedDateIds, setDeletedDateIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createDate] = useMutation(CreateTournamentDateDocument);
    const [deleteDate] = useMutation(DeleteTournamentDateDocument);

    const handleAddDate = () => {
        const newDate = { id: `temp-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
        setLocalDates([...localDates, newDate]);
    };

    const handleRemoveDate = (id: string) => {
        setLocalDates(localDates.filter(ld => ld.id !== id));
        // Only track for deletion if it's a real database ID (not starting with temp-)
        if (!id.startsWith('temp-')) {
            setDeletedDateIds(prev => [...prev, id]);
        }
    };

    const handleSubmitDates = async () => {
        setIsSubmitting(true);
        try {
            // 1. Delete removed dates
            for (const id of deletedDateIds) {
                await deleteDate({ variables: { id: parseInt(id) } });
            }

            // 2. Create new dates (only those with 'temp-' prefix)
            for (const d of localDates) {
                if (d.id.startsWith('temp-')) {
                    await createDate({
                        variables: {
                            tournamentId,
                            date: d.date
                        }
                    });
                }
            }

            // Reset tracking state after success
            setDeletedDateIds([]);
            alert("Datoer opdateret!");
            // Optionally: window.location.reload() or re-fetch via Apollo
        } catch (error) {
            console.error("Fejl ved opdatering af datoer:", error);
            alert("Der skete en fejl.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRevertChanges = () => {
        if (confirm("Er du sikker på, at du vil fortryde alle ændringer til datoerne?")) {
            setLocalDates(initialDates);
            setDeletedDateIds([]);

            // 3. Optional: If you want to revert match drags too, clear overrides
            //setOverrides(null);
        }
    };

    // Match stuff
    const [overrides, setOverrides] = useState<Record<string, Record<string, SlotCell[]>> | null>(null);
    const [activeMatch, setActiveMatch] = useState<PlanRow | null>(null);
    const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);

    const baseDateCourtSlots = useMemo(() => {
        const byDate: Record<string, Record<string, SlotCell[]>> = {};
        localDates.forEach((tDate) => {
            const dateId = String(tDate.id);
            byDate[dateId] = {};
            courts.forEach((court) => {
                byDate[dateId][court] = slotDefinitions.map((slot) => ({
                    id: `${dateId}-${court}-${slot}`, slot, match: null,
                }));
            });
        });

        initialMatches.forEach((row) => {
            const firstDateId = localDates[0]?.id;
            if (firstDateId && byDate[firstDateId]?.[row.court]) {
                const cell = byDate[firstDateId][row.court].find((s) => s.slot === row.slot);
                if (cell) cell.match = row;
            }
        });
        return byDate;
    }, [localDates, courts, slotDefinitions, initialMatches]);

    const dateCourtSlots = overrides ?? baseDateCourtSlots;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveMatch(null);
        setDragOrigin(null);
        if (!over) return;

        const draggedMatch = active.data.current?.match as PlanRow;
        const sourceOrigin = active.data.current?.origin as DragOrigin;
        const overData = over.data.current as { dateId: string; courtId: string; slot: string };

        setOverrides((current) => {
            const next = structuredClone(current ?? baseDateCourtSlots);
            const sourceCell = next[sourceOrigin.dateId]?.[sourceOrigin.courtId]?.find(c => c.slot === sourceOrigin.slot);
            const targetCell = next[overData.dateId]?.[overData.courtId]?.find(c => c.slot === overData.slot);

            if (sourceCell && targetCell) {
                const targetMatch = targetCell.match;
                sourceCell.match = targetMatch ? { ...targetMatch, court: sourceOrigin.courtId, slot: sourceOrigin.slot } : null;
                targetCell.match = { ...draggedMatch, court: overData.courtId, slot: overData.slot };
            }
            return next;
        });
    };

    return (
        <div className="space-y-8">
            <Card hoverable={false}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Planlæg Datoer</h3>
                    <div className="flex gap-2">
                        <Button onClick={handleAddDate} variant="secondary">
                            + Tilføj Dato
                        </Button>
                        {(deletedDateIds.length > 0 || localDates.some(d => d.id.startsWith('temp-'))) && (
                            <>
                                <Button
                                    onClick={handleRevertChanges}
                                    variant="outline"
                                    disabled={isSubmitting}
                                >
                                    Fortryd
                                </Button>

                                <Button
                                    onClick={handleSubmitDates}
                                    //isLoading={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Gem Ændringer
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {localDates.map(d => (
                        <div key={d.id} className={`flex items-center gap-2 border p-2 rounded shadow-sm ${d.id.startsWith('temp-') ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                            <input
                                type="date"
                                value={d.date.split('T')[0]}
                                onChange={(e) => setLocalDates(localDates.map(ld => ld.id === d.id ? { ...ld, date: e.target.value } : ld))}
                                className="text-sm outline-none bg-transparent"
                            />
                            <button onClick={() => handleRemoveDate(d.id)} className="text-red-400 hover:text-red-600">×</button>
                        </div>
                    ))}
                </div>
            </Card>

            <DndContext collisionDetection={closestCenter} onDragStart={(e) => { setActiveMatch(e.active.data.current?.match); setDragOrigin(e.active.data.current?.origin); }} onDragEnd={handleDragEnd}>
                {localDates.map((tDate) => (
                    <div key={tDate.id} className="space-y-4">
                        <h2 className="text-xl font-semibold uppercase tracking-wider text-gray-700">
                            {new Date(tDate.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {courts.map(court => (
                                <Card hoverable={false} key={court}>
                                    <h3 className="font-bold mb-2">{court}</h3>
                                    <table className="w-full">
                                        <tbody>
                                        {(dateCourtSlots[tDate.id]?.[court] || []).map(slot => (
                                            <SlotCellView key={slot.id} dateId={tDate.id} courtId={court} slot={slot} match={slot.match} activeMatch={activeMatch} dragOrigin={dragOrigin} />
                                        ))}
                                        </tbody>
                                    </table>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
                <DragOverlay>{activeMatch && dragOrigin && <MatchCard match={activeMatch} origin={dragOrigin} dragging />}</DragOverlay>
            </DndContext>
        </div>
    );
}