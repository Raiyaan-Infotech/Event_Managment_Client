"use client";

import * as React from "react";
import Link from "next/link";
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
    faCrown,
    faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Placeholder identity and notifications.
 *
 * This panel has no login of its own (§INTEGRATION.md), so there is no session
 * to read a name from yet. Swap `currentUser` for the real profile once the
 * session source is decided, and `notifications` for a hook against the
 * backend. Kept as named constants rather than inline JSX so both are one
 * search away.
 */
const currentUser = {
    name: "Rohan Mehta",
    plan: "Premium Plan",
    initials: "RM",
};

const notifications = [
    { id: 1, title: "New RSVP received", detail: "Aditi Sharma is attending Priya & Arjun Wedding", time: "2 minutes ago" },
    { id: 2, title: "Event reminder", detail: "Rahul's 50th Birthday is in 3 days", time: "1 hour ago" },
    { id: 3, title: "Guest list updated", detail: "12 guests added to Ananya's Baby Shower", time: "Yesterday" },
];

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const searchRef = React.useRef<HTMLInputElement>(null);

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    return (
        <header className="sticky top-0 z-40 flex h-[64px] shrink-0 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
            <SidebarTrigger className="h-9 w-9 shrink-0 rounded-md text-muted-foreground hover:bg-secondary" />

            {/* Search */}
            <div className="relative hidden min-w-0 flex-1 max-w-[420px] md:block">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 !size-[13px] text-muted-foreground"
                />
                <Input
                    ref={searchRef}
                    placeholder="Search events, guests, templates..."
                    className="h-10 rounded-md border-border bg-secondary/60 pl-9 pr-14 text-[13px] placeholder:text-muted-foreground"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground">
                    ⌘K
                </kbd>
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <Button
                    asChild
                    variant="outline"
                    className="hidden h-9 rounded-md border-primary/40 px-4 text-[12.5px] font-semibold text-primary hover:bg-primary/5 hover:text-primary sm:inline-flex"
                >
                    <Link href="/dashboard/billing">
                        <FontAwesomeIcon icon={faCrown} className="mr-2 !size-[12px]" />
                        Upgrade Plan
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

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Notifications (${notifications.length} unread)`}
                            className="relative h-9 w-9 rounded-md text-muted-foreground hover:bg-secondary"
                        >
                            <FontAwesomeIcon icon={faBell} className="!size-[14px]" />
                            {notifications.length > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[320px] p-0">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <span className="text-[13px] font-bold">Notifications</span>
                            <button className="flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline">
                                <FontAwesomeIcon icon={faCheckDouble} className="!size-[11px]" />
                                Mark all read
                            </button>
                        </div>
                        <ScrollArea className="max-h-[300px]">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="flex cursor-pointer flex-col gap-0.5 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-secondary/60"
                                >
                                    <span className="text-[12.5px] font-semibold text-foreground">{n.title}</span>
                                    <span className="text-[11.5px] leading-snug text-muted-foreground">{n.detail}</span>
                                    <span className="mt-0.5 text-[10.5px] text-muted-foreground/70">{n.time}</span>
                                </div>
                            ))}
                        </ScrollArea>
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
                                <AvatarFallback className="bg-primary/10 text-[11px] font-bold text-primary">
                                    {currentUser.initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden flex-col items-start leading-tight sm:flex">
                                <span className="text-[12.5px] font-semibold text-foreground">{currentUser.name}</span>
                                <span className="text-[10.5px] text-muted-foreground">{currentUser.plan}</span>
                            </span>
                            <FontAwesomeIcon icon={faChevronDown} className="!size-[10px] text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[210px]">
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
                        <DropdownMenuItem className="text-[12.5px] text-destructive focus:text-destructive">
                            <FontAwesomeIcon icon={faRightFromBracket} className="mr-2.5 !size-[12px]" /> Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
