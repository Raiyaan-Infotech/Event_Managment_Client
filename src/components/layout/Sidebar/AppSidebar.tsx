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
import { cn } from "@/lib/utils"
import { navMain } from "@/lib/navigation"

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

    React.useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const isActive = (url: string) => pathname === url

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

                            const buttonClasses = cn(
                                "h-[38px] rounded-md transition-colors !outline-none !ring-0 focus-visible:ring-0",
                                groupActive
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
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
                                            <SidebarMenuButton tooltip={item.title} className={buttonClasses}>
                                                <div className="flex items-center gap-2.5">
                                                    {item.icon && (
                                                        <FontAwesomeIcon
                                                            icon={item.icon}
                                                            className={cn(
                                                                "!size-[15px] shrink-0",
                                                                groupActive ? "text-primary" : "text-sidebar-foreground/60"
                                                            )}
                                                        />
                                                    )}
                                                </div>
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
                                            <SidebarMenuSub className="ml-5 border-l border-border px-0 py-1">
                                                {item.items?.map((sub) => (
                                                    <SidebarMenuSubItem key={sub.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isActive(sub.url)}
                                                            className="h-8 rounded-md !outline-none !ring-0"
                                                        >
                                                            <Link
                                                                href={sub.url}
                                                                className={cn(
                                                                    "flex h-full items-center pl-3 pr-3 !text-[12.5px]",
                                                                    isActive(sub.url)
                                                                        ? "text-primary font-semibold"
                                                                        : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                                                                )}
                                                            >
                                                                {sub.title}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
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
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/10">
                        <FontAwesomeIcon icon={faCrown} className="!size-[15px] text-primary" />
                    </span>
                    <p className="mt-2.5 text-[13px] font-bold text-foreground">Upgrade to Premium</p>
                    <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
                        Unlock premium templates, advanced analytics and more.
                    </p>
                    <Button size="sm" className="mt-3 h-8 w-full rounded-md text-[12px] font-semibold">
                        Upgrade Now
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
