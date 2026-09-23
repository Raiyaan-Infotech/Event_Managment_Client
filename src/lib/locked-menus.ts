/**
 * Menus every event keeps. Their switches render on and disabled, and the
 * create/update payload always includes them — an event without one of these
 * would be missing a core screen.
 *
 * Mirrors the same list in the admin panel, which locks them at the plan level.
 */
export const LOCKED_MENU_SLUGS = [
    "splash-screens",
    "event-invitation",
    "participants",
    "venue",
    "rsvp",
    "agenda",
    "guests",
] as const;

export const isLockedMenu = (slug?: string | null): boolean =>
    !!slug && (LOCKED_MENU_SLUGS as readonly string[]).includes(slug);
