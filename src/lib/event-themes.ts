/**
 * The invitation template catalogue.
 *
 * One list, four consumers: the Create Event wizard's theme picker, the
 * My Events row artwork, the dashboard cards, and the Templates screen. They
 * were separate arrays once, which is how a card and its own preview ended up
 * showing different gradients.
 *
 * ── WHY THIS IS NOT A DATABASE TABLE ─────────────────────────────────────────
 * An event stores only `theme_id`, and the backend validates the SHAPE of that
 * string (a slug) rather than its membership — so adding a template is a change
 * to this file alone: no migration, no API deploy. `company_templates` in the
 * backend is the WEBSITE BUILDER's template set, a different domain entirely,
 * and reusing it here would tie a client's invitation to the tenant's website
 * theme.
 *
 * ── THE METADATA IS CURATION, NOT DATA ───────────────────────────────────────
 * `categories`, `style`, `layout`, `accent` and `badge` are editorial choices
 * made here so the Templates screen can filter on something real. They describe
 * how a template looks and what it suits; nothing reads them back off an event.
 *
 * ⚠ NEVER RENAME AN `id`. Events store it, and a rename silently orphans every
 * event using that template — `eventTheme()` would fall back to the default and
 * their invitation would quietly change design.
 */

export type TemplateCategory =
    | 'Wedding'
    | 'Birthday'
    | 'Baby Shower'
    | 'Party'
    | 'Corporate'
    | 'Anniversary'
    | 'Others';

export type TemplateStyle = 'Classic' | 'Modern' | 'Floral' | 'Elegant' | 'Playful' | 'Minimal';
export type TemplateLayout = 'Bordered' | 'Framed' | 'Minimal' | 'Illustrated';

export interface EventTheme {
    id: string;
    name: string;
    /** Tailwind `bg-gradient-to-br` stops. */
    swatch: string;
    /**
     * Whether the swatch is dark enough to need light text on top.
     *
     * Not cosmetic. The artwork prints "You're invited" and the event name over
     * this gradient, and without the flag the dark templates rendered
     * dark-on-dark — the thumbnails came out as black rectangles with no
     * readable text at all.
     */
    dark: boolean;
    /** Representative hex, for the Color Theme filter swatches. */
    accent: string;
    categories: TemplateCategory[];
    style: TemplateStyle;
    layout: TemplateLayout;
    /** Editorial flag shown as a chip on the card. */
    badge?: 'Popular' | 'New';
}

export const EVENT_THEMES: EventTheme[] = [
    {
        id: 'floral-bliss', name: 'Floral Bliss',
        swatch: 'from-rose-100 via-pink-50 to-rose-200', dark: false, accent: '#E91E63',
        categories: ['Wedding', 'Anniversary', 'Baby Shower'], style: 'Floral', layout: 'Illustrated',
        badge: 'Popular',
    },
    {
        id: 'royal-classic', name: 'Royal Classic',
        swatch: 'from-slate-900 via-indigo-950 to-black', dark: true, accent: '#1E1B4B',
        categories: ['Wedding', 'Corporate', 'Anniversary'], style: 'Classic', layout: 'Framed',
        badge: 'Popular',
    },
    {
        id: 'traditional', name: 'Traditional',
        swatch: 'from-amber-100 via-orange-50 to-amber-200', dark: false, accent: '#F59E0B',
        categories: ['Wedding', 'Anniversary', 'Others'], style: 'Classic', layout: 'Bordered',
    },
    {
        id: 'elegant-gold', name: 'Elegant Gold',
        swatch: 'from-amber-700 via-yellow-800 to-amber-900', dark: true, accent: '#B45309',
        categories: ['Wedding', 'Corporate', 'Anniversary'], style: 'Elegant', layout: 'Framed',
        badge: 'Popular',
    },
    {
        id: 'minimal-white', name: 'Minimal White',
        swatch: 'from-slate-50 via-white to-slate-100', dark: false, accent: '#94A3B8',
        categories: ['Corporate', 'Party', 'Others'], style: 'Minimal', layout: 'Minimal',
    },
    {
        id: 'vintage', name: 'Vintage',
        swatch: 'from-stone-200 via-amber-50 to-stone-300', dark: false, accent: '#A8A29E',
        categories: ['Wedding', 'Anniversary', 'Others'], style: 'Classic', layout: 'Bordered',
    },
    // ── Added for the Templates screen. Safe: nothing keys off membership. ──
    {
        id: 'pink-balloons', name: 'Pink Balloons',
        swatch: 'from-pink-200 via-rose-100 to-pink-300', dark: false, accent: '#F472B6',
        categories: ['Birthday', 'Baby Shower', 'Party'], style: 'Playful', layout: 'Illustrated',
        badge: 'New',
    },
    {
        id: 'navy-gold', name: 'Navy & Gold',
        swatch: 'from-slate-950 via-blue-950 to-indigo-950', dark: true, accent: '#0F172A',
        categories: ['Corporate', 'Wedding', 'Anniversary'], style: 'Elegant', layout: 'Framed',
        badge: 'Popular',
    },
    {
        id: 'watercolor-blue', name: 'Watercolor Blue',
        swatch: 'from-sky-200 via-blue-100 to-cyan-200', dark: false, accent: '#38BDF8',
        categories: ['Baby Shower', 'Party', 'Others'], style: 'Modern', layout: 'Illustrated',
        badge: 'New',
    },
    {
        id: 'lavender-bloom', name: 'Lavender Bloom',
        swatch: 'from-violet-200 via-purple-100 to-violet-300', dark: false, accent: '#A78BFA',
        categories: ['Wedding', 'Baby Shower', 'Anniversary'], style: 'Floral', layout: 'Illustrated',
    },
    {
        id: 'fun-colorful', name: 'Fun & Colorful',
        swatch: 'from-orange-200 via-amber-100 to-teal-200', dark: false, accent: '#FB923C',
        categories: ['Birthday', 'Party', 'Others'], style: 'Playful', layout: 'Illustrated',
    },
];

export const DEFAULT_THEME = EVENT_THEMES[0];

/** Every category that at least one template claims, in the design's order. */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
    'Wedding', 'Birthday', 'Baby Shower', 'Party', 'Corporate', 'Anniversary', 'Others',
];

export const TEMPLATE_STYLES: TemplateStyle[] =
    ['Classic', 'Modern', 'Floral', 'Elegant', 'Playful', 'Minimal'];

export const TEMPLATE_LAYOUTS: TemplateLayout[] =
    ['Bordered', 'Framed', 'Minimal', 'Illustrated'];

/** The Color Theme filter row. Each maps to the template `accent` values. */
export const TEMPLATE_COLOR_FILTERS: { key: string; label: string; hex: string; match: string[] }[] = [
    { key: 'pink', label: 'Pink', hex: '#F472B6', match: ['#E91E63', '#F472B6'] },
    { key: 'purple', label: 'Purple', hex: '#A78BFA', match: ['#A78BFA'] },
    { key: 'blue', label: 'Blue', hex: '#38BDF8', match: ['#38BDF8'] },
    { key: 'green', label: 'Green', hex: '#22C55E', match: ['#22C55E'] },
    { key: 'gold', label: 'Gold', hex: '#F59E0B', match: ['#F59E0B', '#B45309', '#FB923C'] },
    { key: 'dark', label: 'Dark', hex: '#0F172A', match: ['#0F172A', '#1E1B4B'] },
    { key: 'neutral', label: 'Neutral', hex: '#CBD5E1', match: ['#94A3B8', '#A8A29E'] },
];

/** The colour swatches offered for an event's primary colour. */
export const PRIMARY_SWATCHES = ['#E91E63', '#8B5CF6', '#2457D6', '#22C55E', '#F59E0B'];

/**
 * A template by id, falling back to the default.
 *
 * A `theme_id` saved before a template was renamed or removed would otherwise
 * render artwork with no background at all — an invisible tile rather than an
 * obviously wrong one, which is much harder to notice.
 */
export function eventTheme(themeId: string | null | undefined): EventTheme {
    return EVENT_THEMES.find((t) => t.id === themeId) ?? DEFAULT_THEME;
}

export function themeSwatch(themeId: string | null | undefined): string {
    return eventTheme(themeId).swatch;
}

export function themeName(themeId: string | null | undefined): string {
    return eventTheme(themeId).name;
}

/** True when the template needs light text drawn over it. */
export function isDarkTheme(themeId: string | null | undefined): boolean {
    return eventTheme(themeId).dark;
}
