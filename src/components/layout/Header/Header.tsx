"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faExpand,
    faCompress,
    faMoon,
    faSun,
    faBell,
    faChevronDown,
    faUser,
    faGear,
    faCreditCard,
    faRightFromBracket,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useClientProfile, useLogout } from "@/hooks/use-client-portal";

/**
 * Top bar.
 *
 * ── WHAT WAS FAKE HERE, AND IS NOT ANY MORE ──────────────────────────────────
 * This file shipped with a `currentUser` constant reading "Rohan Mehta /
 * Premium Plan / RM" and three invented notification rows behind a red "3"
 * badge. Both looked exactly like working features. The identity now comes from
 * `GET /client/me` and the plan name is the client's real one.
 *
 * NOTIFICATIONS have no endpoint at all, so the bell shows an empty state and
 * carries NO badge. An unread count is a claim; inventing one trains people to
 * ignore the bell.
 *
 * SEARCH now goes somewhere: it hands the term to My Events, which is the only
 * screen that can search anything. It previously focused on ⌘K and did nothing
 * with what you typed.
 *
 * SIGN OUT calls the real logout route and leaves the portal.
 */

/** Initials from a display name — "Test Client" → "TC", "Jamal" → "JA". */
function initialsOf(name: string | undefined): string {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [term, setTerm] = React.useState("");
    const searchRef = React.useRef<HTMLInputElement>(null);

    const profile = useClientProfile();
    const logout = useLogout();

    React.useEffect(() => setMounted(true), []);

    // ⌘K / Ctrl+K focuses search — the hint in the field has to actually work,
    // or it is decoration that teaches the wrong shortcut.
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = term.trim();
        // Empty search goes to the unfiltered list rather than doing nothing —
        // pressing Enter on a blank box should still take you somewhere.
        router.push(q ? `/dashboard/events?search=${encodeURIComponent(q)}` : "/dashboard/events");
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const client = profile.data;
    const planName = client?.plan?.name;

    return (
        <header className="sticky top-0 z-40 flex h-[64px] shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
            <SidebarTrigger className="h-9 w-9 shrink-0 rounded-md text-muted-foreground hover:bg-secondary" />

            {/* Search — a real form, so Enter submits and the browser treats it
                as one. Events are the only searchable thing today, so it says so
                rather than promising guests and templates as well. */}
            <form onSubmit={submitSearch} className="relative hidden min-w-0 max-w-[420px] flex-1 md:block">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[13px] text-muted-foreground"
                />
                <Input
                    ref={searchRef}
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Search your events..."
                    aria-label="Search your events"
                    className="h-10 rounded-md border-border bg-secondary/60 pl-9 pr-14 text-[13px] placeholder:text-muted-foreground"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground">
                    ⌘K
                </kbd>
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <Button
                    asChild
                    className="hidden h-9 rounded-md px-4 text-[12.5px] font-semibold sm:inline-flex"
                >
                    <Link href="/dashboard/events/create">
                        <FontAwesomeIcon icon={faPlus} className="mr-2 !size-[12px]" />
                        New Event
                    </Link>
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    aria-label="Toggle fullscreen"
                    className="hidden h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary lg:inline-flex"
                >
                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="!size-[14px]" />
                </Button>

                {/* Rendered only after mount — `theme` is undefined on the server,
                    so rendering the icon during SSR guarantees a hydration
                    mismatch on every load. */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                        className="h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary"
                    >
                        <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} className="!size-[14px]" />
                    </Button>
                )}

                {/* Notifications — no endpoint exists, so no badge and an honest
                    empty state. See the header comment. */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Notifications"
                            className="h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary"
                        >
                            <FontAwesomeIcon icon={faBell} className="!size-[14px]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[300px] p-0">
                        <DropdownMenuLabel className="px-4 py-3 text-[13px] font-bold">
                            Notifications
                        </DropdownMenuLabel>
                        <Separator />
                        <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
                            <FontAwesomeIcon icon={faBell} className="!size-[18px] text-muted-foreground/40" />
                            <p className="text-[12.5px] font-semibold text-foreground">You&rsquo;re all caught up</p>
                            <p className="text-[11.5px] leading-snug text-muted-foreground">
                                Event and RSVP notifications will appear here.
                            </p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                "flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-secondary",
                                "!outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                        >
                            <Avatar className="h-8 w-8">
                                {/* Conditional, with a key — a bare src={undefined}
                                    does not reliably trigger the fallback. */}
                                {client?.avatar_url && (
                                    <AvatarImage key={client.avatar_url} src={client.avatar_url} alt="" />
                                )}
                                <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                                    {initialsOf(client?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden flex-col items-start leading-tight sm:flex">
                                {profile.isLoading ? (
                                    <>
                                        <Skeleton className="h-3 w-[86px]" />
                                        <Skeleton className="mt-1 h-2.5 w-[60px]" />
                                    </>
                                ) : (
                                    <>
                                        <span className="max-w-[140px] truncate text-[12.5px] font-semibold text-foreground">
                                            {client?.name ?? "Not signed in"}
                                        </span>
                                        <span className="max-w-[140px] truncate text-[10.5px] text-muted-foreground">
                                            {planName ?? "No plan assigned"}
                                        </span>
                                    </>
                                )}
                            </span>
                            <FontAwesomeIcon icon={faChevronDown} className="!size-[10px] text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px]">
                        <DropdownMenuLabel className="flex flex-col gap-0.5">
                            <span className="truncate text-[12.5px] font-semibold">
                                {client?.name ?? "Not signed in"}
                            </span>
                            {client?.email && (
                                <span className="truncate text-[11px] font-normal text-muted-foreground">
                                    {client.email}
                                </span>
                            )}
                            {planName && (
                                <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
                                    {planName}
                                </Badge>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="text-[12.5px]">
                                <FontAwesomeIcon icon={faUser} className="mr-2.5 !size-[12px]" /> My Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/billing" className="text-[12.5px]">
                                <FontAwesomeIcon icon={faCreditCard} className="mr-2.5 !size-[12px]" /> Billing
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="text-[12.5px]">
                                <FontAwesomeIcon icon={faGear} className="mr-2.5 !size-[12px]" /> Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={logout.isPending}
                            onSelect={(e) => { e.preventDefault(); logout.mutate(); }}
                            className="text-[12.5px] text-destructive focus:text-destructive"
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="mr-2.5 !size-[12px]" />
                            {logout.isPending ? "Signing out..." : "Sign out"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
