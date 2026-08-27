/**
 * Bridges the ADMIN-authored template catalogue (`event_templates`) with the
 * older hardcoded one in `event-themes.ts`.
 *
 * ── WHY BOTH STILL EXIST ─────────────────────────────────────────────────────
 * `events.theme_id` is a slug column, and it already holds values like
 * `floral-bliss` from before the admin catalogue existed. Admin templates put
 * their `code` in the same column — also a slug, so **no migration was needed**.
 *
 * That means a `theme_id` read back off an event can be either kind, and
 * nothing in the row says which. `resolveArtwork` looks in the admin list first
 * and falls back to the built-in one, so:
 *
 *   - an event created before this feature keeps the exact artwork it had;
 *   - an event created after it renders the admin's design;
 *   - an id matching NEITHER (a deleted template) falls back to the default
 *     rather than rendering blank.
 *
 * ⚠ The same warning as `event-themes.ts` applies, and now to the admin panel
 * too: **changing a template's CODE orphans every event using it.** The admin
 * service deliberately does not re-derive the code when a template is renamed,
 * for exactly this reason.
 */

import type { TemplateOption } from '@/hooks/use-client-portal';
import { eventTheme, type EventTheme } from '@/lib/event-themes';

export type Artwork =
    | { kind: 'template'; template: TemplateOption; name: string; dark: boolean }
    | { kind: 'legacy'; theme: EventTheme; name: string; dark: boolean };

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const clean = (value: string | null | undefined, fallback: string) =>
    value && HEX.test(value) ? value : fallback;

/**
 * Perceived luminance, so light text is never drawn on a pale card.
 *
 * The legacy catalogue carries a hand-set `dark` flag because its swatches are
 * Tailwind class names with no colour to measure. An admin template has real
 * hex, so this is computed rather than curated — which also means a template
 * the admin recolours stays legible without anyone remembering to flip a flag.
 *
 * 0.6 rather than 0.5: at exactly half, mid-tone backgrounds flip between light
 * and dark ink on colours that look the same, and the result reads as a bug.
 */
export function isDarkColor(hex: string): boolean {
    const v = clean(hex, '#FFFFFF').slice(1);
    const full = v.length === 3 ? v.split('').map((c) => c + c).join('') : v.slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b < 0.6;
}

/** The CSS that paints an admin template's background. */
export function templateBackground(t: TemplateOption): React.CSSProperties {
    const primary = clean(t.background_color, '#FFF7F0');

    if (t.background_type === 'image' && t.background_image) {
        return {
            backgroundImage: `url(${t.background_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    }
    if (t.background_type === 'gradient') {
        return {
            backgroundImage: `linear-gradient(160deg, ${clean(t.gradient_from, primary)}, ${clean(
                t.gradient_to,
                clean(t.secondary_color, '#F3E8DA')
            )})`,
        };
    }
    // `custom` stores CSS the invitation renderer applies; nothing here
    // evaluates it, so the base colour is shown rather than a blank card.
    return { backgroundColor: primary };
}

/**
 * Whether an admin template needs light ink.
 *
 * An IMAGE background is treated as dark: the image is unknown, and light text
 * with a shadow over a photo is readable far more often than dark text is.
 */
export function isDarkTemplate(t: TemplateOption): boolean {
    if (t.background_type === 'image' && t.background_image) return true;
    if (t.background_type === 'gradient') return isDarkColor(clean(t.gradient_from, '#FFF7F0'));
    return isDarkColor(clean(t.background_color, '#FFF7F0'));
}

/**
 * Resolve an event's `theme_id` to something renderable.
 *
 * `templates` is what `/client/event-options` returned. Passing an empty list
 * (or none at all) is fine and simply means everything resolves to the legacy
 * catalogue — which is exactly what happens on a backend that predates this.
 */
export function resolveArtwork(
    themeId: string | null | undefined,
    templates?: TemplateOption[] | null
): Artwork {
    const match = (templates ?? []).find((t) => t.code === themeId);
    if (match) {
        return { kind: 'template', template: match, name: match.name, dark: isDarkTemplate(match) };
    }
    const theme = eventTheme(themeId);
    return { kind: 'legacy', theme, name: theme.name, dark: theme.dark };
}

/**
 * The templates that suit the event being created.
 *
 * The backend narrowed by PLAN; this narrows by what the client actually picked
 * in step 1, because a plan covering all of Wedding should still not offer a
 * Haldi-only template for a Reception. A NULL column on the template means "any"
 * — a general template must stay on offer whatever is selected.
 */
type Scope = { categoryId?: number | null; typeId?: number | null; religionId?: number | null };

/** NULL on the row means "suits every value of it" — the shared scoping rule. */
const suitsScope = (
    row: { event_category_id?: number | null; event_type_id?: number | null; religion_id?: number | null },
    scope: Scope
): boolean => {
    const suits = (want: number | null | undefined, has: number | null | undefined) =>
        !has || !want || Number(has) === Number(want);

    return (
        suits(scope.categoryId, row.event_category_id) &&
        suits(scope.typeId, row.event_type_id) &&
        suits(scope.religionId, row.religion_id)
    );
};

export function templatesForEvent(
    templates: TemplateOption[] | undefined,
    scope: Scope
): TemplateOption[] {
    return (templates ?? []).filter((t) => suitsScope(t, scope));
}
