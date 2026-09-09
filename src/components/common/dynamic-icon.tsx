'use client';

import { createElement, type CSSProperties } from 'react';
import * as LucideIcons from 'lucide-react';
import { Icon as IconifyIcon } from '@iconify/react';
import { HelpCircle, type LucideIcon as LucideIconType } from 'lucide-react';

/**
 * Renders whatever the admin panel's icon picker stored on a category —
 * ported from Event_Management_Admin_Frontend's `dynamic-icon.tsx` so both
 * apps render the same `notification_categories.icon` value identically.
 *
 * That picker emits two shapes: a bare PascalCase Lucide component name
 * ("Bell") for the lucide collection, and a full Iconify id ("mdi:star") for
 * every other collection — so this has to handle both.
 */

type IconComponent = LucideIconType;

const lucideIconMap: Record<string, IconComponent> = Object.fromEntries(
    Object.entries(LucideIcons)
        .filter(([k]) => /^[A-Z]/.test(k))
        .map(([k, v]) => [k.toLowerCase(), v as IconComponent])
);

export function resolveLucideIcon(name: string): IconComponent | null {
    if (!name) return null;
    const exact = (LucideIcons as unknown as Record<string, IconComponent>)[name];
    if (exact) return exact;
    if (lucideIconMap[name.toLowerCase()]) return lucideIconMap[name.toLowerCase()];
    const converted = name
        .trim()
        .split(/[-_ ]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    return lucideIconMap[converted.toLowerCase()] || null;
}

interface DynamicIconProps {
    name?: string | null;
    color?: string | null;
    className?: string;
}

/**
 * `createElement` rather than a JSX `<LucideIcon />` tag: the resolved
 * component is looked up by name at render time, and the JSX form reads to
 * the react-hooks lint rule as "a component created during render" even
 * though it only ever returns a reference to an existing module-level
 * component from `lucideIconMap`.
 */
export function DynamicIcon({ name, color, className = 'size-4' }: DynamicIconProps) {
    if (!name) return <HelpCircle className={`${className} text-muted-foreground`} />;

    const style: CSSProperties | undefined = color ? { color } : undefined;

    if (name.includes(':')) {
        return <IconifyIcon icon={name} className={className} style={style} />;
    }

    const Resolved = resolveLucideIcon(name);
    if (!Resolved) return <HelpCircle className={`${className} text-muted-foreground`} />;
    return createElement(Resolved, { className, style });
}
