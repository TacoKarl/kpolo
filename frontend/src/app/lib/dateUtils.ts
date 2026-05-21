export type DateLike = string | Date | number | null | undefined;

export function parseDateLike(value: DateLike): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "number") {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (!value) return null;

    const trimmed = value.trim();

    // GraphQL currently returns some match_date values as epoch strings (e.g. "1726300800000").
    if (/^\d{10,13}$/.test(trimmed)) {
        const epoch = Number(trimmed);
        const millis = trimmed.length === 10 ? epoch * 1000 : epoch;
        const epochDate = new Date(millis);
        return Number.isNaN(epochDate.getTime()) ? null : epochDate;
    }

    const direct = new Date(trimmed);
    if (!Number.isNaN(direct.getTime())) return direct;

    // Handle date-only strings explicitly so we do not depend on browser parsing quirks.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const dateOnly = new Date(`${trimmed}T12:00:00`);
        return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
    }

    return null;
}

export function toDateKey(value: DateLike): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        const dateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) return dateMatch[1];
    }

    const date = parseDateLike(value);
    return date ? date.toISOString().slice(0, 10) : null;
}

export function matchDateToSlot(matchDate: DateLike): string | null {
    if (typeof matchDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(matchDate.trim())) {
        return null;
    }

    const d = parseDateLike(matchDate);
    if (!d) return null;

    const start = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    const endD = new Date(d.getTime() + 30 * 60000);
    const end = `${String(endD.getUTCHours()).padStart(2, "0")}:${String(endD.getUTCMinutes()).padStart(2, "0")}`;

    return `${start} - ${end}`;
}

export function formatDateHeading(value: DateLike): string {
    const dateKey = toDateKey(value);
    if (!dateKey) return "Ugyldig dato";

    const date = parseDateLike(`${dateKey}T12:00:00`);
    return date
        ? date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })
        : "Ugyldig dato";
}

export function toDateInputValue(value: DateLike): string {
    return toDateKey(value) ?? "";
}

