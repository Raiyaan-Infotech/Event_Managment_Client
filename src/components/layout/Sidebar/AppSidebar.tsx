"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
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
    faChevronDown,
    faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons"

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
    SidebarGroupLabel,
    useSidebar,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { navMain } from "@/lib/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const [openMenu, setOpenMenu] = React.useState<string | null>(null)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar" {...props}>
            <SidebarHeader className={`sticky top-0 z-50 h-[56px] border-b border-border/50 flex flex-col justify-center bg-sidebar/95 backdrop-blur-sm transition-all duration-300 ${isCollapsed ? "px-1.5" : "pl-3 pr-4"}`}>
                <Link href="/dashboard" className={`flex items-center no-underline relative w-full h-10 overflow-hidden ${isCollapsed ? "justify-center" : "justify-start"}`}>
                    {/* Logo (Visible when collapsed) */}
                    <div className={`h-9 w-9 shrink-0 border-none rounded-sm overflow-hidden shadow-[0_4px_12px_rgba(52,84,209,0.3)] relative transition-all duration-300 flex items-center justify-center
                        ${isCollapsed ? "opacity-100 scale-100 translate-x-0 rotate-0" : "opacity-0 scale-50 -translate-x-10 -rotate-12 absolute"}`}>
                        <Image
                            src="/ra_logo.png"
                            alt="Logo"
                            fill
                            priority
                            className="object-cover rounded-none"
                        />
                    </div>

                    {/* Text (Visible when expanded) */}
                    <div className={`flex flex-col transition-all duration-300 h-full justify-center whitespace-nowrap
                        ${!isCollapsed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 absolute pointer-events-none"}`}>
                        <h1 className="text-[19px] font-extrabold tracking-tight text-sidebar-foreground m-0 p-0 leading-none">
                            Raiyaan Infotech
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[1px] text-muted-foreground m-0 p-0 mt-1">
                            Admin Panel
                        </p>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent className={`py-4 bg-sidebar transition-all duration-300 ${isCollapsed ? "px-1" : "px-4"}`}>
                <SidebarGroup className="p-0">
                    {/* <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 mb-5 text-[12px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground/60">
                        Navigation
                    </SidebarGroupLabel> */}
                    <SidebarMenu className="gap-1">
                        {navMain.map((item) => {
                            const isGroupActive = item.items?.some((sub) => sub.url === pathname) || pathname === item.url

                            return (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    open={openMenu === item.title}
                                    onOpenChange={(isOpen) => setOpenMenu(isOpen ? item.title : null)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                className={`h-[34px] rounded-sm transition-all duration-200 group/btn bg-transparent hover:bg-sidebar-accent dark:hover:bg-[#1b55e2] hover:text-sidebar-accent-foreground dark:hover:text-white !outline-none !ring-0 focus-visible:ring-0 active:bg-transparent ${isGroupActive ? "text-sidebar-accent-foreground font-bold bg-sidebar-accent" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"} group-data-[state=open]/collapsible:text-sidebar-accent-foreground dark:group-data-[state=open]/collapsible:text-white group-data-[state=open]/collapsible:bg-sidebar-accent dark:group-data-[state=open]/collapsible:bg-[#1b55e2] ${isCollapsed ? "px-0 justify-center" : "px-3.5"}`}
                                            >
                                                <div className={`flex items-center justify-center ${isCollapsed ? "w-full px-1" : "gap-0.5"}`}>
                                                    {item.icon && <FontAwesomeIcon icon={item.icon} className={`!size-[14px] transition-colors ${isGroupActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-hover/btn:text-sidebar-accent-foreground group-data-[state=open]/collapsible:text-sidebar-accent-foreground"}`} />}
                                                </div>
                                                <span className="text-[12px] font-semibold group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                {!isCollapsed && (
                                                    <FontAwesomeIcon icon={faChevronDown} className={`ml-auto !size-3 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180 ${isGroupActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 group-data-[state=open]/collapsible:text-sidebar-accent-foreground"}`} />
                                                )}
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub className="ml-4 border-l-0 px-0 py-1 space-y-0">
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={pathname === subItem.url} className={`h-8 ${pathname === subItem.url ? "bg-sidebar-accent dark:bg-[#1b55e2]" : "bg-transparent"} hover:bg-sidebar-accent dark:hover:bg-[#1b55e2] !outline-none !ring-0 focus-visible:ring-0 active:bg-transparent rounded-sm`}>
                                                            <Link
                                                                href={subItem.url}
                                                                className={`flex items-center h-full pl-3 pr-4 py-1 !text-[12px] !font-semibold transition-all rounded-sm !outline-none !ring-0 ${pathname === subItem.url
                                                                    ? "text-primary font-bold dark:text-white"
                                                                    : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground dark:hover:text-white"
                                                                    }`}
                                                            >
                                                                <span>{subItem.title}</span>
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
            {/* <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
                <Card className="rounded-2xl bg-slate-50 p-4 border-slate-100 shadow-none">
                    <CardContent className="p-0 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            </div>
                            <span className="text-[12px] font-bold text-slate-900">Systems Operational</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last updated: 2 mins ago</p>
                    </CardContent>
                </Card>
            </SidebarFooter> */}
        </Sidebar>
    )
}
