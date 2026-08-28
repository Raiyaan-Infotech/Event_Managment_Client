'use client';

import { InvitationCard, type InvitationData } from '@/components/common/invitation-card';
import type { TemplateOption } from '@/hooks/use-client-portal';
import { cn } from '@/lib/utils';

/**
 * A template's design, drawn the way it will actually print.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────────
 * Every screen that LISTS templates — the Templates catalogue, its Preview
 * dialog, and step 4 of the wizard — used to paint `templateBackground()`, which
 * is the background colour or gradient and nothing else, with the template's
 * name written across it. So a design carrying an arch frame, four corner
 * decorations and eight component blocks appeared to the client as a flat
 * swatch, while the admin who authored it saw the finished invitation. Two
 * previews of the same row, disagreeing completely.
 *
 * `InvitationCard` already draws it properly. This is the piece that lets a
 * grid tile use it: a fixed-canvas invitation scaled to fit whatever box the
 * caller gives it, without distorting its aspect.
 *
 * ── THE THUMBNAIL STILL WINS ─────────────────────────────────────────────────
 * A thumbnail REPLACES the rendered design — that is what the column is for,
 * and an admin who uploads one has decided the photo is the shopfront. Most
 * rows leave it null on purpose (18 of 20 in production), which is exactly why
 * the flat-colour fallback was what nearly every client actually saw.
 */

/**
 * The stand-in content.
 *
 * A template has no event, so something has to fill the components. These are
 * the SAME names, date and venue the admin's own `TemplatePreview` shows, so
 * the two sides of the product describe one template identically. Passing an
 * empty object instead would render a column of dashes and placeholders, which
 * looks like a broken invitation rather than a design.
 */
export const TEMPLATE_SAMPLE: InvitationData = {
    name: 'Rahul & Priya',
    hostOne: 'Rahul',
    hostTwo: 'Priya',
    startDate: '2025-12-24',
    startTime: '18:00',
    endTime: '22:00',
    venueName: 'The Grand Palace',
    venueAddress: 'Chennai, Tamil Nadu',
    organizer: 'Hosted by the Verma family',
    contact: '+91 98765 43210',
    description: 'Together with our families, we request the honour of your presence.',
    footerNote: 'Thank you for being part of our story.',
};

/** The card's own canvas ratio, as `InvitationCard` sets it on itself. */
const ratioOf = (template: TemplateOption) =>
    template.orientation === 'landscape' ? { w: 16, h: 10 } : { w: 9, h: 16 };

export function TemplateArtwork({
    template,
    data,
    fit = 'contain',
    className,
    cardClassName,
}: {
    template: TemplateOption;
    /**
     * What to print on the card.
     *
     * The catalogue has no event, so it falls back to `TEMPLATE_SAMPLE`. The
     * wizard DOES have one by the time a template is picked, and passes the
     * client's own name, date and venue instead — a tile is there to answer
     * "what will MY invitation look like", and Rahul & Priya cannot answer it.
     *
     * Passed straight through rather than merged over the sample: filling a
     * blank venue with "The Grand Palace" would state something about their
     * event that is not true. `InvitationCard` has its own placeholders for
     * anything still empty.
     */
    data?: InvitationData;
    /**
     * `contain` fills the caller's box — it positions itself `inset-0`, so the
     * parent must be `relative` and carry its own size or aspect.
     *
     * `natural` renders the card at its authored size (248px wide portrait) and
     * centres it. Used where there is room for the real thing, so nothing is
     * scaled down and every line stays at the size it was designed at.
     */
    fit?: 'contain' | 'natural';
    /**
     * Applied to the artwork BOX — the `inset-0` positioner in `contain` mode.
     * `inset-*` here wins over the default, which is how a caller mats the card
     * inside a padded tile instead of running it edge to edge.
     */
    className?: string;
    /** Applied to the invitation card itself — its rounding and shadow. */
    cardClassName?: string;
}) {
    const { w, h } = ratioOf(template);
    const content = data ?? TEMPLATE_SAMPLE;

    if (template.thumbnail) {
        return fit === 'natural' ? (
            <span className={cn('mx-auto block w-full max-w-[248px] overflow-hidden rounded-md', className)}
                style={{ aspectRatio: `${w} / ${h}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={template.thumbnail} alt="" className="h-full w-full object-cover" />
            </span>
        ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={template.thumbnail} alt=""
                className={cn('absolute inset-0 h-full w-full object-cover', className, cardClassName)} />
        );
    }

    if (fit === 'natural') {
        return (
            <span className={cn('flex justify-center', className)}>
                <InvitationCard template={template} data={content} />
            </span>
        );
    }

    /**
     * Contain, in CSS rather than a second ResizeObserver.
     *
     * `container-type: size` makes `cqw`/`cqh` resolve against this box, so the
     * width is `min(the box, what that box's height allows at this aspect)` —
     * the exact "contain" fit, with no measure-then-paint flash and no observer
     * racing the one `InvitationCard` already runs on its own content.
     *
     * Safe to contain: this element is `inset-0`, so its size comes from the
     * parent and never from what is inside it.
     */
    return (
        // Spans, not divs: the wizard's tile is a <span> inside a <button>, and
        // a button may only contain phrasing content. The display comes from the
        // classes, so nothing about the layout depends on the tag.
        <span
            className={cn('absolute inset-0 grid place-items-center overflow-hidden', className)}
            style={{ containerType: 'size' }}
        >
            {/* `w-full` is the fallback, not decoration: a browser without
                container-query units discards the inline `min()` as invalid and
                the cascade falls back to the class, so the card still renders —
                filling the width rather than fitting the height. */}
            <span className="block w-full" style={{ width: `min(100cqw, calc(100cqh * ${w} / ${h}))`, aspectRatio: `${w} / ${h}` }}>
                {/* The card sizes itself for a standalone preview; here the box
                    above has already worked out the fit, so it fills it. */}
                <InvitationCard
                    template={template}
                    data={content}
                    className={cn('h-full w-full max-w-none shadow-none', cardClassName)}
                />
            </span>
        </span>
    );
}
