'use client';

import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from "@dnd-kit/core";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { MatchCard, SlotCellView, PlanRow, SlotCell, DragOrigin } from "./components";

interface Props {
    initialDates: { id: string; date: string }[];
    courts: string[];
    slotDefinitions: string[];
    initialMatches: PlanRow[];
}

export function TournamentPlanner({ initialDates, courts, slotDefinitions, initialMatches }: Props) {
    const [localDates, setLocalDates] = useState(initialDates);
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
                    <Button onClick={() => setLocalDates([...localDates, { id: `temp-${Date.now()}`, date: new Date().toISOString().split('T')[0] }])} variant="secondary">+ Tilføj Dato</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {localDates.map(d => (
                        <div key={d.id} className="flex items-center gap-2 bg-white border p-2 rounded shadow-sm">
                            <input type="date" value={d.date.split('T')[0]} onChange={(e) => setLocalDates(localDates.map(ld => ld.id === d.id ? { ...ld, date: e.target.value } : ld))} className="text-sm outline-none" />
                            <button onClick={() => setLocalDates(localDates.filter(ld => ld.id !== d.id))} className="text-red-400 hover:text-red-600">×</button>
                        </div>
                    ))}
                </div>
            </Card>

            <DndContext collisionDetection={closestCenter} onDragStart={(e) => { setActiveMatch(e.active.data.current?.match); setDragOrigin(e.active.data.current?.origin); }} onDragEnd={handleDragEnd}>
                {localDates.map((tDate) => (
                    <div key={tDate.id} className="space-y-4">
                        <h2 className="text-xl font-semibold uppercase tracking-wider text-gray-700">{new Date(tDate.date).toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
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