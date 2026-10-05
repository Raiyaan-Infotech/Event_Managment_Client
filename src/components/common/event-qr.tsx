'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCopy, faCheck, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { downloadQrAsPng } from '@/lib/export-invitation';
import { StyledQrSvg, toQrStyle } from '@/components/common/styled-qr';

/**
 * An event's QR code.
 *
 * ── WHAT IS IN THE IMAGE ─────────────────────────────────────────────────────
 * The encrypted token, verbatim — not a URL, and not the event's details. Point
 * any ordinary scanner at it and you get an opaque string beginning `EVQ1.`;
 * nothing about the event, the client or the tenant is readable from it. Only
 * the backend holds the key, so only `POST /client/events/qr/decode` can turn
 * it back into event details.
 *
 * That is what makes it safe to print on an invitation that will be passed
 * around and photographed.
 *
 * ── WHY THE IMAGE IS DRAWN HERE AND NOT ON THE SERVER ────────────────────────
 * The backend returns the token; this draws it. A server-side renderer would
 * mean a new production dependency and an image round trip for something the
 * browser does in a millisecond from a string it already has.
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface EventQrProps {
    /** The `qr_token` from the event row. */
    token: string | null | undefined;
    /** Used only to name the downloaded file. */
    eventName?: string | null;
    /** The event's `qr_style` (0 classic, 1 rounded, 2 heart). */
    qrStyle?: number | null;
    /** Rendered size in CSS pixels. */
    size?: number;
    /** Show the Download / Copy buttons. */
    actions?: boolean;
    /**
     * Show the card's own Download button.
     *
     * Off where the screen already offers a dedicated download control — two
     * buttons a few pixels apart that download the same file, one of which
     * asks for a format and one of which does not, reads as a bug. Copy code
     * has no such twin and stays.
     */
    showDownload?: boolean;
    className?: string;
}

export function EventQr({
    token,
    eventName,
    qrStyle,
    size = 180,
    actions = true,
    showDownload = true,
    className,
}: EventQrProps) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    // An event created before the QR columns existed, or one whose creation
    // half-failed, has no token. Say so rather than rendering an empty square
    // that looks like a broken image.
    if (!token) {
        return (
            <div
                className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-6 text-center',
                    className
                )}
                style={{ width: size, height: size }}
            >
                <FontAwesomeIcon icon={faQrcode} className="!size-[22px] text-muted-foreground/50" />
                <p className="text-[11px] text-muted-foreground">No QR code yet</p>
            </div>
        );
    }

    const download = async () => {
        if (!wrapRef.current) return;
        const slug = (eventName || 'event')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 60);
        try {
            await downloadQrAsPng(wrapRef.current, slug || 'event');
        } catch {
            toast.error('Could not read the QR image.');
        }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            toast.success('QR code copied');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard access is denied outside a secure context, which
            // includes plain-http staging — a silent no-op would read as a bug.
            toast.error('Could not copy. Your browser blocked clipboard access.');
        }
    };

    return (
        <div className={cn('flex flex-col items-center gap-3', className)}>
            <div ref={wrapRef} className="rounded-md border border-border bg-white p-3">
                {/*
                  One vector code, in the host's chosen style. It is both what
                  the page shows and the export source (`data-qr-svg`): the SVG
                  download serialises it as-is, and the PNG download rasterises
                  it at export size, so neither goes blurry when printed.
                */}
                <span data-qr-svg className="block">
                    <StyledQrSvg
                        value={token}
                        size={size}
                        qrStyle={toQrStyle(qrStyle)}
                        // Level M keeps the grid readable at ~300 characters without
                        // pushing the version so high that the modules get too fine
                        // to print small.
                        level="M"
                        marginSize={2}
                        style={{ width: size, height: size, display: 'block' }}
                    />
                </span>
            </div>

            {actions && (
                <div className="flex items-center gap-2">
                    {showDownload && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={download}
                            className="h-8 rounded-md px-3 text-[12px] font-medium"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-1.5 !size-[11px]" />
                            Download
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copy}
                        className="h-8 rounded-md px-3 text-[12px] font-medium"
                    >
                        <FontAwesomeIcon
                            icon={copied ? faCheck : faCopy}
                            className={cn('mr-1.5 !size-[11px]', copied && 'text-success')}
                        />
                        {copied ? 'Copied' : 'Copy code'}
                    </Button>
                </div>
            )}
        </div>
    );
}
