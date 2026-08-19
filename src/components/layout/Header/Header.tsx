"use client";

import * as React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faGlobe,
    faExpand,
    faCompress,
    faMoon,
    faSun,
    faBell,
    faClock,
    faChevronDown,
    faUser,
    faCog,
    faCreditCard,
    faSignOutAlt,
    faCheckDouble,
    faPlus,
    faChevronDown as faChevronDownSolid,
    faBars,
} from "@fortawesome/free-solid-svg-icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const notifications = [
    {
        id: 1,
        avatar: "https://i.pravatar.cc/40?img=2",
        name: "Malanie Hanvey",
        message: "We should talk about that at lunch!",
        time: "2 minutes ago",
    },
    {
        id: 2,
        avatar: "https://i.pravatar.cc/40?img=3",
        name: "Valentine Maton",
        message: "You can download the latest invoices now.",
        time: "36 minutes ago",
    },
    {
        id: 3,
        avatar: "https://i.pravatar.cc/40?img=4",
        name: "Archie Cantones",
        message: "Don't forget to pickup Jeremy after school!",
        time: "53 minutes ago",
    },
];

export default function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    if (!mounted) {
        return (
            <header className="h-[72px] px-6 flex items-center justify-between bg-card border-b border-border sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="w-10 h-10 border border-border bg-transparent " />
                </div>
            </header>
        );
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    return (
        <header className="h-[56px] pl-3 pr-6 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 min-w-0 overflow-hidden">
            {/* Left Section */}
            <div className="flex flex-1 items-center gap-4 min-w-0">
                <SidebarTrigger className="w-8 h-8 flex items-center justify-center rounded-sm border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200" />

                {/* <div className="h-6 w-px bg-border hidden lg:block" />

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="size-7 bg-primary text-white !rounded-full hover:bg-primary/90 hidden sm:flex">
                        <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                    </Button>
                    <Button
  variant="ghost"
  className="h-9 px-5 bg-white border border-gray-300 text-gray-700 
             font-semibold text-xs rounded-md 
             hover:bg-accent hover:text-primary hover:border-primary 
             hidden lg:flex items-center justify-center 
             tracking-wide transition-colors"
>
  MEGA MENU
</Button>
                </div> */}



                <div className="relative group hidden lg:block">
                    {/* <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 !size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search everything..."
                        className="pl-10 w-[240px] h-10 bg-muted/50 border-transparent focus:bg-card focus:border-primary/30 rounded-xl transition-all text-[13px]"
                    /> */}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end gap-1.5 md:gap-2 shrink-0">
                {/* Search */}
                <Button variant="ghost" size="icon" className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200">
                    <FontAwesomeIcon icon={faSearch} width={16} />
                </Button>

                {/* Language */}
                <Button variant="ghost" size="icon" className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200">
                    <img src="https://flagcdn.com/us.svg" className="w-5 h-3.5 rounded-sm" alt="US" />
                </Button>

                {/* Fullscreen */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hidden sm:flex items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200"
                    onClick={toggleFullscreen}
                >
                    {fullscreen ? <FontAwesomeIcon icon={faCompress} width={16} /> : <FontAwesomeIcon icon={faExpand} width={16} />}
                </Button>

                {/* Settings/Clock */}
                <Button variant="ghost" size="icon" className="w-8 h-8 hidden md:flex items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200">
                    <FontAwesomeIcon icon={faClock} width={16} />
                </Button>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-primary hover:border-primary transition-all duration-200" onClick={toggleTheme}>
                    {theme === "dark" ? <FontAwesomeIcon icon={faSun} width={16} /> : <FontAwesomeIcon icon={faMoon} width={16} />}
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 flex items-center justify-center p-0 bg-transparent hover:bg-accent data-[state=open]:bg-accent border border-border hover:border-primary/30 transition-all rounded-lg text-muted-foreground hover:text-primary outline-none">
                            <div className="relative">
                                <FontAwesomeIcon icon={faBell} width={16} />
                                <span className="absolute -top-0.5 -right-0.5 size-2 bg-rose-500 rounded-full border-2 border-background" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[320px] p-0 border-border rounded-2xl shadow-xl mt-2 overflow-hidden">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                            <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                            <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/5 font-bold">
                                <FontAwesomeIcon icon={faCheckDouble} className="!size-3 mr-1" /> Mark all read
                            </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                            <div className="p-0">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 border-b border-border/50 last:border-0 hover:bg-accent/5 cursor-pointer transition-colors">
                                        <div className="flex gap-3 w-full">
                                            <Avatar className="size-10">
                                                <AvatarImage src={n.avatar} />
                                                <AvatarFallback className="bg-muted text-muted-foreground">{n.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-[13px] text-foreground">{n.name}</span>
                                                <p className="text-[12.5px] text-muted-foreground line-clamp-1">{n.message}</p>
                                                <span className="text-[11px] text-muted-foreground/60 mt-1">{n.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-3 text-center border-t border-border bg-card">
                            <Button variant="link" className="text-xs text-primary font-bold h-auto p-0">View All Notifications</Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 cursor-pointer group outline-none">
                            <Avatar className="size-10 border-0 border-border rounded-xxl group-hover:border-primary/30 transition-colors">
                                <AvatarImage src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100&h=100&auto=format&fit=crop" />
                                <AvatarFallback className="bg-muted text-muted-foreground">AD</AvatarFallback>
                            </Avatar>
                            {/* <div className="hidden lg:flex flex-col text-left leading-none">
                                    <span className="font-extrabold text-[14px] text-foreground">Alexandra Della</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">Premium Plan</span>
                                </div> */}
                            {/* <FontAwesomeIcon icon={faChevronDown} className="!size-3 text-muted-foreground group-hover:text-primary transition-colors hidden lg:block" /> */}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[220px] p-2 rounded-2xl shadow-xl mt-2 border-border">
                        <div className="p-3">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-foreground">Alexandra Della</span>
                                <span className="font-medium text-[11px] text-muted-foreground">alex@raiyaaninfotech.com</span>
                            </div>
                        </div>
                        <div className="h-px bg-border my-1" />
                        <div className="p-1">
                            <DropdownMenuItem className="flex items-center rounded-xl h-10 px-2 cursor-pointer font-medium text-[13px] transition-colors">
                                <FontAwesomeIcon icon={faUser} className="!size-3.5 mr-2" /> Profile Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center rounded-xl h-10 px-2 cursor-pointer font-medium text-[13px] transition-colors">
                                <FontAwesomeIcon icon={faCog} className="!size-3.5 mr-2" /> Account Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center rounded-xl h-10 px-2 cursor-pointer font-medium text-[13px] transition-colors">
                                <FontAwesomeIcon icon={faCreditCard} className="!size-3.5 mr-2" /> Billing
                            </DropdownMenuItem>
                        </div>
                        <div className="h-px bg-border my-1" />
                        <DropdownMenuItem className="flex items-center rounded-xl h-10 px-2 text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer font-bold text-[13px] m-1 transition-colors">
                            <FontAwesomeIcon icon={faSignOutAlt} className="!size-3.5 mr-2" /> Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
