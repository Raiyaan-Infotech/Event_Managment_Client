import {
    faHouse,
    faCalendarDays,
    faLayerGroup,
    faUsers,
    faUserPlus,
    faFileImport,
    faPeopleGroup,
    faSquareCheck,
    faPaperPlane,
    faEnvelope,
    faChartColumn,
    faPlug,
    faCreditCard,
    faGear,
} from "@fortawesome/free-solid-svg-icons"

/**
 * Client portal sidebar.
 *
 * Mostly flat — a client manages a handful of areas, and the collapsible groups
 * the template shipped with were one click of ceremony per item. Only an entry
 * with real children gets a chevron.
 *
 * ── THE GUEST MODULE ─────────────────────────────────────────────────────────
 * Every guest screen breadcrumbs from **Guests** in the designs
 * (`Guests > Add Guest`, `Guests > Manage Groups`, `Guests > Import Guests`,
 * `Guests > Send Message`, `Guests > Messages`), so the routes nest the same
 * way and the sidebar mirrors it. A nav that disagrees with the breadcrumb
 * leaves people unable to tell where they are.
 *
 * Messages keeps its own top-level entry as well as the breadcrumb parent,
 * because it is a destination in its own right — the Analytics cards link
 * straight to `/dashboard/messages` and `/dashboard/rsvps`.
 *
 * Children are listed most-used first, not alphabetically: "All Guests" is what
 * someone wants nine times out of ten, and Import is the rare one.
 *
 * > **`url` must be the real route.** `isActive()` in AppSidebar resolves the
 * > highlight by longest-prefix match over THIS list, so an entry pointing at a
 * > path that does not exist silently steals the highlight from one that does.
 *
 * ── `ready` ──────────────────────────────────────────────────────────────────
 * `false` means the page is not built yet, and the sidebar renders it disabled
 * with a Soon chip rather than as a link to the `[...slug]` "coming soon"
 * placeholder. A nav item that navigates to a dead end is worse than one that
 * says it is not ready — the first looks broken, the second is honest.
 *
 * Flip it to `true` as each page lands. Nothing else needs changing.
 */
export const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: faHouse, items: [] },
    { title: "My Events", url: "/dashboard/events", icon: faCalendarDays, items: [] },
    { title: "Templates", url: "/dashboard/templates", icon: faLayerGroup, items: [] },
    {
        title: "Guests",
        url: "/dashboard/guests",
        icon: faUsers,
        items: [
            { title: "All Guests", url: "/dashboard/guests", ready: true },
            { title: "Add Guest", url: "/dashboard/guests/add", ready: true },
            { title: "Guest Groups", url: "/dashboard/guests/groups", ready: true },
            { title: "Import Guests", url: "/dashboard/guests/import", ready: true },
        ],
    },
    {
        title: "Messages",
        url: "/dashboard/messages",
        icon: faEnvelope,
        items: [
            { title: "All Messages", url: "/dashboard/messages", ready: false },
            { title: "Send Message", url: "/dashboard/messages/send", ready: false },
        ],
    },
    { title: "RSVPs", url: "/dashboard/rsvps", icon: faSquareCheck, items: [] },
    { title: "Analytics", url: "/dashboard/analytics", icon: faChartColumn, items: [] },
    { title: "Integrations", url: "/dashboard/integrations", icon: faPlug, items: [] },
    { title: "Billing", url: "/dashboard/billing", icon: faCreditCard, items: [] },
    { title: "Settings", url: "/dashboard/settings", icon: faGear, items: [] },
]

/**
 * Icons for the guest sub-pages, used by the Quick Actions cards rather than
 * the sidebar (whose sub-items are text-only). Kept beside the routes so the
 * two cannot drift.
 */
export const guestActionIcons = {
    add: faUserPlus,
    groups: faPeopleGroup,
    import: faFileImport,
    send: faPaperPlane,
}

/**
 * The sample module, kept reachable while the client screens are built out.
 * Remove this once it is no longer the reference implementation.
 */
export const navDev = [
    { title: "Event Categories", url: "/dashboard/event-categories", icon: faLayerGroup, items: [] },
]
