'use client';

import { cn } from '@/lib/utils';
import { useEventOptions } from '@/hooks/use-client-portal';
import { resolveArtwork, templateBackground } from '@/lib/event-templates';

/**
 * An event's invitation artwork, as shown in the My Events rows, the dashboard
 * cards and the event detail header.
 *
 * There is no artwork upload in this system, so this is not a placeholder for a
 * missing image — it IS the artwork, drawn from the template and primary colour
 * the client chose in wizard step 4. It is a miniature of the same invitation
 * the wizard previews on step 5, which is why the two look related.
 *
 * ── IT SIZES ITSELF TO ITS CONTAINER ─────────────────────────────────────────
 * This is drawn at four very different sizes: 52x72 in the guest picker, 74x104
 * in a My Events row, a full-width 16/10 card on the dashboard, and 200px tall
 * on the detail page. It used to hardcode 6.5px and 8.5px type for the smallest
 * of those, so the 200px card rendered two specks of text floating in an empty
 * rectangle — technically correct and visibly broken.
 *
 * Everything is now expressed in `cqw` (percent of the container's own width),
 * so one component fills all four boxes properly. `@container` on the wrapper
 * is what those units resolve against.
 *
 * The extra lines — date, venue — appear only once there is room for them
 * (`@[150px]`), because a 52px tile with five lines of text is a grey smudge.
 * The same reason the wizard's own preview curates components rather than
 * showing all twelve.
 *
 * ── TWO CATALOGUES, ONE COLUMN ───────────────────────────────────────────────
 * `events.theme_id` holds either an ADMIN template code or one of the built-in
 * theme ids from before that catalogue existed, and the row does not say which.
 * `resolveArtwork` tries the admin list first and falls back — so an event made
 * last month keeps exactly the artwork it had, and one made today shows the
 * admin's design.
 *
 * The admin list comes from `/client/event-options`, which the wizard already
 * fetches; this shares that cache rather than adding a request per thumbnail.
 *
 * ── THE INK ──────────────────────────────────────────────────────────────────
 * The first version printed dark text on the swatch unconditionally, so
 * near-black designs rendered as blank rectangles — the text was there, drawn in
 * slate on slate. `dark` now decides the ink, and for an admin template it is
 * COMPUTED from the actual background colour, so a template the admin recolours
 * stays legible with nobody remembering to flip a flag.
 */

interface EventThumbnailProps {
    themeId: string | null | undefined;
    /** Drawn under the "You're invited" line. Falls back to nothing. */
    name?: string | null;
    /** The event's chosen accent, used for the name. */
    primaryColor?: string | null;
    /** `YYYY-MM-DD`. Shown only when the tile is wide enough to carry it. */
    startDate?: string | null;
    /** Shown under the date, at the largest sizes only. */
    venueName?: string | null;
    className?: string;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * `2026-09-30` to `30 · SEP · 2026`, without constructing a Date.
 *
 * Parsing a DATEONLY string into a Date applies the browser's timezone to a
 * value that never had one, which is how an event shows the day before its own
 * date for anyone west of UTC.
 */
const formatDate = (value?: string | null) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
    if (!m) return null;
    const month = MONTHS[Number(m[2]) - 1];
    if (!month) return null;
    return `${m[3]} · ${month} · ${m[1]}`;
};

export function EventThumbnail({
    themeId,
    name,
    primaryColor,
    startDate,
    venueName,
    className,
}: EventThumbnailProps) {
    const { data: opts } = useEventOptions();
    const artwork = resolveArtwork(themeId, opts?.templates);
    const dark = artwork.dark;

    const isTemplate = artwork.kind === 'template';
    const date = formatDate(startDate);

    /**
     * Whether the TEMPLATE enables a given component.
     *
     * The template is the authority on what an invitation carries — the admin
     * curated it in wizard step 3, and several of the premium designs
     * deliberately switch the QR, the message or the organiser off. This tile is
     * a miniature of that invitation, so it must not show a line the design
     * itself suppresses.
     *
     * Absent means "on", matching how the admin's own preview reads the map: a
     * key a template never stored is not the same as one deliberately turned
     * off. A legacy theme has no map at all, so everything shows.
     */
    const shows = (key: string) => {
        if (artwork.kind !== 'template') return true;
        const value = artwork.template.components?.[key];
        return value === undefined || !!Number(value);
    };

    return (
        <div
            className={cn(
                '@container relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-md border text-center',
                !isTemplate && 'bg-gradient-to-br',
                !isTemplate && artwork.theme.swatch,
                // The border has to flip too — a light hairline round a near-black
                // card reads as a stray outline, and a dark one round a pale card
                // is invisible.
                dark ? 'border-white/15' : 'border-black/10',
                className
            )}
            style={isTemplate ? templateBackground(artwork.template) : undefined}
            aria-hidden
        >
            {/* An admin template can carry its own gallery image. Drawn beneath
                the text rather than instead of it, so the event name is still
                readable on a busy photo. */}
            {isTemplate && artwork.template.thumbnail && (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={artwork.template.thumbnail}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-black/35" />
                </>
            )}

            {/* A hairline rule inset from the edge, the way every one of the
                premium templates carries a frame. Only at sizes where it reads
                as a frame rather than as a second border. */}
            <span
                className={cn(
                    'pointer-events-none absolute hidden rounded-[2px] border @[150px]:block',
                    dark ? 'border-white/25' : 'border-black/15'
                )}
                style={{ inset: '6cqw' }}
            />

            {/* `event_title` — the invite line. */}
            {shows('event_title') && (
                <span
                    className={cn(
                        'relative font-semibold uppercase leading-none',
                        dark ? 'text-white/70' : 'text-black/50'
                    )}
                    // Floors keep the smallest tile legible; the ceiling stops the
                    // full-width dashboard card from turning into a poster.
                    style={{ fontSize: 'clamp(6px, 3.4cqw, 11px)', letterSpacing: '0.16em' }}
                >
                    You&rsquo;re invited
                </span>
            )}

            {/* `host_names` — the event's own name stands in for the couple. */}
            {name && shows('host_names') && (
                <span
                    className={cn(
                        // line-clamp, not truncate: the tile is fixed-height, so a
                        // long name must wrap and stop, never clip mid-word.
                        'relative line-clamp-2 font-bold leading-tight break-words',
                        dark ? 'text-white/90' : 'text-black/70'
                    )}
                    style={{
                        fontSize: 'clamp(8px, 6.4cqw, 26px)',
                        marginTop: '2.5cqw',
                        // The accent is only trusted on light backgrounds. Several
                        // designs are too dark for a mid-tone accent to read
                        // against, so dark ones keep the plain light ink above.
                        ...(primaryColor && !dark ? { color: primaryColor } : {}),
                    }}
                >
                    {name}
                </span>
            )}

            <span
                className={cn('relative', dark ? 'bg-white/25' : 'bg-black/15')}
                style={{ marginTop: '3cqw', height: '1px', width: '14cqw' }}
            />

            {/* `date_time` and `venue`.
                Two gates, and both must pass: the TEMPLATE has to enable the
                component, and the tile has to be wide enough to carry it. On a
                52px guest-picker tile these would be an unreadable smudge rather
                than information, however much the design wants them. */}
            {date && shows('date_time') && (
                <span
                    className={cn(
                        'relative hidden font-semibold tabular-nums leading-none @[150px]:block',
                        dark ? 'text-white/80' : 'text-black/60'
                    )}
                    style={{ fontSize: 'clamp(7px, 3.6cqw, 13px)', marginTop: '3cqw', letterSpacing: '0.1em' }}
                >
                    {date}
                </span>
            )}

            {venueName && shows('venue') && (
                <span
                    className={cn(
                        'relative hidden max-w-[80%] truncate leading-none @[190px]:block',
                        dark ? 'text-white/60' : 'text-black/45'
                    )}
                    style={{ fontSize: 'clamp(6px, 3.1cqw, 11px)', marginTop: '2cqw' }}
                >
                    {venueName}
                </span>
            )}
        </div>
    );
}
