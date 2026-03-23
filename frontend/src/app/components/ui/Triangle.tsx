export function Triangle({ isOpen }: { isOpen: boolean }) {
    return (
        <span
            aria-hidden="true"
            className="inline-flex w-5 items-center justify-center text-zinc-700"
        >
      {isOpen ? "▾" : "▸"}
    </span>
    );
}