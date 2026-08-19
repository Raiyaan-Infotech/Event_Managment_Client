"use client"

import { ScreenType, SCREEN_TEMPLATES } from "./types"
import {
    Sparkle,
    LogIn,
    Home,
    CalendarDays,
    Users,
    Info,
    MapPin,
    Layout,
    Palette,
    UserPlus,
    Heart,
    Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const icons: Record<string, any> = {
    theme: Palette,
    register: UserPlus,
    login: LogIn,
    splash: Sparkle,
    splash2: Sparkle,
    splash3: Sparkle,
    home: Home,
    agenda: CalendarDays,
    relatives: Heart,
    participants: Users,
    eventInfo: Info,
    venue: MapPin,
}

interface ThemeLeftSidebarProps {
    selectedScreen: ScreenType;
    onSelectScreen: (type: ScreenType) => void;
    isThemeApplied: boolean;
    numSplashScreens: number;
}

export default function ThemeLeftSidebar({ selectedScreen, onSelectScreen, isThemeApplied, numSplashScreens }: ThemeLeftSidebarProps) {
    const screens: ScreenType[] = ["theme", "register", "login", "splash"];

    if (numSplashScreens >= 2) screens.push("splash2");
    if (numSplashScreens >= 3) screens.push("splash3");

    screens.push("home", "agenda", "relatives", "participants", "eventInfo", "venue");

    return (
        <Sidebar
            collapsible="none"
            style={{ "--sidebar-width": "280px" } as React.CSSProperties}
            className="border-r border-border/50 bg-sidebar h-full"
        >
            <SidebarHeader className="h-[56px] border-b border-border/50 flex flex-col justify-center px-4 bg-sidebar/95 backdrop-blur-sm">
                <h2 className="text-[11px] font-extrabold text-primary uppercase tracking-[1.5px] mb-0">Event Menu</h2></SidebarHeader>

            <SidebarContent className="py-4 px-2 chat-scrollbar">
                <SidebarMenu className="space-y-0 text-slate-800">
                    {screens.map((type) => {
                        const config = SCREEN_TEMPLATES[type];
                        const Icon = icons[type];
                        const isActive = selectedScreen === type;

                        return (
                            <SidebarMenuItem key={type}>
                                <SidebarMenuButton
                                    onClick={() => onSelectScreen(type)}
                                    isActive={isActive}
                                    className={cn(
                                        "h-[34px] px-3.5 rounded-sm transition-all duration-200 group/btn !outline-none !ring-0",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm"
                                            : "bg-transparent text-slate-500 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                >
                                    <div className="flex items-center justify-center shrink-0 relative">
                                        <Icon
                                            size={14}
                                            strokeWidth={isActive ? 3 : 2.5}
                                            className={cn(
                                                "transition-colors",
                                                isActive ? "text-sidebar-accent-foreground" : "text-slate-400 group-hover/btn:text-sidebar-accent-foreground group-hover/btn:[stroke-width:3]"
                                            )}
                                        />
                                    </div>
                                    <span className={cn(
                                        "text-[12px] font-semibold transition-all truncate flex-1",
                                        isActive ? "translate-x-0.5" : "group-hover/btn:translate-x-0.5"
                                    )}>
                                        {config.label}
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}
