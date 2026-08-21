"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faGift, faCrown, faHeadset } from "@fortawesome/free-solid-svg-icons"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { navMain } from "@/lib/navigation"
import { useClientProfile } from "@/hooks/use-client-portal"

/**
 * Client portal sidebar.
 *
 * Two differences from the template's version, both driven by the design:
 *  - Items are flat by default. Only an entry that actually has children gets
 *    a chevron and a collapsible; the template rendered a chevron on every row
 *    including ones with nothing to expand.
 *  - The footer carries the upgrade and help cards, hidden when collapsed.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [openMenu, setOpenMenu] = React.useState<string | null>(null)
    const [mounted, setMounted] = React.useState(false)
    const profile = useClientProfile()

    React.useEffect(() => setMounted(true), [])

    /**
     * Which row to highlight.
     *
     * Exact match alone was wrong: on `/dashboard/events/5` NOTHING lit up, so
     * an event detail page looked like it belonged to no section at all.
     *
     * Prefix matching alone is wrong too, in the other direction — every
     * `/dashboard/...` route is a prefix match for `/dashboard`, which would
     * keep the Dashboard row lit on every screen in the app.
     *
     * So: exact always wins, and a prefix only counts when no OTHER nav entry
     * claims the path more specifically. That is what keeps
     * `/dashboard/events/create` on "Create New Event" rather than on
     * "My Events", which is also a prefix of it.
     */
    const allUrls = React.useMemo(
        () => navMain.flatMap((i) => [i.url, ...(i.items ?? []).map((s) => s.url)]).filter((u) => u && u !== "#"),
        []
    )


    const isActive = (url: string) => {
        if (!url || url === "#") return false
        if (pathname === url) return true
        if (!pathname.startsWith(`${url}/`)) return false
        // A longer entry that also matches owns the highlight instead.
        return !allUrls.some(
            (other) => other !== url && other.length > url.length &&
                (pathname === other || pathname.startsWith(`${other}/`))
        )
    }

    /**
     * Open the group the current route lives in.
     *
     * `openMenu` starts null, so landing on /dashboard/guests/groups left
     * "Guests" COLLAPSED with nothing visibly selected — the nav simply did not
     * reflect where you were. Keyed on `pathname` so it re-opens on every
     * navigation, including a browser back.
     *
     * It sets rather than merges, which also closes whichever group you came
     * from: two open groups on a ten-item sidebar means scrolling to find
     * anything.
     */
    React.useEffect(() => {
        const owner = navMain.find(
            (item) => (item.items?.length ?? 0) > 0
                && item.items.some((sub) => (sub as { ready?: boolean }).ready !== false && isActive(sub.url))
        )
        // Only auto-close for a route that belongs to a group. Navigating to a
        // flat item should leave a group the user opened by hand alone.
        if (owner) setOpenMenu(owner.title)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname])

    if (!mounted) return null

    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-sidebar" {...props}>
            <SidebarHeader
                className={cn(
                    "sticky top-0 z-50 h-[64px] border-b border-border flex flex-col justify-center bg-sidebar",
                    isCollapsed ? "px-1.5" : "px-4"
                )}
            >
                <Link
                    href="/dashboard"
                    className={cn("flex items-center gap-2.5 no-underline", isCollapsed && "justify-center")}
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <FontAwesomeIcon icon={faGift} className="!size-[16px]" />
                    </span>
                    {!isCollapsed && (
                        <span className="text-[17px] font-bold tracking-tight leading-none whitespace-nowrap">
                            <span className="text-foreground">Event</span>{" "}
                            <span className="text-primary">Invite</span>
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent className={cn("py-4 bg-sidebar", isCollapsed ? "px-1" : "px-3")}>
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-1">
                        {navMain.map((item) => {
                            const hasChildren = (item.items?.length ?? 0) > 0
                            const groupActive =
                                isActive(item.url) || item.items?.some((s) => isActive(s.url))

                            // A parent whose CHILD is active gets the label weight but
                            // not the filled background — otherwise the group header and
                            // the selected child both look selected, and the eye cannot
                            // tell which one it is actually on.
                            const childActive = (item.items ?? []).some((s) => isActive(s.url))
                            const selfActive = isActive(item.url)

                            const buttonClasses = cn(
                                "h-[38px] rounded-md transition-colors !outline-none !ring-0 focus-visible:ring-0",
                                selfActive && !hasChildren
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                    : childActive || selfActive
                                        ? "bg-transparent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
                                        : "bg-transparent text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                                isCollapsed ? "px-0 justify-center" : "px-3"
                            )

                            // A row with nothing to expand is a plain link — no
                            // chevron, no collapsible, one click to navigate.
                            if (!hasChildren) {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} className={buttonClasses}>
                                            <Link href={item.url} className="flex items-center gap-2.5">
                                                {item.icon && (
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        className={cn(
                                                            "!size-[15px] shrink-0",
                                                            groupActive ? "text-primary" : "text-sidebar-foreground/60"
                                                        )}
                                                    />
                                                )}
                                                <span className="text-[13px] group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            }

                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    open={openMenu === item.title}
                                    onOpenChange={(o) => setOpenMenu(o ? item.title : null)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            {/* The icon sat in its own flex wrapper with a
                                                gap and one child — the gap did nothing and the
                                                wrapper broke alignment against the flat rows,
                                                which put icon and label in ONE flex parent. */}
                                            <SidebarMenuButton tooltip={item.title} className={cn(buttonClasses, "flex items-center gap-2.5")}>
                                                {item.icon && (
                                                    <FontAwesomeIcon
                                                        icon={item.icon}
                                                        className={cn(
                                                            "!size-[15px] shrink-0",
                                                            groupActive ? "text-primary" : "text-sidebar-foreground/60"
                                                        )}
                                                    />
                                                )}
                                                <span className="text-[13px] group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                                {!isCollapsed && (
                                                    <FontAwesomeIcon
                                                        icon={faChevronDown}
                                                        className="ml-auto !size-3 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                                                    />
                                                )}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            {/*
                                              ml-3.5 aligns the guide with the CENTRE of the
                                              parent's 15px icon rather than past it, so the
                                              line reads as descending from the parent row.
                                              gap-0.5 + py-1.5 stop the children stacking into
                                              one block; pl-2 keeps the labels off the guide.
                                            */}
                                            <SidebarMenuSub className="ml-3.5 gap-0.5 border-l border-sidebar-border/70 py-1.5 pl-2 pr-0">
                                                {item.items?.map((sub) => {
                                                    // Not built yet: shown, but not as a link.
                                                    if ((sub as { ready?: boolean }).ready === false) {
                                                        return (
                                                            <SidebarMenuSubItem key={sub.title}>
                                                                <div
                                                                    aria-disabled
                                                                    title="Not available yet"
                                                                    className="flex h-[30px] cursor-not-allowed items-center gap-2 rounded-md px-2.5 text-[12.5px] text-sidebar-foreground/40"
                                                                >
                                                                    <span className="min-w-0 flex-1 truncate">{sub.title}</span>
                                                                    <span className="shrink-0 rounded bg-sidebar-accent px-1.5 py-0 text-[8.5px] font-semibold uppercase tracking-wide text-sidebar-foreground/60">
                                                                        Soon
                                                                    </span>
                                                                </div>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    }
                                                    return (
                                                    <SidebarMenuSubItem key={sub.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isActive(sub.url)}
                                                            className="h-[30px] rounded-md !outline-none !ring-0"
                                                        >
                                                            <Link
                                                                href={sub.url}
                                                                className={cn(
                                                                    "relative flex h-full items-center px-2.5 !text-[12.5px] transition-colors",
                                                                    isActive(sub.url)
                                                                        // A tinted pill, not just coloured text: on a
                                                                        // list of four the colour alone was too weak
                                                                        // to find at a glance.
                                                                        ? "bg-primary/10 font-semibold text-primary"
                                                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                                                )}
                                                            >
                                                                {/* Covers the guide line beside the active row, so
                                                                    the marker reads as attached to it. */}
                                                                {isActive(sub.url) && (
                                                                    <span
                                                                        aria-hidden
                                                                        className="absolute -left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary"
                                                                    />
                                                                )}
                                                                <span className="min-w-0 truncate">{sub.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                    )
                                                })}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-3 p-3 group-data-[collapsible=icon]:hidden">
                {/*
                  The client's ACTUAL plan, from /client/me. This card used to read
                  "Upgrade to Premium" unconditionally, which is wrong twice over:
                  it told a client on the top plan to upgrade, and its "Upgrade Now"
                  button had no href and no handler at all.
                */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/10">
                        <FontAwesomeIcon icon={faCrown} className="!size-[15px] text-primary" />
                    </span>
                    {profile.isLoading ? (
                        <Skeleton className="mx-auto mt-2.5 h-4 w-[110px]" />
                    ) : (
                        <p className="mt-2.5 text-[13px] font-bold text-foreground break-words">
                            {profile.data?.plan?.name ?? "No plan assigned"}
                        </p>
                    )}
                    <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                        {profile.data?.plan
                            ? "Your current subscription. What you can create is set by this plan."
                            : "Contact us to have a subscription plan assigned to your account."}
                    </p>
                    <Button asChild size="sm" className="mt-3 h-8 w-full rounded-md text-[12px] font-semibold">
                        <Link href="/dashboard/billing">View Plan</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/60 p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-background">
                        <FontAwesomeIcon icon={faHeadset} className="!size-[13px] text-primary" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[12.5px] font-semibold text-foreground">Need Help?</p>
                        <p className="text-[11.5px] text-muted-foreground">
                            Visit{" "}
                            <Link href="/dashboard/help" className="text-primary hover:underline">
                                Help Center
                            </Link>
                        </p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
