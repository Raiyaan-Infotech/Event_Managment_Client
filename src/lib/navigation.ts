import {
    faDesktop,
    faLayerGroup,
    faCalendarAlt,
    faUsers,
    faCog,
} from "@fortawesome/free-solid-svg-icons"

/**
 * Sidebar structure.
 *
 * Only Event Categories is actually built — it is the sample module showing how
 * a screen is wired to the backend (see INTEGRATION.md). Every other entry
 * below resolves to the `[...slug]` catch-all, which renders a "coming soon"
 * placeholder rather than a 404, so the shape of the panel is visible while the
 * modules are filled in one at a time.
 *
 * The template's own demo sections (Reports, Applications, Proposal, Payment,
 * Leads, Projects, Widgets, Help Center) were removed — they were theme
 * showcases with no backend behind them.
 */
export const navMain = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: faDesktop,
        items: [
            { title: "Overview", url: "/dashboard" },
        ],
    },
    {
        title: "Menu Management",
        url: "#",
        icon: faLayerGroup,
        items: [
            // ↓ the one that is really wired up
            { title: "Event Categories", url: "/dashboard/event-categories" },
            { title: "Event Types", url: "/dashboard/event-types" },
            { title: "Religions", url: "/dashboard/religions" },
            { title: "Menus", url: "/dashboard/menus" },
        ],
    },
    {
        title: "Events",
        url: "#",
        icon: faCalendarAlt,
        items: [
            { title: "All Events", url: "/dashboard/events" },
            { title: "Create Event", url: "/dashboard/events/create" },
        ],
    },
    {
        title: "Clients",
        url: "#",
        icon: faUsers,
        items: [
            { title: "All Clients", url: "/dashboard/clients" },
        ],
    },
    {
        title: "Settings",
        url: "#",
        icon: faCog,
        items: [
            { title: "General", url: "/dashboard/settings" },
        ],
    },
]
