import {
    faDesktop,
    faChartBar,
    faPaperPlane,
    faAt,
    faDollarSign,
    faUsers,
    faExclamationCircle,
    faBriefcase,
    faThLarge,
    faCog,
    faLock,
    faLifeRing,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons"

export const navMain = [
    {
        title: "Dashboards",
        url: "/dashboard",
        icon: faDesktop,
        items: [
            { title: "CRM", url: "/dashboard" },
            { title: "Analytics", url: "/dashboard/analytics" },
        ],
    },
    {
        title: "Reports",
        url: "#",
        icon: faChartBar,
        items: [
            { title: "Sales Report", url: "/dashboard/reports/sales" },
            { title: "Leads Report", url: "/dashboard/reports/leads" },
            { title: "Project Report", url: "/dashboard/reports/project" },
            { title: "Timesheets Report", url: "/dashboard/reports/timesheets" },
        ],
    },
    {
        title: "Applications",
        url: "#",
        icon: faPaperPlane,
        items: [
            { title: "Chat", url: "/dashboard/apps/chat" },
            { title: "Email", url: "/dashboard/apps/email" },
            { title: "Tasks", url: "/dashboard/apps/tasks" },
            { title: "Notes", url: "/dashboard/apps/notes" },
            { title: "Storage", url: "/dashboard/apps/storage" },
            { title: "Calendar", url: "/dashboard/apps/calendar" },
        ],
    },
    {
        title: "Event",
        url: "#",
        icon: faCalendarAlt,
        items: [
            { title: "Create", url: "/dashboard/event/create" },
            { title: "Menu Settings", url: "/dashboard/event/settings" },
        ],
    },
    {
        title: "Proposal",
        url: "#",
        icon: faAt,
        items: [
            { title: "Proposal", url: "/dashboard/proposal" },
            { title: "Proposal View", url: "/dashboard/proposal/view" },
            { title: "Proposal Create", url: "/dashboard/proposal/create" },
        ],
    },
    {
        title: "Payment",
        url: "#",
        icon: faDollarSign,
        items: [
            { title: "Payment", url: "/dashboard/payment" },
            { title: "Invoice View", url: "/dashboard/payment/invoice" },
            { title: "Invoice Create", url: "/dashboard/payment/create" },
        ],
    },
    {
        title: "Customers",
        url: "#",
        icon: faUsers,
        items: [
            { title: "Customers", url: "/dashboard/customers" },
            { title: "Customers View", url: "/dashboard/customers/view" },
            { title: "Customers Create", url: "/dashboard/customers/create" },
        ],
    },
    {
        title: "Leads",
        url: "#",
        icon: faExclamationCircle,
        items: [
            { title: "Leads", url: "/dashboard/leads" },
            { title: "Leads View", url: "/dashboard/leads/view" },
            { title: "Leads Create", url: "/dashboard/leads/create" },
        ],
    },
    {
        title: "Projects",
        url: "#",
        icon: faBriefcase,
        items: [
            { title: "Projects", url: "/dashboard/projects" },
            { title: "Projects View", url: "/dashboard/projects/view" },
            { title: "Projects Create", url: "/dashboard/projects/create" },
        ],
    },
    {
        title: "Widgets",
        url: "#",
        icon: faThLarge,
        items: [
            { title: "General", url: "/dashboard/widgets/general" },
            { title: "Charts", url: "/dashboard/widgets/charts" },
        ],
    },
    {
        title: "Settings",
        url: "#",
        icon: faCog,
        items: [
            { title: "General", url: "/dashboard/settings" },
            { title: "SEO", url: "/dashboard/settings/seo" },
            { title: "Email", url: "/dashboard/settings/email" },
        ],
    },
    {
        title: "Authentication",
        url: "#",
        icon: faLock,
        items: [
            { title: "Login", url: "/dashboard/authentication/login" },
            { title: "Register", url: "/dashboard/authentication/register" },
            { title: "Reset Password", url: "/dashboard/authentication/reset-password" },
            { title: "Profile Settings", url: "/dashboard/authentication/profile-settings" },
        ],
    },
    {
        title: "Help Center",
        url: "#",
        icon: faLifeRing,
        items: [
            { title: "Documentation", url: "/dashboard/help/docs" },
            { title: "Support", url: "/dashboard/help/support" },
        ],
    },
]
