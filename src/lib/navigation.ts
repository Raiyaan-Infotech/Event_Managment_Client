import {
    faHouse,
    faCalendarDays,
    faCirclePlus,
    faLayerGroup,
    faUsers,
    faSquareCheck,
    faComments,
    faChartColumn,
    faPlug,
    faCreditCard,
    faGear,
} from "@fortawesome/free-solid-svg-icons"

/**
 * Client portal sidebar.
 *
 * Flat, single-level — a client manages a handful of areas, so the collapsible
 * groups the template shipped with would be one click of ceremony per item.
 * `items` is kept (empty) so the sidebar component's existing shape still
 * works; RSVPs is the one entry with children.
 *
 * Only Event Categories is wired to the backend so far (see INTEGRATION.md).
 * Everything else falls through to the [...slug] "coming soon" placeholder
 * rather than 404ing, so the panel's shape is visible while it is filled in.
 */
export const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: faHouse, items: [] },
    { title: "My Events", url: "/dashboard/events", icon: faCalendarDays, items: [] },
    { title: "Create New Event", url: "/dashboard/events/create", icon: faCirclePlus, items: [] },
    { title: "Templates", url: "/dashboard/templates", icon: faLayerGroup, items: [] },
    { title: "Guests", url: "/dashboard/guests", icon: faUsers, items: [] },
    {
        title: "RSVPs",
        url: "#",
        icon: faSquareCheck,
        items: [
            { title: "All RSVPs", url: "/dashboard/rsvps" },
            { title: "Pending", url: "/dashboard/rsvps/pending" },
        ],
    },
    { title: "Messages", url: "/dashboard/messages", icon: faComments, items: [] },
    { title: "Analytics", url: "/dashboard/analytics", icon: faChartColumn, items: [] },
    { title: "Integrations", url: "/dashboard/integrations", icon: faPlug, items: [] },
    { title: "Billing", url: "/dashboard/billing", icon: faCreditCard, items: [] },
    { title: "Settings", url: "/dashboard/settings", icon: faGear, items: [] },
]

/**
 * The sample module, kept reachable while the client screens are built out.
 * Remove this once a real client-facing module replaces it as the reference.
 */
export const navDev = [
    { title: "Event Categories", url: "/dashboard/event-categories", icon: faLayerGroup, items: [] },
]
