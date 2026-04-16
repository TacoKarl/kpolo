'use client';

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export type PlanRow = {
    id: string;
    slot: string;
    match: string;
    division: string;
    court: string;
    status: string;
};

export type SlotCell = {
    id: string;
    slot: string;
    match: PlanRow | null;
};

export type DragOrigin = {
    dateId: string;
    courtId: string;
    slot: string;
};

export function MatchCard({ match, origin, dragging = false }: {
    match: PlanRow;
    origin?: DragOrigin;
    dragging?: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: match.id,
        data: { match, origin },
        disabled: dragging,
    });

    const style = {
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : "transform 500ms ease",
        opacity: isDragging ? 0.3 : 1,
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
            <div className="text-[10px] text-gray-500 truncate">{match.division} · {match.status}</div>
        </button>
    );
}

export function SlotCellView({ dateId, courtId, slot, match, activeMatch, dragOrigin }: {
    dateId: string; courtId: string; slot: SlotCell; match: PlanRow | null; activeMatch: PlanRow | null; dragOrigin: DragOrigin | null;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${dateId}-${courtId}-${slot.slot}`,
        data: { dateId, courtId, slot: slot.slot },
    });

    const isDraggedOrigin = !!activeMatch && dragOrigin?.dateId === dateId && dragOrigin?.courtId === courtId && dragOrigin?.slot === slot.slot;

    return (
        <tr>
            <td className="border px-3 py-2 whitespace-nowrap bg-gray-50 text-sm w-32">{slot.slot}</td>
            <td ref={setNodeRef} className={`border px-2 py-2 align-middle transition-colors ${isOver ? "bg-blue-50" : ""}`}>
                <div className="relative w-full h-14.5">
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