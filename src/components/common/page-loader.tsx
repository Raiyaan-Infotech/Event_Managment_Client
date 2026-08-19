"use client";

import { cn } from "@/lib/utils";

/**
 * The one loading visual for the whole app. Everything that needs to say
 * "working" uses this, so loading never looks different from page to page.
 */
export function PageLoader({
    open = true,
    text = "Loading...",
    className,
}: {
    open?: boolean;
    text?: string;
    className?: string;
}) {
    if (!open) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className={cn(
                "fixed inset-0 z-[9999] grid place-items-center bg-background/70 backdrop-blur-[2px]",
                className
            )}
        >
            <div className="flex flex-col items-center gap-3">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
                <span className="text-[12.5px] font-medium text-muted-foreground">{text}</span>
            </div>
            <span className="sr-only">{text}</span>
        </div>
    );
}
