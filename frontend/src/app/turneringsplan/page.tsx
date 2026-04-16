'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GetTournamentsForSelectorDocument, GetTournamentMatchesDocument } from "@/generated/graphql";
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
    dateId: string;
    courtId: string;
    slot: string;
};

const initialRows: PlanRow[] = [
    { id: "row-1", slot: "08:00 - 08:30", match: "Team A vs Team B", division: "Dame", court: "Bane 1", status: "Planned" },
    { id: "row-2", slot: "08:30 - 09:00", match: "Team C vs Team D", division: "Dame", court: "Bane 2", status: "Planned" },
    { id: "row-3", slot: "09:00 - 09:30", match: "Team E vs Team F", division: "Liga", court: "Bane 1", status: "Planned" },
    { id: "row-4", slot: "09:30 - 10:00", match: "Team G vs Team H", division: "Liga", court: "Bane 2", status: "Planned" },
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
                          dateId,
                          courtId,
                          slot,
                          match,
                          activeMatch,
                          dragOrigin,
                      }: {
    dateId: string;
    courtId: string;
    slot: SlotCell;
    match: PlanRow | null;
    activeMatch: PlanRow | null;
    dragOrigin: DragOrigin | null;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${dateId}-${courtId}-${slot.slot}`,
        data: { dateId, courtId, slot: slot.slot },
    });

    const isDraggedOrigin =
        !!activeMatch &&
        dragOrigin?.dateId === dateId &&
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
                        <MatchCard match={match} origin={{ dateId, courtId, slot: slot.slot }} />
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
    const [overrides, setOverrides] = useState<Record<string, Record<string, SlotCell[]>> | null>(null);

    const handleTournamentChange = (id: string) => {
        setSelectedTournamentId(id);
        setOverrides(null); // This is the "Reset Pattern"
    };

    // Fetch tournaments for selector
    const { data: tournamentsData, loading: tournamentsLoading } = useQuery(GetTournamentsForSelectorDocument);
    const tournaments = tournamentsData?.tournaments ?? [];

    // Fetch matches for selected tournament
    const { data: matchesData, loading: matchesLoading } = useQuery(GetTournamentMatchesDocument, {
        variables: { tournamentId: selectedTournamentId },
        skip: !selectedTournamentId,
    });

    const selectedTournament = matchesData?.tournament;
    const tournamentDatesFromData = useMemo(() => selectedTournament?.dates ?? [], [selectedTournament?.dates]);

    const algorithms = useMemo(
        () => [
            { id: "simple-seed", name: "Simple seed" },
            { id: "balanced-slots", name: "Balanced slots" },
            { id: "court-rotation", name: "Court rotation" },
        ],
        []
    );

    const slotDefinitions = useMemo(() => ["08:00 - 08:30", "08:30 - 09:00", "09:00 - 09:30", "09:30 - 10:00", "10:00 - 10:30", "10:30 - 11:00"], []);
    const courts = useMemo(() => Array.from(new Set(initialRows.map((row) => row.court))), []);

    const baseDateCourtSlots = useMemo(() => {
        const byDate: Record<string, Record<string, SlotCell[]>> = {};
        if (tournamentDatesFromData.length === 0) return byDate;

        tournamentDatesFromData.forEach((tournamentDate) => {
            const dateId = String(tournamentDate.id);
            byDate[dateId] = {};
            courts.forEach((court) => {
                byDate[dateId][court] = slotDefinitions.map((slot) => ({
                    id: `${dateId}-${court}-${slot}`,
                    slot,
                    match: null,
                }));
            });
        });

        initialRows.forEach((row) => {
            const dateId = String(tournamentDatesFromData[0]?.id);
            if (!dateId) return;
            const court = byDate[dateId]?.[row.court];
            if (!court) return;
            const cell = court.find((slot) => slot.slot === row.slot);
            if (cell) cell.match = row;
        });

        return byDate;
    }, [tournamentDatesFromData, courts, slotDefinitions]);

    const dateCourtSlots = overrides ?? baseDateCourtSlots;

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
        const sourceOrigin = active.data.current?.origin as DragOrigin | undefined;
        const overData = over.data.current as { dateId?: string; courtId?: string; slot?: string } | undefined;

        if (!draggedMatch || !sourceOrigin || !overData?.dateId || !overData?.courtId || !overData?.slot) return;

        setOverrides((current) => {
            // If overrides is null, start with a clone of the base structure
            const next = structuredClone(current ?? baseDateCourtSlots);

            const sourceCell = next[sourceOrigin.dateId]?.[sourceOrigin.courtId]?.find(c => c.slot === sourceOrigin.slot);
            const targetCell = next[overData.dateId!]?.[overData.courtId!]?.find(c => c.slot === overData.slot);

            if (!sourceCell || !targetCell) return current;

            const targetMatch = targetCell.match;
            sourceCell.match = targetMatch ? { ...targetMatch, court: sourceOrigin.courtId, slot: sourceOrigin.slot } : null;
            targetCell.match = { ...draggedMatch, court: overData.courtId!, slot: overData.slot! };

            return next;
        });
    };

    // Group structure by date -> courts
    const groupedByDate = useMemo(() => {
        return tournamentDatesFromData.map((tournamentDate) => {
            const dateId = String(tournamentDate.id);
            // Format date for display
            const date = new Date(tournamentDate.date);
            const displayName = date.toLocaleDateString('da-DK', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            return {
                dateId,
                displayName,
                courts: courts.map((court) => ({
                    court,
                    slots: dateCourtSlots[dateId]?.[court] ?? [],
                })),
            };
        });
    }, [tournamentDatesFromData, dateCourtSlots, courts]);

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
                            onChange={(e) => handleTournamentChange(e.target.value)}
                            className="border rounded p-2"
                            disabled={tournamentsLoading}
                        >
                            <option value="">
                                {tournamentsLoading ? "Indlæser..." : "Vælg turnering"}
                            </option>
                            {tournaments.map((tournament) => (
                                <option key={tournament.id} value={tournament.id}>
                                    {tournament.name} ({tournament.season})
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

            {selectedTournamentId && tournamentDatesFromData.length === 0 && !matchesLoading ? (
                <Card hoverable={false}>
                    <div className="text-center py-8 text-gray-500">
                        <p>Ingen datoer tilknyttet denne turnering.</p>
                        <p className="text-sm mt-2">Tilføj datoer til turneringen for at oprette en kampplan.</p>
                    </div>
                </Card>
            ) : (
                <DndContext
                    id="tournament-dnd-context"
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    autoScroll={{
                        threshold: {
                            x: 0.2,
                            y: 0.2,
                        },
                        acceleration: 5,
                    }}
                >
                    <div className="space-y-8">
                        {groupedByDate.map(({ dateId, displayName, courts }) => (
                            <div key={dateId} className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{displayName}</h2>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {courts.map(({ court, slots }) => (
                                        <Card hoverable={false} key={`${dateId}-${court}`}>
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold">{court}</h3>
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
                                                            dateId={dateId}
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
                            </div>
                        ))}
                    </div>

                    <DragOverlay>
                        {activeMatch && dragOrigin ? (
                            <MatchCard match={activeMatch} origin={dragOrigin} dragging />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}