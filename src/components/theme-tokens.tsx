'use client';

import { useEffect } from 'react';
import { useThemeSettings } from '@/hooks/use-theme-settings';

/**
 * Writes the backend's theme settings as CSS variables, per colour mode.
 *
 * Renders nothing. Every component keeps reading `var(--primary)` etc., so
 * nothing else in the app needs to know the palette is remote — which is the
 * whole point: one fetch here re-skins the entire panel.
 *
 * WHY CSS VARIABLES and not a React context: the tokens are consumed by
 * Tailwind classes (`bg-primary`, `text-muted-foreground`) that compile to
 * `var(--primary)`. A context could only reach components that opt in; a
 * variable reaches everything.
 *
 * ── ⚠ A <style> ELEMENT, NEVER INLINE STYLES ON <html> ──────────────────────
 * This used to `root.style.setProperty(...)`. An inline style beats every
 * stylesheet rule, including `.dark { --background: … }` in globals.css — so in
 * dark mode the page kept the backend's LIGHT background and text colour while
 * cards, borders and muted text went dark: light text on a light page, on every
 * screen. The backend palette is a light palette (the builder is light-only).
 *
 * So the rules are split by mode:
 *   light  `html:not(.dark)` — the backend values as given
 *   dark   `html.dark`       — brand hues lifted towards white so they read on
 *                              the dark ground; background/text left to the
 *                              `.dark` palette, which is built for it
 * Both selectors are (0,1,1), above globals.css's `:root` / `.dark` (0,1,0),
 * so they win whatever order the stylesheets load in.
 */

/** Families we actually ship a font file for. Anything else falls back. */
const FONT_STACKS: Record<string, string> = {
    inter: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    poppins: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    roboto: '"Roboto", ui-sans-serif, system-ui, sans-serif',
    lato: '"Lato", ui-sans-serif, system-ui, sans-serif',
    montserrat: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
    'open sans': '"Open Sans", ui-sans-serif, system-ui, sans-serif',
};

const SYSTEM_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

const STYLE_ID = 'backend-theme-tokens';

/** #abc and #aabbcc both accepted; anything else is ignored rather than written. */
function hex(value: unknown): string | null {
    return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
        ? value.trim()
        : null;
}

/**
 * A darker shade of the brand for :hover.
 *
 * The API has no hover colour, and picking one per component would drift.
 * color-mix does it in CSS so it tracks whatever primary turns out to be.
 */
const darken = (c: string, keep = 86) => `color-mix(in srgb, ${c} ${keep}%, #000)`;
const lighten = (c: string, keep: number) => `color-mix(in srgb, ${c} ${keep}%, #fff)`;

const block = (selector: string, vars: Record<string, string | null>) => {
    const body = Object.entries(vars)
        .filter(([, v]) => v)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
    return body ? `${selector} {\n${body}\n}` : '';
};

export function ThemeTokens() {
    const { data } = useThemeSettings();

    useEffect(() => {
        if (!data) return;

        // Only write what the API actually returned and what parses. A null or a
        // malformed value must leave the CSS fallback standing, not blank the token.
        const primary = hex(data.primary_color);
        const accent = hex(data.accent_color);
        const secondary = hex(data.secondary_color);

        // border_radius arrives as a CSS length ("8px"). Guard the unit so a bare
        // number cannot produce `--radius: 8` and silently break every corner.
        const radius = (data.border_radius ?? '').trim();
        const family = (data.font_family ?? '').trim().toLowerCase();

        const shared = {
            '--radius': /^\d+(\.\d+)?(px|rem|em)$/.test(radius) ? radius : null,
            // An unknown family would otherwise be written as-is and silently fall
            // back to a serif, because no @font-face for it exists.
            '--app-font': family ? (FONT_STACKS[family] ?? SYSTEM_STACK) : null,
        };

        const light = block('html:not(.dark)', {
            ...shared,
            '--primary': primary,
            '--ring': primary,
            '--brand': primary,
            '--brand-hover': primary && darken(primary),
            '--sidebar-primary': primary,
            '--sidebar-ring': primary,
            // The sidebar's active row is a tint of the brand, so it has to move
            // with it — otherwise a new primary sits on the old blue wash.
            '--sidebar-accent': primary && lighten(primary, 10),
            '--sidebar-accent-foreground': primary,
            '--chart-1': primary,
            '--accent': accent,
            '--chart-2': accent,
            '--secondary-brand': secondary,
            '--background': hex(data.background_color),
            '--foreground': hex(data.text_color),
        });

        // Dark keeps its own ground, text, cards and borders. Only the brand hue
        // follows the backend, lifted so it stays readable on #0b1120 — and the
        // sidebar tint is mixed into the dark card, never into white.
        const liftedPrimary = primary && lighten(primary, 72);
        const dark = block('html.dark', {
            ...shared,
            '--primary': liftedPrimary,
            '--ring': liftedPrimary,
            '--brand': liftedPrimary,
            '--brand-hover': primary && lighten(primary, 60),
            '--sidebar-primary': liftedPrimary,
            '--sidebar-ring': liftedPrimary,
            '--sidebar-accent': primary && `color-mix(in srgb, ${primary} 22%, #111a2e)`,
            '--sidebar-accent-foreground': primary && lighten(primary, 55),
            '--chart-1': liftedPrimary,
            '--accent': accent && lighten(accent, 75),
            '--chart-2': accent && lighten(accent, 75),
            '--secondary-brand': secondary && lighten(secondary, 72),
        });

        let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
        if (!el) {
            el = document.createElement('style');
            el.id = STYLE_ID;
            document.head.appendChild(el);
        }
        el.textContent = [light, dark].filter(Boolean).join('\n');
    }, [data]);

    return null;
}
