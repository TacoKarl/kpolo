'use client';

import { useCallback, useEffect, useRef, useState } from "react";

type ToastProps = {
    message: string;
    open: boolean;
    onClose: () => void;
    durationMs?: number;
};

export function Toast({ message, open, onClose, durationMs = 3000 }: ToastProps) {
    const [hovered, setHovered] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
    }, []);

    const startCloseTimer = useCallback(() => {
        clearTimers();
        timeoutRef.current = setTimeout(onClose, durationMs);
    }, [clearTimers, durationMs, onClose]);

    useEffect(() => {
        if (!open || hovered) {
            clearTimers();
            return;
        }
        startCloseTimer();
        return clearTimers;
    }, [open, hovered, startCloseTimer, clearTimers]);

    if (!open) return null;

    return (
        <>
            <div
                role="alert"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={onClose}
                className="fixed bottom-6 right-6 z-50 cursor-pointer rounded border border-green-200 bg-green-50 px-4 py-3 text-green-900 shadow-lg"
                style={{
                    animationName: hovered ? "none" : "toast-fade",
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                    opacity: hovered ? 1 : undefined,
                }}
            >
                <span className="font-medium">{message}</span>
            </div>
            <style jsx>{`
                @keyframes toast-fade {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
}
