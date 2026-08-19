"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faUsers,
    faSquareCheck,
    faClock,
    faPlus,
    faSearch,
    faFilter,
    faLocationDot,
    faEllipsisVertical,
    faChevronLeft,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Client dashboard.
 *
 * ⚠ The numbers and event rows below are PLACEHOLDER data, held in the two
 * constants at the top so they are trivial to replace. Nothing here is wired to
 * the backend yet — the client-facing endpoints (events, guests, RSVPs) do not
 * exist. `event-categories` is the module that shows the real integration
 * pattern; see INTEGRATION.md.
 *
 * To make this real: replace `STATS` and `EVENTS` with a hook built the way
 * `use-event-categories.ts` is built. The layout below does not change.
 */

const STATS = [
    { label: "Total Events", value: 12, caption: "All time", icon: faCalendarDays, tint: "text-primary", bg: "bg-primary/10" },
    { label: "Total Guests", value: 368, caption: "All events", icon: faUsers, tint: "text-accent", bg: "bg-accent/10" },
    { label: "RSVPs Received", value: 256, caption: "Accepted", icon: faSquareCheck, tint: "text-info", bg: "bg-info/10" },
    { label: "Upcoming Events", value: 5, caption: "Next 30 days", icon: faClock, tint: "text-warning", bg: "bg-warning/10" },
];

type EventStatus = "Upcoming" | "Past" | "Draft";

interface EventRow {
    id: number;
    title: string;
    status: EventStatus;
    date: string;
    venue: string;
    going: number;
    pending: number;
    /** Stand-in for the invite artwork until uploads are wired. */
    gradient: string;
}

const EVENTS: EventRow[] = [
    { id: 1, title: "Priya & Arjun Wedding", status: "Upcoming", date: "25 May 2025, 07:00 PM", venue: "The Grand Palace, Delhi", going: 124, pending: 8, gradient: "from-rose-100 via-pink-50 to-rose-200" },
    { id: 2, title: "Rahul's 50th Birthday", status: "Upcoming", date: "15 Jun 2025, 06:30 PM", venue: "Le Jardin Banquet, Mumbai", going: 62, pending: 5, gradient: "from-slate-800 via-slate-900 to-black" },
    { id: 3, title: "Ananya's Baby Shower", status: "Upcoming", date: "05 Jul 2025, 04:00 PM", venue: "Silver Oak Club, Bangalore", going: 48, pending: 3, gradient: "from-pink-100 via-rose-50 to-sky-100" },
    { id: 4, title: "Annual Corporate Meet 2025", status: "Past", date: "20 Apr 2025, 10:00 AM", venue: "Hyatt Regency, Pune", going: 150, pending: 0, gradient: "from-indigo-900 via-slate-800 to-slate-900" },
    { id: 5, title: "Mehta Family Housewarming", status: "Draft", date: "28 Jul 2025, 11:00 AM", venue: "Mehta Residence, Ahmedabad", going: 0, pending: 0, gradient: "from-emerald-50 via-lime-50 to-emerald-100" },
    { id: 6, title: "Diwali Celebration 2024", status: "Past", date: "31 Oct 2024, 07:00 PM", venue: "Club Emerald, Jaipur", going: 56, pending: 0, gradient: "from-amber-800 via-orange-900 to-red-900" },
];

const TABS = ["All Events", "Upcoming", "Past", "Drafts"] as const;
type Tab = (typeof TABS)[number];

const STATUS_STYLES: Record<EventStatus, string> = {
    Upcoming: "bg-success/15 text-success",
    Past: "bg-foreground/70 text-background",
    Draft: "bg-warning/20 text-warning",
};

const PAGE_SIZE = 6;

export default function DashboardPage() {
    const [tab, setTab] = useState<Tab>("All Events");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return EVENTS.filter((e) => {
            const matchesTab =
                tab === "All Events" ||
                (tab === "Upcoming" && e.status === "Upcoming") ||
                (tab === "Past" && e.status === "Past") ||
                (tab === "Drafts" && e.status === "Draft");
            const matchesSearch =
                !term ||
                e.title.toLowerCase().includes(term) ||
                e.venue.toLowerCase().includes(term);
            return matchesTab && matchesSearch;
        });
    }, [tab, search]);

    return (
        <div className="flex flex-col gap-6">
            {/* Greeting */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-[26px] font-bold leading-tight tracking-tight text-foreground">
                        Welcome back, Rohan! <span aria-hidden>👋</span>
                    </h1>
                    <p className="mt-1 text-[13.5px] text-muted-foreground">
                        Here&rsquo;s what&rsquo;s happening with your events.
                    </p>
                </div>
                <Button asChild className="h-10 shrink-0 rounded-md px-4 text-[13px] font-semibold">
                    <Link href="/dashboard/events/create">
                        <FontAwesomeIcon icon={faPlus} className="mr-2 !size-[12px]" />
                        Create New Event
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {STATS.map((s) => (
                    <Card key={s.label} className="border border-border shadow-none">
                        <CardContent className="flex items-center gap-4 p-5">
                            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-md", s.bg)}>
                                <FontAwesomeIcon icon={s.icon} className={cn("!size-[16px]", s.tint)} />
                            </span>
                            <div className="min-w-0">
                                {/* tabular-nums so the four figures align down the row */}
                                <p className="text-[24px] font-bold leading-none tabular-nums text-foreground">
                                    {s.value}
                                </p>
                                <p className="mt-1.5 text-[13px] font-medium text-foreground">{s.label}</p>
                                <p className="text-[11.5px] text-muted-foreground">{s.caption}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs + search */}
            <div className="flex flex-col gap-3 border-b border-border pb-0 lg:flex-row lg:items-center lg:justify-between">
                <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={tab === t}
                            onClick={() => setTab(t)}
                            className={cn(
                                "whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] transition-colors",
                                tab === t
                                    ? "border-primary font-semibold text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 pb-3">
                    <div className="relative min-w-0 flex-1 lg:w-[240px] lg:flex-none">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[12px] text-muted-foreground"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search events..."
                            className="h-10 rounded-md pl-9 text-[13px]"
                        />
                    </div>
                    <Button variant="outline" className="h-10 shrink-0 rounded-md px-4 text-[13px] font-medium">
                        <FontAwesomeIcon icon={faFilter} className="mr-2 !size-[12px]" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Event grid */}
            {filtered.length === 0 ? (
                <Card className="border border-border shadow-none">
                    <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                        <FontAwesomeIcon icon={faCalendarDays} className="!size-[26px] text-muted-foreground/40" />
                        <p className="text-[14px] font-semibold text-foreground">No events here</p>
                        <p className="text-[13px] text-muted-foreground">
                            {search ? "Try a different search term." : "Create your first event to get started."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((e) => (
                        <Card
                            key={e.id}
                            className="overflow-hidden border border-border p-0 shadow-none transition-shadow hover:shadow-md"
                        >
                            {/* Artwork stand-in. Swap for <img> once uploads exist —
                                keep the aspect ratio so cards stay on one grid line. */}
                            <div className={cn("relative aspect-[16/10] w-full bg-gradient-to-br", e.gradient)}>
                                <span
                                    className={cn(
                                        "absolute left-3 top-3 rounded px-2 py-1 text-[10.5px] font-semibold",
                                        STATUS_STYLES[e.status]
                                    )}
                                >
                                    {e.status}
                                </span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            aria-label={`Actions for ${e.title}`}
                                            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
                                        >
                                            <FontAwesomeIcon icon={faEllipsisVertical} className="!size-[12px]" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuItem className="text-[12.5px]">Edit event</DropdownMenuItem>
                                        <DropdownMenuItem className="text-[12.5px]">Duplicate</DropdownMenuItem>
                                        <DropdownMenuItem className="text-[12.5px]">Share invite</DropdownMenuItem>
                                        <DropdownMenuItem className="text-[12.5px] text-destructive focus:text-destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex flex-col gap-2.5 p-4">
                                {/* break-words, never truncate — a long event name must
                                    wrap rather than clip mid-word. */}
                                <h3 className="text-[14.5px] font-bold leading-snug text-foreground break-words">
                                    {e.title}
                                </h3>

                                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                                    <FontAwesomeIcon icon={faCalendarDays} className="!size-[11px] shrink-0" />
                                    <span className="break-words">{e.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                                    <FontAwesomeIcon icon={faLocationDot} className="!size-[11px] shrink-0" />
                                    <span className="break-words">{e.venue}</span>
                                </div>

                                <div className="mt-1 flex items-center justify-between gap-3 border-t border-border pt-3">
                                    <div className="flex items-center gap-3 text-[12px]">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                            {e.going} Going
                                        </span>
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-info" />
                                            {e.pending} Pending
                                        </span>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-8 shrink-0 rounded-md border-primary/40 px-3 text-[12px] font-semibold text-primary hover:bg-primary/5 hover:text-primary"
                                    >
                                        <Link href={`/dashboard/events/${e.id}`}>
                                            {e.status === "Draft" ? "Continue Editing" : "View Details"}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination — static until the list is server-paginated. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12.5px] text-muted-foreground">
                    Showing 1 to {Math.min(filtered.length, PAGE_SIZE)} of {EVENTS.length} events
                </p>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" disabled aria-label="Previous page" className="h-8 w-8 rounded-md">
                        <FontAwesomeIcon icon={faChevronLeft} className="!size-[11px]" />
                    </Button>
                    <Button size="icon" aria-label="Page 1" aria-current="page" className="h-8 w-8 rounded-md text-[12px]">
                        1
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Page 2" className="h-8 w-8 rounded-md text-[12px]">
                        2
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Next page" className="h-8 w-8 rounded-md">
                        <FontAwesomeIcon icon={faChevronRight} className="!size-[11px]" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
