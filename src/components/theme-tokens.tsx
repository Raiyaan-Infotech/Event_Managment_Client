'use client';

import { useEffect } from 'react';
import { useThemeSettings } from '@/hooks/use-theme-settings';

/**
 * Writes the backend's theme settings onto :root as CSS variables.
 *
 * Renders nothing. Every component keeps reading `var(--primary)` etc., so
 * nothing else in the app needs to know the palette is remote — which is the
 * whole point: one fetch here re-skins the entire panel.
 *
 * WHY CSS VARIABLES and not a React context: the tokens are consumed by
 * Tailwind classes (`bg-primary`, `text-muted-foreground`) that compile to
 * `var(--primary)`. A context could only reach components that opt in; a
 * variable on :root reaches everything, including the `.dark` overrides.
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

/** #abc and #aabbcc both accepted; anything else is ignored rather than written. */
function isHex(value: unknown): value is string {
    return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/**
 * A darker shade of the brand for :hover.
 *
 * The API has no hover colour, and picking one per component would drift.
 * color-mix does it in CSS so it tracks whatever primary turns out to be —
 * no hex maths, and it stays correct if the value changes at runtime.
 */
const hover = (c: string) => `color-mix(in srgb, ${c} 86%, #000)`;

export function ThemeTokens() {
    const { data } = useThemeSettings();

    useEffect(() => {
        if (!data) return;
        const root = document.documentElement;

        // Only write what the API actually returned and what parses. A null or a
        // malformed value must leave the CSS fallback standing, not blank the token.
        const set = (name: string, value: string | null | undefined) => {
            if (isHex(value)) root.style.setProperty(name, value.trim());
        };

        set('--primary', data.primary_color);
        set('--ring', data.primary_color);
        set('--brand', data.primary_color);
        set('--sidebar-primary', data.primary_color);
        set('--sidebar-ring', data.primary_color);
        set('--accent', data.accent_color);
        set('--secondary-brand', data.secondary_color);
        set('--background', data.background_color);
        set('--foreground', data.text_color);

        if (isHex(data.primary_color)) {
            const p = data.primary_color.trim();
            root.style.setProperty('--brand-hover', hover(p));
            // The sidebar's active row is a tint of the brand, so it has to move
            // with it — otherwise a new primary sits on the old blue wash.
            root.style.setProperty('--sidebar-accent', `color-mix(in srgb, ${p} 10%, #fff)`);
            root.style.setProperty('--sidebar-accent-foreground', p);
            root.style.setProperty('--chart-1', p);
        }
        if (isHex(data.accent_color)) root.style.setProperty('--chart-2', data.accent_color.trim());

        // border_radius arrives as a CSS length ("8px"). Guard the unit so a bare
        // number cannot produce `--radius: 8` and silently break every corner.
        const radius = (data.border_radius ?? '').trim();
        if (/^\d+(\.\d+)?(px|rem|em)$/.test(radius)) {
            root.style.setProperty('--radius', radius);
        }

        const family = (data.font_family ?? '').trim().toLowerCase();
        if (family) {
            // An unknown family would otherwise be written as-is and silently fall
            // back to a serif, because no @font-face for it exists.
            root.style.setProperty('--app-font', FONT_STACKS[family] ?? SYSTEM_STACK);
        }
    }, [data]);

    return null;
}
