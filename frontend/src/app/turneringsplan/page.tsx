'use client';

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type PlanRow = {
    id: string;
    slot: string;
    match: string;
    division: string;
    court: string;
    status: string;
};

type SlotCell = {
    id: string;
    slot: string;
    match: PlanRow | null;
};

type DragOrigin = {
    courtId: string;
    slot: string;
};

const initialRows: PlanRow[] = [
    { id: "row-1", slot: "08:00 - 08:30", match: "Team A vs Team B", division: "U12", court: "Bane 1", status: "Planned" },
    { id: "row-2", slot: "08:30 - 09:00", match: "Team C vs Team D", division: "U12", court: "Bane 2", status: "Planned" },
    { id: "row-3", slot: "09:00 - 09:30", match: "Team E vs Team F", division: "U14", court: "Bane 1", status: "Planned" },
    { id: "row-4", slot: "09:30 - 10:00", match: "Team G vs Team H", division: "U14", court: "Bane 2", status: "Planned" },
];

function MatchCard({
                       match,
                       origin,
                       dragging = false,
                   }: {
    match: PlanRow;
    origin?: DragOrigin;
    dragging?: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: match.id,
        data: { match, origin },
        disabled: dragging,
    });

    const style = {
        // Keeps the ghost in place
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : "transform 500ms ease",
        opacity: isDragging ? 0.3 : 1,
        // LOCK HEIGHT: This prevents the cell from expanding/contracting
        height: "58px",
    };

    return (
        <button
            ref={setNodeRef}
            type="button"
            {...attributes}
            {...listeners}
            style={style}
            className={`w-full flex flex-col justify-center rounded border border-zinc-200 bg-white px-3 py-2 text-left shadow-sm ${
                dragging ? "shadow-xl border-blue-400 z-50" : "hover:bg-zinc-50"
            }`}
        >
            <div className="font-medium text-sm truncate">{match.match}</div>
            <div className="text-[10px] text-gray-500 truncate">
                {match.division} · {match.status}
            </div>
        </button>
    );
}

function SlotCellView({
                          courtId,
                          slot,
                          match,
                          activeMatch,
                          dragOrigin,
                      }: {
    courtId: string;
    slot: SlotCell;
    match: PlanRow | null;
    activeMatch: PlanRow | null;
    dragOrigin: DragOrigin | null;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${courtId}-${slot.slot}`,
        data: { courtId, slot: slot.slot },
    });

    const isDraggedOrigin =
        !!activeMatch &&
        dragOrigin?.courtId === courtId &&
        dragOrigin?.slot === slot.slot;

    return (
        <tr>
            <td className="border px-3 py-2 whitespace-nowrap bg-gray-50 text-sm w-32">
                {slot.slot}
            </td>
            <td
                ref={setNodeRef}
                className={`border px-2 py-2 align-middle transition-colors ${
                    isOver ? "bg-blue-50" : ""
                }`}
            >
                <div className="relative w-full h-14.5"> {/* Container keeps row height stable */}
                    {isDraggedOrigin ? (
                        <MatchCard match={activeMatch} origin={dragOrigin!} dragging />
                    ) : match ? (
                        <MatchCard match={match} origin={{ courtId, slot: slot.slot }} />
                    ) : (
                        <div className="h-14.5 w-full rounded border border-dashed border-gray-200 bg-gray-50/50" />
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function Page() {
    const [selectedTournamentId, setSelectedTournamentId] = useState("");
    const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
    const [activeMatch, setActiveMatch] = useState<PlanRow | null>(null);
    const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);

    const tournaments = useMemo(
        () => [
            { id: "1", name: "Sommer Cup 2026" },
            { id: "2", name: "Vinter Serie 2026" },
            { id: "3", name: "Mesterskab 2026" },
        ],
        []
    );

    const algorithms = useMemo(
        () => [
            { id: "simple-seed", name: "Simple seed" },
            { id: "balanced-slots", name: "Balanced slots" },
            { id: "court-rotation", name: "Court rotation" },
        ],
        []
    );

    const slotDefinitions = useMemo(
        () => ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00"],
        []
    );

    const courts = useMemo(
        () => Array.from(new Set(initialRows.map((row) => row.court))),
        []
    );

    const [courtSlots, setCourtSlots] = useState<Record<string, SlotCell[]>>(() => {
        const byCourt = courts.reduce<Record<string, SlotCell[]>>((acc, court) => {
            acc[court] = slotDefinitions.map((slot) => ({
                id: `${court}-${slot}`,
                slot,
                match: null,
            }));
            return acc;
        }, {});

        initialRows.forEach((row) => {
            const court = byCourt[row.court];
            if (!court) return;
            const cell = court.find((slot) => slot.slot === row.slot);
            if (cell) cell.match = row;
        });

        return byCourt;
    });

    const handleDragStart = (event: DragStartEvent) => {
        const match = event.active.data.current?.match as PlanRow | undefined;
        const origin = event.active.data.current?.origin as DragOrigin | undefined;

        if (match) setActiveMatch(match);
        if (origin) setDragOrigin(origin);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveMatch(null);
        setDragOrigin(null);

        if (!over) return;

        const draggedMatch = active.data.current?.match as PlanRow | undefined;
        const overData = over.data.current as { courtId?: string; slot?: string } | undefined;

        if (!draggedMatch || !overData?.courtId || !overData?.slot) return;

        const sourceCourtId = draggedMatch.court;
        const sourceSlotId = draggedMatch.slot;
        const targetCourtId = overData.courtId;
        const targetSlotId = overData.slot;

        setCourtSlots((current) => {
            const next = structuredClone(current);

            const sourceCourt = next[sourceCourtId];
            const targetCourt = next[targetCourtId];
            if (!sourceCourt || !targetCourt) return current;

            const sourceCell = sourceCourt.find((cell) => cell.slot === sourceSlotId);
            const targetCell = targetCourt.find((cell) => cell.slot === targetSlotId);
            if (!sourceCell || !targetCell) return current;

            const targetMatch = targetCell.match;

            sourceCell.match = targetMatch
                ? { ...targetMatch, court: sourceCourtId, slot: sourceSlotId }
                : null;

            targetCell.match = { ...draggedMatch, court: targetCourtId, slot: targetSlotId };

            return next;
        });
    };

    const groupedByCourt = useMemo(() => {
        return courts.map((court) => ({
            court,
            slots: courtSlots[court] ?? [],
        }));
    }, [courts, courtSlots]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Tournament Plan</h1>
                <p className="text-sm text-gray-600">
                    Vælg en turnering og en algoritme for at generere en kampplan.
                </p>
            </div>

            <Card hoverable={false}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Turnering</label>
                        <select
                            value={selectedTournamentId}
                            onChange={(e) => setSelectedTournamentId(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Vælg turnering</option>
                            {tournaments.map((tournament) => (
                                <option key={tournament.id} value={tournament.id}>
                                    {tournament.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Algoritme</label>
                        <select
                            value={selectedAlgorithm}
                            onChange={(e) => setSelectedAlgorithm(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="">Vælg algoritme</option>
                            {algorithms.map((algorithm) => (
                                <option key={algorithm.id} value={algorithm.id}>
                                    {algorithm.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="primary"
                            disabled={!selectedTournamentId || !selectedAlgorithm}
                            className="w-full"
                        >
                            Generér plan
                        </Button>
                    </div>
                </div>
            </Card>

            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                autoScroll={false}
            >
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {groupedByCourt.map(({ court, slots }) => (
                        <Card hoverable={false} key={court}>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold">{court}</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="border px-3 py-2 w-44">Tidsrum</th>
                                        <th className="border px-3 py-2">Kamp</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {slots.map((slot) => (
                                        <SlotCellView
                                            key={slot.id}
                                            courtId={court}
                                            slot={slot}
                                            match={slot.match}
                                            activeMatch={activeMatch}
                                            dragOrigin={dragOrigin}
                                        />
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ))}
                </div>

                <DragOverlay>
                    {activeMatch && dragOrigin ? (
                        <MatchCard match={activeMatch} origin={dragOrigin} dragging />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}