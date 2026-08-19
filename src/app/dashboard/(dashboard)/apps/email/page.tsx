"use client"

import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faInbox,
    faPaperPlane,
    faFileAlt,
    faExclamationCircle,
    faTrashAlt,
    faStar,
    faSyncAlt,
    faBell,
    faSearch,
    faChevronLeft,
    faChevronRight,
    faEllipsisV,
    faLink,
    faClock,
    faPaperclip,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const emails = [
    { id: 1, sender: "Alexandra Della", subject: "Ruhul Hasan, log into...", label: "Friends", date: "26 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=a", starred: false, hasLink: true, hasAttachment: false, type: "friends" },
    { id: 2, sender: "Green Cute", subject: "Latest news updates o...", label: "Update", date: "26 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=b", starred: false, hasLink: true, hasAttachment: true, type: "update" },
    { id: 3, sender: "Marianne Audrey", subject: "Flatlogic Contact Form...", label: "Primary", date: "26 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=c", starred: false, hasLink: true, hasAttachment: false, type: "primary" },
    { id: 4, sender: "Timothy Boyd", subject: "Duralux Admin Template...", label: "Update", date: "26 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=d", starred: true, hasLink: false, hasAttachment: true, type: "update" },
    { id: 5, sender: "Laura Foreman", subject: "New Project Assignment...", label: "Work", date: "26 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=e", starred: false, hasLink: true, hasAttachment: false, type: "primary" },
    { id: 6, sender: "Norman Byrd", subject: "Weekend meeting schedule...", label: "Social", date: "25 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=f", starred: false, hasLink: false, hasAttachment: false, type: "primary" },
    { id: 7, sender: "Alexandra Della", subject: "Ruhul Hasan, log into...", label: "Friends", date: "24 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=a", starred: false, hasLink: true, hasAttachment: false, type: "friends" },
    { id: 8, sender: "Green Cute", subject: "Latest news updates o...", label: "Update", date: "24 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=b", starred: false, hasLink: true, hasAttachment: true, type: "update" },
    { id: 9, sender: "Marianne Audrey", subject: "Flatlogic Contact Form...", label: "Primary", date: "24 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=c", starred: false, hasLink: true, hasAttachment: false, type: "primary" },
    { id: 10, sender: "Alexandra Della", subject: "Ruhul Hasan, log into...", label: "Friends", date: "23 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=a", starred: false, hasLink: true, hasAttachment: false, type: "primary" },
    { id: 11, sender: "Timothy Boyd", subject: "Security Alert: New Log...", label: "Security", date: "23 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=d", starred: false, hasLink: false, type: "update" },
    { id: 12, sender: "Laura Foreman", subject: "Lunch meeting today?", label: "Personal", date: "23 MAY, 2023", avatar: "https://i.pravatar.cc/150?u=e", starred: true, hasLink: false, type: "primary" },
]

export default function EmailPage() {
    const [activeFolder, setActiveFolder] = React.useState("Inbox")
    const [selectedEmails, setSelectedEmails] = React.useState<number[]>([])
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEmails(emails.map(email => email.id))
        } else {
            setSelectedEmails([])
        }
    }

    const toggleSelect = (id: number) => {
        if (selectedEmails.includes(id)) {
            setSelectedEmails(selectedEmails.filter(emailId => emailId !== id))
        } else {
            setSelectedEmails([...selectedEmails, id])
        }
    }

    const isAllSelected = selectedEmails.length === emails.length && emails.length > 0

    return (
        <div className="flex w-full h-full bg-background overflow-hidden transition-colors duration-500">
            <style jsx global>{`
                .chat-scrollbar::-webkit-scrollbar { width: 4px; }
                .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .chat-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 10px; }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
                
                .chat-scrollbar {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
            `}</style>

            {/* Middle Sidebar: Folders & Labels */}
            <div className={cn(
                "fixed inset-0 z-50 w-[300px] h-full border-r border-border bg-card flex flex-col shrink-0 transition-transform duration-300 transform md:relative md:translate-x-0 md:z-auto",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Mobile Close Button */}
                <div className="md:hidden absolute top-4 right-4 z-50">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                        <FontAwesomeIcon icon={faPlus} className="size-4 rotate-45" />
                    </Button>
                </div>

                {/* Fixed Top Header */}
                <div className="h-[72px] px-6 border-b border-border flex items-center shrink-0">
                    <h4 className="text-[18px] font-bold text-foreground m-0">Email</h4>
                </div>

                <ScrollArea className="flex-1 chat-scrollbar">
                    <div className="px-0">
                        {/* Compose Button - Included in scroll area to match image */}
                        <div className="p-6 pb-4">
                            <Button className="w-full bg-[#3454d1] hover:bg-[#2a44a8] text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider text-[12px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                                <FontAwesomeIcon icon={faPlus} className="size-5" /> Compose
                            </Button>
                        </div>

                        <nav className="space-y-0">
                            {[
                                { name: "Inbox", icon: faInbox, count: 5 },
                                { name: "Send", icon: faPaperPlane },
                                { name: "Draft", icon: faFileAlt },
                                { name: "Spam", icon: faExclamationCircle, count: 7 },
                                { name: "Delete", icon: faTrashAlt },
                            ].map((item) => (
                                <div
                                    key={item.name}
                                    onClick={() => setActiveFolder(item.name)}
                                    className={cn(
                                        "flex items-center justify-between px-6 py-3.5 cursor-pointer transition-all group relative border-l-2",
                                        activeFolder === item.name
                                            ? "bg-accent text-primary border-primary"
                                            : "text-muted-foreground hover:bg-accent/50 border-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <FontAwesomeIcon icon={item.icon} className={cn("size-[18px]", activeFolder === item.name ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground")} />
                                        <span className={cn("text-[14px]", activeFolder === item.name ? "font-bold" : "font-semibold")}>{item.name}</span>
                                    </div>
                                    {item.count && (
                                        <span className={cn(
                                            "text-[10px] font-black px-1.5 py-0.5 rounded",
                                            activeFolder === item.name ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            {item.count}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </nav>

                        {/* LABEL Section */}
                        <div className="mt-8 px-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[2px]">Label</span>
                                <FontAwesomeIcon icon={faPlus} className="size-3.5 text-muted-foreground/60 cursor-pointer hover:text-foreground" />
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: "Work", color: "bg-emerald-500" },
                                    { name: "Partnership", color: "bg-amber-500" },
                                    { name: "In Progress", color: "bg-sky-500" },
                                    { name: "Personal", color: "bg-rose-500" },
                                    { name: "Payments", color: "bg-emerald-500" },
                                ].map((label) => (
                                    <div key={label.name} className="flex items-center gap-3.5 cursor-pointer group">
                                        <div className={cn("size-2 rounded-full", label.color)}></div>
                                        <span className="text-[13px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{label.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FILTER Section */}
                        <div className="mt-10 px-6 pb-6">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[2px]">Filter</span>
                                <FontAwesomeIcon icon={faPlus} className="size-3.5 text-muted-foreground/60 cursor-pointer hover:text-foreground" />
                            </div>
                            <div className="space-y-1">
                                {[
                                    { name: "Favorite", icon: faStar },
                                    { name: "Snoozed", icon: faBell },
                                    { name: "Important", icon: faExclamationCircle, count: 3 },
                                ].map((filter) => (
                                    <div key={filter.name} className="flex items-center justify-between py-2 cursor-pointer group">
                                        <div className="flex items-center gap-3.5">
                                            <FontAwesomeIcon icon={filter.icon} className="size-[18px] text-muted-foreground/50 group-hover:text-muted-foreground" />
                                            <span className="text-[13px] font-bold text-muted-foreground group-hover:text-primary transition-colors">{filter.name}</span>
                                        </div>
                                        {filter.count && (
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                                                {filter.count}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Sidebar Footer removed as Storage was moved to content area */}
            </div>

            {/* Right Column: Email List */}
            <div className="flex-1 h-full flex flex-col min-w-0 bg-background/50 relative">
                {/* Action Bar - Fixed Top */}
                <div className="h-[72px] px-6 border-b border-border flex items-center justify-between shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden size-9 text-muted-foreground"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-5" />
                        </Button>
                        <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            className="size-[18px] rounded-[2px] border-border bg-card data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="h-4 w-px bg-border mx-1"></div>
                        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground/50 hover:text-foreground rounded-lg" title="Refresh">
                            <FontAwesomeIcon icon={faSyncAlt} className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground/50 hover:text-foreground rounded-lg" title="Notifications">
                            <FontAwesomeIcon icon={faBell} className="size-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="size-9 text-muted-foreground/50 hover:text-foreground rounded-lg" title="Search">
                            <FontAwesomeIcon icon={faSearch} className="size-4" />
                        </Button>
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-[12px] font-bold text-muted-foreground whitespace-nowrap tracking-tight uppercase">1-15 OF 762</span>
                            <div className="flex items-center gap-1.5 ml-2">
                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground/50 hover:text-foreground hover:bg-accent rounded-lg border border-border p-0 shadow-none text-[10px]">
                                    <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground/50 hover:text-foreground hover:bg-accent rounded-lg border border-border p-0 shadow-none text-[10px]">
                                    <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Rows - Scrollable */}
                <ScrollArea className="flex-1 chat-scrollbar">
                    <div className="flex flex-col">
                        {emails.map((email) => (
                            <div key={email.id} className="group flex items-center gap-3 px-6 py-4 border-b border-border/50 hover:bg-accent/40 transition-colors cursor-pointer relative h-[72px]">
                                <div className="flex items-center gap-3.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedEmails.includes(email.id)}
                                        onCheckedChange={() => toggleSelect(email.id)}
                                        className="size-[18px] rounded-[2px] border-border bg-card data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                    <FontAwesomeIcon icon={faStar} className={cn("size-4 transition-colors", email.starred ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-500")} />
                                </div>
                                <div className="relative shrink-0 ml-1">
                                    <img src={email.avatar} alt={email.sender} className="size-10 rounded-full object-cover shadow-sm border border-border" />
                                </div>
                                <div className="flex-1 flex items-center justify-between min-w-0 ml-2">
                                    <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                                        <span className="text-[14px] font-bold text-foreground shrink-0 min-w-[140px] truncate">{email.sender}</span>

                                        <Badge className={cn(
                                            "hidden sm:flex capitalize px-2.5 py-0.5 h-5 text-[10px] font-black tracking-tight border-none shadow-none shrink-0",
                                            email.type === "friends" ? "bg-emerald-500/10 text-emerald-500" :
                                                email.type === "update" ? "bg-amber-500/10 text-amber-500" :
                                                    "bg-primary/10 text-primary"
                                        )}>
                                            {email.label}
                                        </Badge>
                                        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                                            {email.hasLink && <FontAwesomeIcon icon={faLink} className="size-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />}
                                            {email.hasAttachment && <FontAwesomeIcon icon={faPaperclip} className="size-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />}
                                            <span className="text-[14px] font-medium text-muted-foreground truncate">{email.subject}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0 px-2 lg:min-w-[150px] justify-end">
                                        <span className="text-[12px] font-bold text-muted-foreground/60 whitespace-nowrap uppercase tracking-tighter hidden sm:block">{email.date}</span>
                                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground/40 hover:text-foreground hover:bg-accent rounded-lg sm:group-hover:opacity-100 sm:opacity-0 transition-opacity">
                                            <FontAwesomeIcon icon={faEllipsisV} className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Combined Footer Bar - Now inside ScrollArea (Non-Sticky) */}
                        <div className="h-[56px] px-6 mt-auto flex items-center justify-between border-t border-border shrink-0">
                            <div className="flex-1 max-w-[340px]">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-tight">Storage</span>
                                        <span className="text-[10px] text-muted-foreground/60">
                                            43.5GB used of <span className="font-bold text-foreground">100GB</span>
                                        </span>
                                    </div>
                                    <div className="h-[4px] w-full bg-muted rounded-full overflow-hidden relative">
                                        <div className="h-full bg-primary w-[43.5%] rounded-full transition-all duration-1000"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/60">
                                <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
                                <span className="size-1 bg-muted rounded-full"></span>
                                <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
                                <span className="size-1 bg-muted rounded-full"></span>
                                <span className="hover:text-primary cursor-pointer transition-colors">Policies</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

            </div>
        </div>
    )
}
