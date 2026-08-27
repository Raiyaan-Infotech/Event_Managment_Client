'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faImage, faFileImage, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useEventOptions } from '@/hooks/use-client-portal';
import { resolveArtwork } from '@/lib/event-templates';
import { InvitationCard } from '@/components/common/invitation-card';
import { EventQr } from '@/components/common/event-qr';
import {
    downloadNodeAsImage, downloadQrAsPng, fileSlug, type ExportFormat,
} from '@/lib/export-invitation';
import type { ClientEvent } from '@/hooks/use-client-events';

/** What the Download menu can produce. `qr` is the code on its own. */
export type DownloadKind = ExportFormat | 'qr';

/**
 * The Download button and its format menu.
 *
 * A menu rather than a plain button because "download" is genuinely three
 * different things here — a picture of the invitation, an editable vector of
 * it, and the QR on its own — and choosing for the user gets it wrong for two
 * of them.
 *
 * `withQr` is false until the event actually exists: offering a code that has
 * not been issued would hand back a blank square.
 */
export function DownloadMenu({
    busy, onPick, withQr = false, label = 'Download Invitation', variant = 'outline', className,
}: {
    busy: DownloadKind | null;
    onPick: (kind: DownloadKind) => void;
    withQr?: boolean;
    label?: string;
    variant?: 'default' | 'outline';
    className?: string;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant}
                    disabled={!!busy}
                    className={cn('h-10 rounded-md px-4 text-[12.5px] font-semibold', className)}
                >
                    <FontAwesomeIcon icon={faDownload} className="mr-2 !size-[12px]" />
                    {busy ? 'Preparing…' : label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuItem onClick={() => onPick('png')} className="text-[12.5px]">
                    <FontAwesomeIcon icon={faImage} className="mr-2 !size-[12px]" />
                    Download as Image (PNG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPick('svg')} className="text-[12.5px]">
                    <FontAwesomeIcon icon={faFileImage} className="mr-2 !size-[12px]" />
                    Download as SVG
                </DropdownMenuItem>
                {withQr && (
                    <DropdownMenuItem onClick={() => onPick('qr')} className="text-[12.5px]">
                        <FontAwesomeIcon icon={faQrcode} className="mr-2 !size-[12px]" />
                        Download QR Code
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Download control for a SAVED event.
 *
 * ── WHY IT RENDERS A CARD NOBODY SEES ────────────────────────────────────────
 * The exporter rasterises a real DOM node — it cannot draw an invitation from
 * data alone. Pages that only show a thumbnail (the event detail header, a list
 * row) therefore have nothing to capture, so this mounts a full-size
 * `InvitationCard` off-canvas purely as the capture target.
 *
 * Positioned off-screen rather than `display: none` or `visibility: hidden`,
 * deliberately: a hidden element has no layout box, so `html-to-image` measures
 * it as 0x0 and writes a blank file. Off-canvas keeps it laid out and painted
 * while staying out of the way, and `aria-hidden` keeps the duplicate content
 * out of the accessibility tree.
 */
export function InvitationDownload({
    event,
    label,
    variant = 'default',
    className,
}: {
    event: ClientEvent;
    label?: string;
    variant?: 'default' | 'outline';
    className?: string;
}) {
    const { data: opts } = useEventOptions();
    const artwork = resolveArtwork(event.theme_id, opts?.templates);

    const cardRef = useRef<HTMLDivElement>(null);
    const qrRef = useRef<HTMLDivElement>(null);
    const [busy, setBusy] = useState<DownloadKind | null>(null);

    const handle = async (kind: DownloadKind) => {
        if (busy) return;
        const baseName = fileSlug(event.name, 'invitation');

        setBusy(kind);
        try {
            if (kind === 'qr') {
                if (!qrRef.current) throw new Error('The QR code is not ready yet.');
                await downloadQrAsPng(qrRef.current, baseName);
            } else {
                const card = cardRef.current?.querySelector<HTMLElement>('[data-invitation-card]');
                if (!card) throw new Error('There is no invitation to download yet.');
                await downloadNodeAsImage(card, baseName, kind);
            }
            toast.success('Download started.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not download the invitation.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <DownloadMenu
                busy={busy}
                onPick={handle}
                withQr={!!event.qr_token}
                label={label}
                variant={variant}
                className={className}
            />

            {/* Off-canvas capture targets — see the note above on why these are
                positioned away rather than hidden. */}
            <div
                aria-hidden
                className="pointer-events-none fixed left-[-10000px] top-0 opacity-100"
            >
                {artwork.kind === 'template' && (
                    <div ref={cardRef}>
                        <InvitationCard
                            template={artwork.template}
                            componentsOverride={event.components}
                            orderOverride={event.component_order}
                            data={{
                                name: event.name,
                                hostOne: event.host_one,
                                hostTwo: event.host_two,
                                tagline: event.tagline,
                                description: event.description,
                                startDate: event.start_date,
                                startTime: event.start_time,
                                endTime: event.end_time,
                                venueName: event.venue_name,
                                venueAddress: event.venue_address,
                                organizer: event.organizer,
                                contact: event.contact_phone,
                                footerNote: event.footer_note,
                                primaryColor: event.primary_color,
                            }}
                        />
                    </div>
                )}
                <div ref={qrRef}>
                    <EventQr token={event.qr_token} eventName={event.name} size={512} />
                </div>
            </div>
        </>
    );
}
