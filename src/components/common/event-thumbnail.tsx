'use client';

import { cn } from '@/lib/utils';
import { useEventOptions } from '@/hooks/use-client-portal';
import { resolveArtwork, templateBackground } from '@/lib/event-templates';

/**
 * An event's invitation artwork, as shown in the My Events rows and the
 * dashboard cards.
 *
 * There is no artwork upload in this system, so this is not a placeholder for a
 * missing image — it IS the artwork, drawn from the template and primary colour
 * the client chose in wizard step 4. It is a miniature of the same invitation
 * the wizard previews on step 5, which is why the two look related.
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
 * While it is still loading every tile resolves to the legacy catalogue, which
 * is a real design rather than a blank — the tile settles rather than flashing
 * empty.
 *
 * ── THE BUG THIS FIXES ───────────────────────────────────────────────────────
 * The first version printed dark text on the swatch unconditionally. Two of the
 * six built-in themes are near-black, so those rows rendered as blank dark
 * rectangles — the text was there, drawn in slate on slate. `dark` now decides
 * the ink, and for an admin template it is COMPUTED from the actual background
 * colour, so a template the admin recolours stays legible with nobody
 * remembering to flip a flag.
 */

interface EventThumbnailProps {
    themeId: string | null | undefined;
    /** Drawn small under the "You're invited" line. Falls back to nothing. */
    name?: string | null;
    /** The event's chosen accent, used for the name. */
    primaryColor?: string | null;
    className?: string;
}

export function EventThumbnail({
    themeId,
    name,
    primaryColor,
    className,
}: EventThumbnailProps) {
    const { data: opts } = useEventOptions();
    const artwork = resolveArtwork(themeId, opts?.templates);
    const dark = artwork.dark;

    const isTemplate = artwork.kind === 'template';

    return (
        <div
            className={cn(
                'relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-md border px-2 py-2 text-center',
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

            <span
                className={cn(
                    'relative text-[6.5px] font-semibold uppercase leading-none tracking-[0.16em]',
                    dark ? 'text-white/70' : 'text-black/50'
                )}
            >
                You&rsquo;re invited
            </span>

            {name && (
                <span
                    className={cn(
                        // line-clamp, not truncate: the tile is fixed-height, so a
                        // long name must wrap to two lines and stop, never clip
                        // mid-word on one.
                        'relative mt-1 line-clamp-2 text-[8.5px] font-bold leading-tight break-words',
                        dark ? 'text-white/90' : 'text-black/70'
                    )}
                    // The accent is only trusted on light backgrounds. Several of
                    // the swatch colours are too dark for a #E91E63 to read
                    // against, so dark ones keep the plain light ink above.
                    style={primaryColor && !dark ? { color: primaryColor } : undefined}
                >
                    {name}
                </span>
            )}

            <span
                className={cn(
                    'relative mt-1 h-px w-6',
                    dark ? 'bg-white/25' : 'bg-black/15'
                )}
            />
        </div>
    );
}
