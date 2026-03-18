'use client';

import { useState } from "react";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    message: string;
    confirmationLabel?: string;
    expectedText?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open,
    title = "Bekræft",
    message,
    confirmationLabel = "Skriv navnet for at bekræfte",
    expectedText,
    confirmLabel = "Ok",
    cancelLabel = "Afbryd",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [value, setValue] = useState("");
    const normalizedExpected = (expectedText ?? "").trim();
    const isMatch = normalizedExpected.length === 0
        ? true
        : value.trim() === normalizedExpected;

    if (!open) return null;

    const handleClose = () => {
        setValue("");
        onCancel();
    };

    const handleConfirm = () => {
        if (!isMatch) return;
        setValue("");
        onConfirm();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
            <div className="relative z-10 w-full max-w-sm rounded border-2 border-blue-600 p-4 shadow-lg">
                <h4 className="text-lg font-semibold mb-2">{title}</h4>
                <p className="mb-4 text-sm">{message}</p>
                {normalizedExpected.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-lg font-medium mb-1">{confirmationLabel}</label>
                        <input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={normalizedExpected}
                            className="border p-2 rounded w-full"
                        />
                    </div>
                )}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-blue-600 hover:underline"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isMatch}
                        className={`border px-3 py-2 rounded transition ${
                            isMatch
                                ? "bg-red-600 border-red-600 hover:bg-red-700"
                                : "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
