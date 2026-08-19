"use client"

import * as React from "react"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faSearch,
    faThLarge,
    faList,
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faFlag,
    faUser,
    faTags,
    faChevronCircleDown,
    faEye,
    faFolderOpen,
    faStar,
    faTrash,
    faEllipsisV,
    faCircle,
    faHdd,
    faCheck,
    faBriefcase,
    faShareNodes,
    faArchive,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Footer from "@/components/layout/Footer/Footer"

const categories = [
    { name: "Alls", icon: faHdd, count: 24, active: true },
    { name: "Tasks", icon: faCheck, count: 4, color: "text-rose-500" },
    { name: "Works", icon: faBriefcase, count: 8, color: "text-emerald-500" },
    { name: "Social", icon: faShareNodes, count: 6, color: "text-primary" },
    { name: "Archive", icon: faArchive, count: 5, color: "text-slate-500" },
    { name: "Priority", icon: faStar, count: 2, color: "text-amber-500" },
    { name: "Personal", icon: faUser, count: 3, color: "text-violet-500" },
    { name: "Business", icon: faBriefcase, count: 8, color: "text-emerald-500" },
    { name: "Important", icon: faFlag, count: 2, color: "text-rose-500" },
]

const labels = [
    { name: "Personal", color: "bg-violet-500" },
    { name: "Social", color: "bg-primary" },
    { name: "Business", color: "bg-emerald-500" },
    { name: "Tasks", color: "bg-rose-500" },
    { name: "Important", color: "bg-rose-500" },
]

const notesContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis vitae iure, quo harum excepturi laudantium eum earum accusantium labore libero maiores illo soluta."

const initialNotes = [
    { id: 1, title: "Nightout with friends", date: "01 August 2023", category: "Social", color: "border-l-primary", dot: "bg-primary", isFavorite: false },
    { id: 2, title: "Launch new template", date: "21 January 2023", category: "Works", color: "border-l-emerald-500", dot: "bg-emerald-500", isFavorite: false },
    { id: 3, title: "Change a Design", date: "25 December 2023", category: "Social", color: "border-l-primary", dot: "bg-primary", isFavorite: false },
    { id: 4, title: "Give review for foods", date: "18 December 2023", category: "Priority", color: "border-l-amber-500", dot: "bg-amber-500", isFavorite: false },
    { id: 5, title: "Give salary to employee", date: "15 February 2023", category: "Business", color: "border-l-emerald-500", dot: "bg-emerald-500", isFavorite: false },
    { id: 6, title: "Nightout with friends", date: "01 August 2023", category: "Personal", color: "border-l-violet-500", dot: "bg-violet-500", isFavorite: false },
    { id: 7, title: "Go for lunch", date: "01 April 2023", category: "Business", color: "border-l-emerald-500", dot: "bg-emerald-500", isFavorite: false },
    { id: 8, title: "Meeting with Mr.Jojo", date: "19 October 2023", category: "Social", color: "border-l-primary", dot: "bg-primary", isFavorite: false },
    { id: 9, title: "Nightout with friends", date: "01 August 2023", category: "Tasks", color: "border-l-rose-500", dot: "bg-rose-500", isFavorite: false },
    { id: 10, title: "Give salary to employee", date: "15 February 2023", category: "Important", color: "border-l-rose-500", dot: "bg-rose-500", isFavorite: false },
]

export default function NotesPage() {
    const [notes, setNotes] = useState(initialNotes)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [searchVisible, setSearchVisible] = useState(false)
    const [activeCategory, setActiveCategory] = useState("Alls")

    return (
        <div className="flex w-full h-full overflow-hidden bg-background">
            {/* Notes Sidebar */}
            <div className="w-[280px] h-full border-r border-border bg-card flex flex-col shrink-0">
                <div className="h-[72px] px-6 flex items-center border-b border-border">
                    <h2 className="text-[18px] font-bold text-foreground m-0">Notes</h2>
                </div>

                <div className="p-6">
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all border-none">
                        <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                        <span className="text-[13px]">ADD NOTES</span>
                    </Button>
                </div>

                <ScrollArea className="flex-1 px-3 pb-6">
                    <div className="flex flex-col gap-0.5">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-2.5 rounded-lg transition-all group",
                                    activeCategory === cat.name
                                        ? "bg-accent text-primary"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon
                                        icon={cat.icon}
                                        className={cn("size-[15px]", activeCategory === cat.name ? "text-primary" : cat.color)}
                                    />
                                    <span className="text-[14px] font-semibold">{cat.name}</span>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    activeCategory === cat.name ? "bg-background text-primary shadow-sm" : "bg-muted text-muted-foreground"
                                )}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* <div className="mt-8 px-4">
                        <h6 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[1.5px] mb-5">LABELS</h6>
                        <div className="flex flex-col gap-4">
                            {labels.map((label) => (
                                <button key={label.name} className="flex items-center gap-3 text-[13.5px] font-semibold text-muted-foreground hover:text-primary transition-colors w-fit group">
                                    <div className={cn("size-2 rounded-full", label.color)}></div>
                                    <span>{label.name}</span>
                                </button>
                            ))}
                        </div>
                    </div> */}
                </ScrollArea>


            </div>

            {/* Notes Content */}
            <div className="flex-1 h-full flex flex-col min-w-0 bg-background/50 overflow-y-auto chat-scrollbar transition-colors duration-500">
                <div className="flex flex-col flex-1">
                    {/* Apps Header (Sticky) */}
                    <div className="h-[64px] bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 text-[14px] font-bold text-foreground hover:text-primary transition-colors border-none bg-transparent uppercase tracking-wider">
                                        PROJECT NOTES <FontAwesomeIcon icon={faChevronDown} className="size-2.5" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[180px] p-1 shadow-xl border-border bg-card">
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">Personal Notes</DropdownMenuItem>
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">Team Notes</DropdownMenuItem>
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">Archive Notes</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex items-center gap-1.5 ml-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-border"
                                >
                                    <FontAwesomeIcon icon={faEye} className="size-[15px]" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 rounded-lg hover:bg-accent transition-all text-muted-foreground hover:text-primary border border-transparent hover:border-border"
                                >
                                    <FontAwesomeIcon icon={faTags} className="size-[15px]" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground hover:bg-accent border border-transparent hover:border-border">
                                    <FontAwesomeIcon icon={faFolderOpen} className="size-[15px]" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("size-9 text-muted-foreground hover:bg-accent rounded-lg border border-transparent hover:border-border", searchVisible && "text-primary bg-accent border-border")}
                                onClick={() => setSearchVisible(!searchVisible)}
                            >
                                <FontAwesomeIcon icon={faSearch} className="size-[15px]" />
                            </Button>

                            <div className="flex items-center gap-0.5 mx-1">
                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-accent rounded-lg border border-transparent hover:border-border">
                                    <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-accent rounded-lg border border-transparent hover:border-border">
                                    <FontAwesomeIcon icon={faChevronRight} className="size-2.5" />
                                </Button>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 px-3 rounded-lg border-border bg-card text-foreground font-bold text-[12px] flex items-center gap-2 shadow-sm ml-1 uppercase tracking-wider">
                                        Newest <FontAwesomeIcon icon={faChevronDown} className="size-2.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[150px] p-1 shadow-xl border-border bg-card">
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">Oldest</DropdownMenuItem>
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">Updated</DropdownMenuItem>
                                    <DropdownMenuItem className="font-semibold text-[13px] py-2 cursor-pointer">A - Z</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:bg-accent rounded-lg border border-transparent hover:border-border">
                                <FontAwesomeIcon icon={faEllipsisV} className="size-[15px]" />
                            </Button>
                        </div>
                    </div>

                    {/* Sub-header for Search (Conditional) */}
                    {searchVisible && (
                        <div className="px-6 py-4 bg-card border-b border-border animate-in slide-in-from-top-4 duration-300">
                            <div className="relative">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 size-4" />
                                <Input
                                    placeholder="Search notes here..."
                                    className="pl-11 h-12 bg-muted/30 border-none rounded-xl focus:ring-1 focus:ring-primary/20 transition-all font-medium text-[14px]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes Grid Area */}
                    <div className="flex-1 p-6 transition-colors duration-500">
                        <div className={cn(
                            "grid gap-6 mb-12",
                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2" : "grid-cols-1"
                        )}>
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className={cn(
                                        "bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border-l-[3px]",
                                        note.color
                                    )}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <h3 className="text-[16px] font-bold text-foreground leading-tight truncate">{note.title}</h3>
                                                <div className={cn("size-2 rounded-full shrink-0", note.dot)}></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-[13px] font-medium text-muted-foreground">{note.date}</span>
                                        </div>

                                        <p className="text-[14px] text-muted-foreground/80 leading-[1.6] mb-6 line-clamp-2">
                                            {notesContent}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3">
                                                <button className={cn("size-8 rounded-lg flex items-center justify-center border border-transparent transition-all", note.isFavorite ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground hover:bg-accent hover:border-border")}>
                                                    <FontAwesomeIcon icon={faStar} className="size-[13px]" />
                                                </button>
                                                <button className="size-8 rounded-lg flex items-center justify-center text-muted-foreground border border-transparent hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-500 transition-all">
                                                    <FontAwesomeIcon icon={faTrash} className="size-[13px]" />
                                                </button>
                                            </div>

                                            <button className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                                                <FontAwesomeIcon icon={faChevronDown} className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
