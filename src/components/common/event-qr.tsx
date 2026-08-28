'use client';

import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faCopy, faCheck, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

/**
 * Drawn at 4x the displayed size so the downloaded PNG is worth printing.
 * A 200px canvas scaled up on paper is a blurry code that scanners give up on.
 */
const EXPORT_SCALE = 4;

export function EventQr({
    token,
    eventName,
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

    const download = () => {
        // qrcode.react renders a real <canvas>, so the PNG comes straight off it
        // with no second render and no library to serialise SVG.
        const canvas = wrapRef.current?.querySelector('canvas');
        if (!canvas) {
            toast.error('Could not read the QR image.');
            return;
        }
        const link = document.createElement('a');
        const slug = (eventName || 'event')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 60);
        link.download = `${slug || 'event'}-qr.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
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
                <QRCodeCanvas
                    value={token}
                    size={size * EXPORT_SCALE}
                    // Level M keeps the grid readable at ~300 characters without
                    // pushing the version so high that the modules get too fine
                    // to print small.
                    level="M"
                    marginSize={2}
                    // Always black on white regardless of the app theme. A dark
                    // mode QR inverts contrast and scanners reject it.
                    bgColor="#ffffff"
                    fgColor="#000000"
                    style={{ width: size, height: size }}
                />

                {/*
                  The SVG export source.

                  `QRCodeCanvas` above is what the page shows — a canvas prints
                  the modules crisply and reads straight into a PNG. But a
                  canvas cannot become a vector, and "download as SVG" is asked
                  for precisely when the size is not yet known (a banner, a
                  press sheet), so a rasterised SVG would defeat the request.

                  `hidden` is safe HERE, unlike the off-canvas capture targets
                  elsewhere: this is serialised from the DOM, not rasterised, so
                  it never needs a layout box.
                */}
                <span data-qr-svg hidden aria-hidden>
                    <QRCodeSVG
                        value={token}
                        size={size * EXPORT_SCALE}
                        level="M"
                        marginSize={2}
                        bgColor="#ffffff"
                        fgColor="#000000"
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
