'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faImage, faFileImage, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useEventOptions } from '@/hooks/use-client-portal';
import { resolveArtwork } from '@/lib/event-templates';
import { InvitationCard } from '@/components/common/invitation-card';
import { EventQr } from '@/components/common/event-qr';
import {
    downloadNodeAsImage, downloadQrAsPng, downloadQrAsSvg, fileSlug, type ExportFormat,
} from '@/lib/export-invitation';
import type { ClientEvent } from '@/hooks/use-client-events';

/**
 * What a download control can produce.
 *
 * `qr` stays PNG for backwards compatibility — it was the only QR export there
 * was, and renaming it would silently change what every existing call site
 * asks for.
 */
export type DownloadKind = ExportFormat | 'qr' | 'qr-svg';

/** Which artefact a button downloads. The format is chosen in the dialog. */
export type DownloadTarget = 'invitation' | 'qr';

/** `(target, format)` to the flat kind the handlers already understand. */
export const downloadKind = (target: DownloadTarget, format: ExportFormat): DownloadKind =>
    target === 'qr' ? (format === 'svg' ? 'qr-svg' : 'qr') : format;

const FORMATS: { value: ExportFormat; label: string; hint: string; icon: typeof faImage }[] = [
    {
        value: 'png',
        label: 'PNG image',
        hint: 'Best for sharing and printing. Opens anywhere.',
        icon: faImage,
    },
    {
        value: 'svg',
        label: 'SVG vector',
        hint: 'Scales to any size without blurring. For designers and print shops.',
        icon: faFileImage,
    },
];

/**
 * A download button that asks which format before it downloads.
 *
 * ── WHY A DIALOG AND NOT THE DROPDOWN ────────────────────────────────────────
 * `DownloadMenu` folds the choice into a menu, which is right for a compact
 * toolbar control. On the success screen the download IS the task, and the two
 * formats are not interchangeable — one is a picture, one is a vector — so the
 * choice gets a screen of its own with a sentence explaining each, rather than
 * two near-identical menu rows read at a glance.
 */
export function DownloadFormatButton({
    target,
    label,
    busy,
    onPick,
    icon = faDownload,
    variant = 'outline',
    className,
}: {
    target: DownloadTarget;
    label: string;
    /** The kind currently downloading, so the button can show its own progress. */
    busy: DownloadKind | null;
    onPick: (kind: DownloadKind) => void;
    icon?: typeof faDownload;
    variant?: 'default' | 'outline';
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    // Only THIS button says "Preparing…" — with two of them stacked, keying off
    // `busy` alone would light both up and leave you unsure which one you hit.
    const mine = busy === downloadKind(target, 'png') || busy === downloadKind(target, 'svg');

    return (
        <>
            <Button
                type="button"
                variant={variant}
                disabled={!!busy}
                onClick={() => setOpen(true)}
                className={cn('h-10 w-full rounded-md px-4 text-[12.5px] font-semibold', className)}
            >
                <FontAwesomeIcon icon={icon} className="mr-2 !size-[12px]" />
                {mine ? 'Preparing…' : label}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription>
                            Choose a file format. You can come back and download the other one too.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        {FORMATS.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                onClick={() => {
                                    // Closed first: the download can take a
                                    // moment on a large card, and a dialog
                                    // sitting open over it looks like nothing
                                    // happened.
                                    setOpen(false);
                                    onPick(downloadKind(target, f.value));
                                }}
                                className="flex items-start gap-3 rounded-md border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                            >
                                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted">
                                    <FontAwesomeIcon icon={f.icon} className="!size-[13px] text-foreground/70" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[13px] font-semibold text-foreground">{f.label}</span>
                                    <span className="block text-[11.5px] text-muted-foreground break-words">{f.hint}</span>
                                </span>
                            </button>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="h-9 w-full rounded-md text-[12.5px]"
                    >
                        Cancel
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

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
            if (kind === 'qr' || kind === 'qr-svg') {
                if (!qrRef.current) throw new Error('The QR code is not ready yet.');
                if (kind === 'qr-svg') downloadQrAsSvg(qrRef.current, baseName);
                else await downloadQrAsPng(qrRef.current, baseName);
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
                                // A saved event has its token, so the downloaded
                                // invitation carries the code that actually scans.
                                qrToken: event.qr_token,
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
