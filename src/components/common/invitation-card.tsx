'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faCamera, faShareNodes, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';
import type { TemplateOption } from '@/hooks/use-client-portal';

/**
 * The client's invitation, drawn from an admin template plus their own data.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────────
 * The admin panel has `TemplatePreview`, which renders a template properly:
 * frame artwork, decorations, per-component blocks in `component_order`, and
 * ink chosen by measured contrast. The client portal had a hand-rolled card
 * that drew a background, a name, a date and nothing else — so the SAME
 * template looked like a finished invitation in the admin and like an empty
 * swatch to the client about to approve it.
 *
 * This is the portal's counterpart. Same rendering rules, with one deliberate
 * difference: the admin's version shows SAMPLE content (Rahul & Priya) because
 * a template has no event, whereas this one shows what the client actually
 * typed. Where a field is still blank it falls back to a placeholder, so the
 * card never renders as a hole mid-wizard.
 *
 * The two are separate repos, so this cannot import that component. What it
 * must not do is drift on the RULES — the contrast maths, the frame-replaces-
 * border rule and the decoration placements are copied deliberately and noted
 * as such.
 */

export interface InvitationData {
    name?: string | null;
    /**
     * The two host lines. When both are set the card prints them either side of
     * an ampersand, the way the admin's own preview draws Rahul & Priya; with
     * neither it falls back to the event name, which is what every event
     * created before these fields existed has.
     */
    hostOne?: string | null;
    hostTwo?: string | null;
    tagline?: string | null;
    description?: string | null;
    /** `YYYY-MM-DD`. */
    startDate?: string | null;
    /** `HH:MM` or `HH:MM:SS`. */
    startTime?: string | null;
    endTime?: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
    organizer?: string | null;
    contact?: string | null;
    footerNote?: string | null;
    /** The client's chosen accent, from wizard step 4. */
    primaryColor?: string | null;
    /**
     * The event's `qr_token`, when one has been issued.
     *
     * Absent on a template in the catalogue and on the wizard before step 5 is
     * submitted — there is no event yet, so there is nothing to encode. The card
     * draws a clearly-labelled preview code in that case rather than the generic
     * QR glyph it used to, which made the block read as an icon rather than as
     * the code that will actually be printed there.
     */
    qrToken?: string | null;
}

const COMPONENT_KEYS = [
    'event_title', 'host_names', 'date_time', 'venue', 'event_qr_code', 'organizer',
    'event_photos', 'contact_details', 'invitation_message', 'social_icons',
    'footer_note', 'decoration_elements',
] as const;

type ComponentKey = (typeof COMPONENT_KEYS)[number];

/**
 * What an unissued QR encodes.
 *
 * A REAL matrix, so the design reads truthfully — the old glyph was a picture of
 * a QR code, not one, and it made the block impossible to judge at design time.
 * But it is deliberately readable when scanned: anyone who points a phone at a
 * preview gets this sentence back, not a plausible-looking string of gibberish
 * they might mistake for a working code.
 */
const PREVIEW_QR_VALUE = 'PREVIEW ONLY - this event has no QR code yet';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * `2026-09-30` to its parts, by regex.
 *
 * Never `new Date(value)`: that applies the browser's timezone to a DATEONLY
 * string which never had one, and shows the day before its own date for anyone
 * west of UTC.
 */
const splitDate = (value?: string | null) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
    if (!m) return null;
    return { year: m[1], month: MONTHS[Number(m[2]) - 1] ?? '---', day: m[3] };
};

/** A stored `HH:MM:SS` and a form's `HH:MM` both display as `HH:MM`. */
const hhmm = (value?: string | null) => (value ? String(value).slice(0, 5) : null);

/* ── contrast, mirrored from the admin preview ───────────────────────────── */

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const hex = (value: string | null | undefined, fallback: string) =>
    value && HEX.test(value) ? value : fallback;

const rgbTriple = (value: string | null | undefined): [number, number, number] | null => {
    const m = /^#([0-9a-fA-F]{6})$/.exec(String(value ?? '').trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const hexToRgbString = (value: string | null | undefined): string | null => {
    const t = rgbTriple(value);
    return t ? t.join(',') : null;
};

/** WCAG relative luminance — gamma-correct, so mid-blues are judged properly. */
const luminance = ([r, g, b]: [number, number, number]): number => {
    const f = (c: number) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrastRatio = (a: [number, number, number], b: [number, number, number]) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

/** Alpha-composite `fg` over `bg`, exactly as the overlay layer paints. */
const composite = (
    fg: [number, number, number],
    bg: [number, number, number],
    alpha: number
): [number, number, number] =>
    [0, 1, 2].map((i) => Math.round(fg[i] * alpha + bg[i] * (1 - alpha))) as [number, number, number];

const rgbToHsl = ([r, g, b]: [number, number, number]): [number, number, number] => {
    const R = r / 255, G = g / 255, B = b / 255;
    const max = Math.max(R, G, B), min = Math.min(R, G, B);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === R ? ((G - B) / d + (G < B ? 6 : 0)) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    return [h / 6, s, l];
};

const hslToRgb = ([h, s, l]: [number, number, number]): [number, number, number] => {
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t: number) => {
        let T = t; if (T < 0) T += 1; if (T > 1) T -= 1;
        if (T < 1 / 6) return p + (q - p) * 6 * T;
        if (T < 1 / 2) return q;
        if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
        return p;
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255)) as [number, number, number];
};

/**
 * The accent, nudged only as far as legibility demands.
 *
 * HUE AND SATURATION ARE PRESERVED — only lightness moves, and only until the
 * target is met, so the result still reads as the colour that was chosen rather
 * than a computed replacement.
 */
const readableOn = (
    colour: [number, number, number],
    backdrop: [number, number, number],
    target = 4.5
): [number, number, number] => {
    if (contrastRatio(colour, backdrop) >= target) return colour;
    const [h, sat] = rgbToHsl(colour);
    let best = colour;
    let bestRatio = contrastRatio(colour, backdrop);
    for (let step = 1; step <= 20; step += 1) {
        for (const l of [0.5 - step * 0.025, 0.5 + step * 0.025]) {
            if (l < 0 || l > 1) continue;
            const candidate = hslToRgb([h, sat, l]);
            const ratio = contrastRatio(candidate, backdrop);
            if (ratio >= target) return candidate;
            if (ratio > bestRatio) { bestRatio = ratio; best = candidate; }
        }
    }
    return best;
};

const INK_DARK: [number, number, number] = [58, 44, 34];
const INK_LIGHT: [number, number, number] = [247, 242, 234];
const toHexString = ([r, g, b]: [number, number, number]) =>
    `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;

/** CSS angle for each stored gradient direction. Matches the backend's table. */
const GRADIENT_DEG: Record<string, number> = {
    top: 0, 'top-right': 45, right: 90, 'bottom-right': 135,
    bottom: 180, 'bottom-left': 225, left: 270, 'top-left': 315,
};

function backgroundStyle(t: TemplateOption): React.CSSProperties {
    const primary = hex(t.background_color, '#FFF7F0');

    // `custom` paints the uploaded design too — the Custom tab's upload writes
    // the same `background_image` column, masked to a shape.
    if ((t.background_type === 'image' || t.background_type === 'custom') && t.background_image) {
        const isCustom = t.background_type === 'custom';
        const position = isCustom ? t.background_position : t.image_position;
        const size = isCustom && Number(t.image_size) && Number(t.image_size) !== 100
            ? `${Number(t.image_size)}%`
            : (t.image_scale ?? 'cover');
        return {
            backgroundImage: `url(${t.background_image})`,
            backgroundSize: size,
            backgroundPosition: (position ?? 'center').replace(/-/g, ' '),
            backgroundRepeat: 'no-repeat',
        };
    }

    if (t.background_type === 'gradient') {
        const from = hex(t.gradient_from, primary);
        const to = hex(t.gradient_to, hex(t.secondary_color, '#F3E8DA'));
        // The third stop is omitted entirely when unset — a two-stop gradient
        // and one whose middle repeats an end are not the same picture.
        const stops = [from, t.gradient_via ? hex(t.gradient_via, from) : null, to].filter(Boolean).join(', ');
        if (t.gradient_type === 'radial') {
            // `circle at center`, not the default ellipse, which would stretch
            // with the card and look like a different gradient per orientation.
            return { backgroundImage: `radial-gradient(circle at center, ${stops})` };
        }
        const deg = GRADIENT_DEG[t.gradient_direction ?? 'bottom'] ?? 180;
        return { backgroundImage: `linear-gradient(${deg}deg, ${stops})` };
    }

    return { backgroundColor: primary };
}

/** The Custom background's shape mask. Only applies to `custom`. */
function shapeStyle(t: TemplateOption): React.CSSProperties {
    if (t.background_type !== 'custom') return {};
    const radius = `${Math.min(Math.max(Number(t.corner_radius) || 0, 0), 100) / 2}%`;
    switch (t.image_shape) {
        case 'circle': return { borderRadius: '50%' };
        // Arch as a border-radius, not a clip-path, so frame artwork drawn on
        // top follows the same silhouette instead of disagreeing at the curve.
        case 'arch': return { borderRadius: `999px 999px ${radius} ${radius}` };
        case 'square':
        case 'rectangle':
        default: return { borderRadius: radius };
    }
}

const BORDER_CLASS: Record<string, string> = {
    ornate: 'rounded-md border-[3px] border-double',
    corners: 'rounded-none border-2',
    arch: 'rounded-t-[999px] rounded-b-md border-2',
    'floral-top': 'rounded-md border-t-4 border-x border-b',
    none: 'border-0',
};

const normaliseOrder = (order?: string[] | null): ComponentKey[] => {
    const given = (order ?? []).filter((k): k is ComponentKey =>
        (COMPONENT_KEYS as readonly string[]).includes(k));
    // Anything the stored order omits is appended, so a template saved before a
    // component existed still renders it rather than dropping it silently.
    return [...given, ...COMPONENT_KEYS.filter((k) => !given.includes(k))];
};

export function InvitationCard({
    template,
    data,
    componentsOverride,
    orderOverride,
    className,
}: {
    template: TemplateOption;
    data: InvitationData;
    /**
     * The client's per-event override of which components show, and in what
     * order. Undefined or null means "inherit from the template" — which is
     * what every event that has never been customised means.
     */
    componentsOverride?: Record<string, number | boolean> | null;
    orderOverride?: string[] | null;
    className?: string;
}) {
    /**
     * Scale the invitation down until it fits.
     *
     * A real invitation is a fixed canvas and everything on it is sized against
     * that canvas. Laying twelve components out at fixed sizes inside a small
     * card overflows equally top and bottom — the invite line disappears off the
     * top, the footer off the bottom, and the frame's rule appears to cut
     * through the text. A transform does not affect layout, so `scrollHeight`
     * stays the UNSCALED height and the measurement cannot feed back into itself.
     */
    const boxRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const [fit, setFit] = useState(1);

    // The event's own order when it has one, the template's otherwise.
    const order = normaliseOrder(orderOverride?.length ? orderOverride : template.component_order);

    /**
     * Whether a component shows.
     *
     * The event's override wins outright when present — it is the client's
     * decision for this one invitation. With no override the template decides,
     * which keeps an uncustomised event following the design as the admin edits
     * it. Absent means on in both cases: a key that was never stored is not the
     * same as one deliberately switched off.
     */
    const on = (key: ComponentKey) => {
        const source = componentsOverride ?? template.components;
        const v = source?.[key];
        return v === undefined || !!Number(v);
    };

    const headingFont = template.primary_font || 'Playfair Display';
    const bodyFont = template.secondary_font || 'Poppins';
    const frameUrl = template.frame_url || null;
    // Real artwork wins over the CSS fallback — drawing both gives a double edge.
    const borderClass = frameUrl ? 'border-0' : (BORDER_CLASS[template.border_style ?? 'none'] ?? 'border-0');

    const decorations = template.decorationItems ?? [];
    const placed = (type: string) => decorations.filter((d) => d.type === type && d.file_url);

    const hasTopArt = placed('top').length > 0 || placed('corner').length > 0;
    const hasBottomArt = placed('bottom').length > 0 || placed('corner').length > 0;

    /**
     * The safe area, as a PERCENTAGE of the card.
     *
     * Applied by absolute insets, not padding: CSS percentage padding resolves
     * against the containing block's WIDTH on all four sides, so `padding-top:
     * 8%` on a 9:16 card is 8% of the width — about half what it should be.
     */
    const safeX = frameUrl ? 11 : 6;
    const safeTop = Math.max(frameUrl ? 9 : 4, hasTopArt ? 10 : 0);
    const safeBottom = Math.max(frameUrl ? 9 : 4, hasBottomArt ? 10 : 0);

    const overlay = Math.min(Math.max(Number(template.overlay_opacity) || 0, 0), 100) / 100;
    const overlayTint = hexToRgbString(template.overlay_color) ?? '0,0,0';
    const overlayDrawn = overlay > 0;

    /** The backdrop the text actually sits on, so the ink can be derived. */
    const backdrop = ((): [number, number, number] => {
        const base = rgbTriple(hex(template.background_color, '#FFF7F0')) ?? [255, 247, 240];
        if (template.background_type === 'gradient') {
            const stops = [template.gradient_from, template.gradient_via, template.gradient_to]
                .map((c) => rgbTriple(c ?? null))
                .filter(Boolean) as [number, number, number][];
            if (stops.length) {
                return [0, 1, 2].map((i) =>
                    Math.round(stops.reduce((sum, st) => sum + st[i], 0) / stops.length)
                ) as [number, number, number];
            }
        }
        // For a photo the pixels are unknowable; assume a mid tone so the
        // decision falls to the overlay, which exists for exactly that.
        if ((template.background_type === 'image' || template.background_type === 'custom') && template.background_image) {
            return template.background_color ? base : [128, 128, 128];
        }
        return base;
    })();

    const tintTriple = overlayTint.split(',').map(Number) as [number, number, number];
    const effective = overlayDrawn ? composite(tintTriple, backdrop, overlay) : backdrop;

    // Compared, not thresholded: a threshold gets mid-tones wrong in both
    // directions, picking light ink where dark would have contrasted more.
    const ink = toHexString(
        [INK_DARK, INK_LIGHT]
            .map((candidate) => ({ candidate, ratio: contrastRatio(candidate, effective) }))
            .sort((a, b) => b.ratio - a.ratio)[0].candidate
    );

    const accent = hex(template.secondary_color, '#8A6A3B');
    const accentRgb = rgbTriple(accent) ?? [138, 106, 59];
    // Anything carrying WORDS has to be readable before it is on-brand.
    const accentInk = toHexString(readableOn(accentRgb, effective));
    // Small strokes need to be seen, not read — 3:1, the non-text WCAG bar.
    const accentLine = toHexString(readableOn(accentRgb, effective, 3));

    /**
     * The client's own accent, used for the event name.
     *
     * Held to the same legibility floor as everything else: it is picked from a
     * swatch row with no knowledge of the template behind it, so a mid-tone pick
     * on a mid-tone design would otherwise vanish.
     */
    const nameColour = data.primaryColor && rgbTriple(data.primaryColor)
        ? toHexString(readableOn(rgbTriple(data.primaryColor)!, effective))
        : ink;

    const date = splitDate(data.startDate);
    const start = hhmm(data.startTime);
    const end = hhmm(data.endTime);

    const blocks: Record<ComponentKey, React.ReactNode> = {
        event_title: (
            <div className="text-center">
                <div className="text-[8px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: accentInk, fontFamily: bodyFont }}>
                    You&rsquo;re invited to
                </div>
            </div>
        ),
        host_names: (
            <div className="text-center leading-tight" style={{ fontFamily: headingFont }}>
                {/* Two hosts print on their own lines round an ampersand, as the
                    admin preview draws them. With neither filled in, the event
                    name stands in — which is all an older event has. */}
                {data.hostOne || data.hostTwo ? (
                    <>
                        <div className="text-[20px] font-bold italic break-words" style={{ color: nameColour }}>
                            {data.hostOne || data.hostTwo}
                        </div>
                        {data.hostOne && data.hostTwo && (
                            <>
                                <div className="my-0.5 text-[10px]" style={{ color: accentInk }}>&amp;</div>
                                <div className="text-[20px] font-bold italic break-words" style={{ color: nameColour }}>
                                    {data.hostTwo}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-[22px] font-bold italic break-words" style={{ color: nameColour }}>
                        {data.name || 'Your Event Name'}
                    </div>
                )}
                {data.tagline && (
                    <div className="mt-1 text-[8.5px] break-words" style={{ color: ink, opacity: 0.8, fontFamily: bodyFont }}>
                        {data.tagline}
                    </div>
                )}
            </div>
        ),
        date_time: (
            <div className="text-center" style={{ fontFamily: bodyFont, color: ink }}>
                <div className="text-[11px] font-bold tracking-[0.14em]">
                    {date ? `${date.day} · ${date.month} · ${date.year}` : '-- · --- · ----'}
                </div>
                <div className="text-[8px] tracking-[0.12em] opacity-80">
                    {start || '--:--'} &ndash; {end || '--:--'}
                </div>
            </div>
        ),
        venue: (
            <div className="text-center" style={{ fontFamily: bodyFont, color: ink }}>
                <div className="text-[10px] font-semibold break-words">{data.venueName || 'Venue to be confirmed'}</div>
                {data.venueAddress && (
                    <div className="flex items-center justify-center gap-1 text-[8px] opacity-80">
                        <FontAwesomeIcon icon={faLocationDot} className="!size-[8px]" />
                        <span className="break-words">{data.venueAddress}</span>
                    </div>
                )}
            </div>
        ),
        event_qr_code: (
            <div className="flex flex-col items-center gap-0.5">
                {/*
                  The real code, drawn as a real QR.

                  SVG rather than canvas: the card is scaled by a transform to
                  fit its box and exported at 3x for print, and a vector survives
                  both. A canvas would be resampled twice.

                  Black on white regardless of the invitation's palette, and it
                  keeps its own white tile on a dark design — an inverted or
                  tinted QR is rejected by most scanners, so this is the one
                  element that does NOT follow the template's colours.
                */}
                <div className="flex h-14 w-14 items-center justify-center rounded-sm border bg-white"
                    style={{ borderColor: accentLine }}>
                    <QRCodeSVG
                        value={data.qrToken || PREVIEW_QR_VALUE}
                        size={56}
                        level="M"
                        // The quiet zone belongs INSIDE the code, not as CSS
                        // padding around it: measured in modules it scales with
                        // the code, so it stays correct at any printed size.
                        // A QR flush to its own edge scans poorly.
                        marginSize={2}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                <div className="rounded-sm border px-1.5 py-px text-[6px] font-semibold"
                    style={{ borderColor: accentLine, color: accentInk, fontFamily: bodyFont }}>
                    Event QR Code
                </div>
            </div>
        ),
        organizer: (
            <div className="text-center text-[8px] opacity-80" style={{ fontFamily: bodyFont, color: ink }}>
                {data.organizer || 'Hosted by the family'}
            </div>
        ),
        event_photos: (
            <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                    <span key={i} className="flex h-7 w-7 items-center justify-center rounded-sm border bg-white/60"
                        style={{ borderColor: accentLine }}>
                        <FontAwesomeIcon icon={faCamera} className="!size-[10px]" style={{ color: accentLine }} />
                    </span>
                ))}
            </div>
        ),
        contact_details: (
            <div className="flex items-center justify-center gap-1 text-[8px] opacity-80"
                style={{ fontFamily: bodyFont, color: ink }}>
                <FontAwesomeIcon icon={faPhone} className="!size-[8px]" />
                {data.contact || '+91 00000 00000'}
            </div>
        ),
        invitation_message: (
            <div className="px-3 text-center text-[8px] italic leading-snug opacity-90 break-words"
                style={{ fontFamily: bodyFont, color: ink }}>
                {data.description || 'Together with our families, we request the honour of your presence.'}
            </div>
        ),
        social_icons: (
            <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <span key={i} className="flex h-4 w-4 items-center justify-center rounded-full border"
                        style={{ borderColor: accentLine }}>
                        <FontAwesomeIcon icon={faShareNodes} className="!size-[7px]" style={{ color: accentLine }} />
                    </span>
                ))}
            </div>
        ),
        footer_note: (
            <div className="text-center text-[7px] tracking-wide opacity-70 break-words"
                style={{ fontFamily: bodyFont, color: ink }}>
                {data.footerNote || 'Thank you for being part of our story.'}
            </div>
        ),
        decoration_elements: (
            <div className="flex items-center justify-center gap-1.5" style={{ color: accentLine }}>
                <FontAwesomeIcon icon={faWandMagicSparkles} className="!size-[10px]" />
                <span className="h-px w-8" style={{ backgroundColor: accentLine }} />
                <FontAwesomeIcon icon={faWandMagicSparkles} className="!size-[10px]" />
            </div>
        ),
    };

    const visible = order.filter(on);
    // Extracted so the dependency array stays statically checkable.
    const visibleKey = visible.join(',');

    useLayoutEffect(() => {
        const box = boxRef.current;
        const content = contentRef.current;
        if (!box || !content) return;

        const measure = () => {
            const availH = box.clientHeight;
            const availW = box.clientWidth;
            const naturalH = content.scrollHeight;
            const naturalW = content.scrollWidth;
            if (!availH || !naturalH) return;
            const ratio = Math.min(availH / naturalH, availW / naturalW, 1);
            // Never shrink past legibility — below this the honest answer is
            // that too much is switched on.
            setFit(Math.max(ratio, 0.45));
        };

        measure();
        // Cannot loop: a CSS transform changes no layout box, so applying the
        // scale produces no resize notification.
        const ro = new ResizeObserver(measure);
        ro.observe(box);
        ro.observe(content);
        return () => ro.disconnect();
    }, [visibleKey, template.orientation, template.primary_font, template.secondary_font, safeX, safeTop, safeBottom]);

    return (
        <div
            data-invitation-card
            className={cn(
                'relative overflow-hidden shadow-md',
                template.orientation === 'landscape' ? 'aspect-[16/10] w-full max-w-[420px]' : 'aspect-[9/16] w-[248px]',
                borderClass,
                template.border_style && template.border_style !== 'none' && !frameUrl ? 'border-solid' : '',
                className
            )}
            style={{ ...backgroundStyle(template), ...shapeStyle(template), borderColor: accent }}
        >
            {overlayDrawn && (
                <div className="pointer-events-none absolute inset-0"
                    style={{ backgroundColor: `rgba(${overlayTint},${overlay})` }} />
            )}

            {/* Decorations sit UNDER the content: an ornament covering the
                couple's names is not a decoration. */}
            {placed('motif').slice(0, 1).map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.id} src={d.file_url!} alt=""
                    className="pointer-events-none absolute left-1/2 top-1/2 w-2/3 -translate-x-1/2 -translate-y-1/2 opacity-20" />
            ))}
            {placed('top').slice(0, 1).map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.id} src={d.file_url!} alt="" className="pointer-events-none absolute inset-x-0 top-0 w-full" />
            ))}
            {placed('bottom').slice(0, 1).map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.id} src={d.file_url!} alt="" className="pointer-events-none absolute inset-x-0 bottom-0 w-full" />
            ))}
            {/* One uploaded corner, mirrored into all four. */}
            {placed('corner').slice(0, 1).map((d) =>
                (['left-0 top-0', 'right-0 top-0 -scale-x-100', 'left-0 bottom-0 -scale-y-100', 'right-0 bottom-0 -scale-100'] as const).map((pos) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={`${d.id}-${pos}`} src={d.file_url!} alt=""
                        className={cn('pointer-events-none absolute w-2/5', pos)} />
                ))
            )}
            {placed('ornament').slice(0, 1).map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.id} src={d.file_url!} alt=""
                    className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-3/5" />
            ))}
            {/* A divider is a short centred rule — stretched edge to edge its end
                ornaments land out at the margins and read as two stray shapes. */}
            {placed('divider').slice(0, 1).map((d) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={d.id} src={d.file_url!} alt=""
                    className="pointer-events-none absolute left-1/2 top-1/2 w-2/5 -translate-x-1/2 -translate-y-1/2 opacity-70" />
            ))}

            {/* The frame is drawn LAST, over the content: it occupies the margin,
                and a border under the text would be half-hidden by whatever
                component reaches the edge. */}
            {frameUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={frameUrl} alt="" className="pointer-events-none absolute inset-0 z-10 h-full w-full object-fill" />
            )}

            <div
                ref={boxRef}
                className="absolute flex items-center justify-center overflow-hidden"
                style={{ left: `${safeX}%`, right: `${safeX}%`, top: `${safeTop}%`, bottom: `${safeBottom}%` }}
            >
                <div
                    ref={contentRef}
                    className="flex w-full flex-col items-center justify-center gap-1.5"
                    style={{ transform: `scale(${fit})`, transformOrigin: 'center center' }}
                >
                    {visible.length === 0 ? (
                        <div className="px-4 text-center text-[10px]" style={{ color: ink }}>
                            This template has every component switched off.
                        </div>
                    ) : (
                        visible.map((key) => <div key={key}>{blocks[key]}</div>)
                    )}
                </div>
            </div>
        </div>
    );
}
