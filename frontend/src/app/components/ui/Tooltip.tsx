'use client';

import { useState } from 'react';

type TooltipProps = {
    content: string;
    children: React.ReactNode;
};

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-flex items-center">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="cursor-help"
            >
                {children}
            </div>

            {isVisible && (
                <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform rounded bg-zinc-900 px-3 py-2 text-sm text-white shadow-lg pointer-events-none z-50 max-w-sm wrap-break-word whitespace-normal">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 transform border-4 border-transparent border-t-zinc-900" />
                </div>
            )}
        </div>
    );
}



