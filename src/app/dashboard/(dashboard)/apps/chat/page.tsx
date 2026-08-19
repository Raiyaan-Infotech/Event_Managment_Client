"use client"

import * as React from "react"
import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faSearch,
    faEllipsisV,
    faPhone,
    faVideo,
    faStar,
    faInfoCircle,
    faPlus,
    faImage,
    faMicrophone,
    faPaperPlane,
    faSmile,
    faTimes,
    faCalendarAlt,
    faClock,
    faMapMarkerAlt,
    faEnvelope,
    faGlobe,
    faBolt,
    faChevronDown,
    faAlignLeft,
    faCheckCircle,
    faBellSlash,
    faPhoneAlt,
    faExclamationTriangle,
    faTrashAlt,
    faArchive,
    faFileAlt,
    faSave,
    faSun,
    faHashtag,
    faLink,
    faDownload,
    faBriefcase,
    faUsers,
    faChartLine,
    faExternalLinkAlt,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons"
import {
    faGithub,
    faCodepen,
    faLinkedin,
    faInstagram,
} from "@fortawesome/free-brands-svg-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

const contacts = [
    { id: 1, name: "Erna Serpa", time: "2 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "https://i.pravatar.cc/150?img=1", profileImage: "https://i.pravatar.cc/150?img=1", status: "online", color: "bg-emerald-500" },
    { id: 2, name: "Norman Byrd", time: "5 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "", fallback: "N", profileImage: "", status: "offline", color: "bg-red-500" },
    { id: 3, name: "Laura Foreman", time: "7 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "https://i.pravatar.cc/150?img=2", profileImage: "https://i.pravatar.cc/150?img=2", status: "online", color: "bg-emerald-500" },
    { id: 4, name: "Bryan Waters", time: "10 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "", fallback: "B", profileImage: "", status: "away", color: "bg-amber-500" },
    { id: 5, name: "Ursula Sanders", time: "9 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "https://i.pravatar.cc/150?img=3", profileImage: "https://i.pravatar.cc/150?img=3", status: "online", color: "bg-emerald-500" },
    { id: 6, name: "Edward Andrade", time: "13 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "", fallback: "E", profileImage: "", status: "online", color: "bg-emerald-500" },
    { id: 7, name: "Alexandra Della", time: "15 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "https://i.pravatar.cc/150?img=4", profileImage: "https://i.pravatar.cc/150?img=4", status: "online", color: "bg-emerald-500" },
    { id: 8, name: "Timothy Boyd", time: "13 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "", fallback: "T", profileImage: "", status: "online", color: "bg-emerald-500" },
    { id: 9, name: "Curtis Green", time: "20 MIN AGO", message: "Lorem ipsum dolor sit amet, consec tetuer adipi scing elit aenean commodo...", avatar: "https://i.pravatar.cc/150?img=5", profileImage: "https://i.pravatar.cc/150?img=5", status: "online", color: "bg-emerald-500" },
]

const messages = [
    { id: 1, sender: "Alexandra Della", time: "10:32 PM", text: ["Hi,", "How are you?"], type: "received", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 2, sender: "Green Cute", time: "10:35 PM", text: ["Hello Alex!!! Welcome to Live Chat!!!", "My name is Green & How can I help you today???"], type: "sent", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 3, sender: "Alexandra Della", time: "10:40 PM", text: ["Hi, I wanted to check my order status....", "My order number is #NXL0458"], type: "received", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 4, sender: "Green Cute", time: "10:42 PM", text: ["No problem, let me check that for you.", "Thanks for the information!!! Give me one moment please while I check on that for you.", "Thanks for your times, Your order #NXL0458 will arive on this weekend."], type: "sent", avatar: "https://i.pravatar.cc/150?img=5" },
    { id: 5, sender: "Alexandra Della", time: "10:45 PM", text: ["Thanks. I'm worried😳 it won't arrive in time⌚ for my daughter's birthday🎂 party🎉 this weekend.", "Order tracking number is: #698745"], type: "received", avatar: "https://i.pravatar.cc/150?img=4" },
    {
        id: 6, sender: "Green Cute", time: "10:48 PM", text: ["I understand your concern… I wouldn't want my child's gift to arrive late either.", "It looks like your order is set to arrive in 2 business days, so it should arrive by Friday, just in time!"], type: "sent", avatar: "https://i.pravatar.cc/150?img=5", attachments: [
            { name: "Order.zip", size: "402.65/KB", icon: "https://themewagon.github.io/Duralux-admin/assets/images/file-icons/zip.png" },
            { name: "Document.png", size: "480.14/KB", icon: "https://themewagon.github.io/Duralux-admin/assets/images/file-icons/png.png" },
            { name: "Photos.psd", size: "248.54/KB", icon: "https://themewagon.github.io/Duralux-admin/assets/images/file-icons/psd.png" }
        ]
    },
    { id: 7, sender: "Alexandra Della", time: "10:50 PM", text: ["The birthday🎂 ceremony preparation almost completed", "Thank your so much.....!!!!"], type: "received", avatar: "https://i.pravatar.cc/150?img=4" },
    { id: 8, sender: "Green Cute", time: "10:53 PM", text: ["I understand your concern......!!", "Anything else can I help you???"], type: "sent", avatar: "https://i.pravatar.cc/150?img=5" },
]

export default function ChatPage() {
    const [showProfile, setShowProfile] = React.useState(false)
    const [showVoiceCall, setShowVoiceCall] = React.useState(false)
    const [showVideoCall, setShowVideoCall] = React.useState(false)
    const [activeContact, setActiveContact] = React.useState(contacts.find(c => c.name === "Alexandra Della") || contacts[0])
    const [isTyping, setIsTyping] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [view, setView] = React.useState<"list" | "chat">("list")

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="flex w-full h-full overflow-hidden bg-background transition-colors duration-500" suppressHydrationWarning={true}>
            <style jsx global>{`
                .chat-scrollbar::-webkit-scrollbar { width: 4px; }
                .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .chat-scrollbar::-webkit-scrollbar-thumb { background: #dfe2e6; border-radius: 10px; }
                .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e0; }
                
                .dark .chat-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                
                .chat-scrollbar {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
                
                .wave { position: relative; display: flex; align-items: center; gap: 2px; margin-left: 10px; }
                .wave .dot { display: block; width: 3px; height: 3px; border-radius: 50%; background: #10b981; animation: wave 1.3s linear infinite; }
                .wave .dot:nth-child(2) { animation-delay: -1.1s; }
                .wave .dot:nth-child(3) { animation-delay: -0.9s; }
                @keyframes wave { 0%, 60%, 100% { transform: initial; } 30% { transform: translateY(-5px); } }

                .dark .dot { background: #34d399; }

                .profile-avatar {
                    border-radius: 12px;
                }

                .profile-avatar-circle {
                    border-radius: 50%;
                }
            `}</style>

            {/* Left Sidebar: Contact List */}
            <div className={cn(
                "w-full md:w-[350px] h-full border-r border-border bg-card flex flex-col shrink-0 relative overflow-hidden transition-all duration-300",
                view === "chat" ? "hidden md:flex" : "flex"
            )}>
                {/* Fixed Top Section: Only Title - aligns with app header/main header */}
                <div className="bg-card z-30 border-b border-border shrink-0">
                    <div className="h-[72px] px-6 flex items-center">
                        <h4 className="text-[18px] font-bold text-foreground m-0">Chat</h4>
                    </div>
                </div>

                <ScrollArea className="flex-1 chat-scrollbar">
                    <div className="flex flex-col h-full">
                        {/* Search and Filter Row - Inside Scrollable Area */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faSearch} className="size-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full h-10 pl-10 pr-4 bg-muted/50 border-transparent rounded-lg text-[13px] font-medium text-foreground focus:bg-background focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-10 px-3 rounded-lg border-border text-muted-foreground hover:bg-accent font-semibold text-[12px] flex items-center gap-2 shadow-none transition-all duration-200">
                                            Newest <FontAwesomeIcon icon={faChevronDown} className="size-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[180px] rounded-lg shadow-lg border-border bg-card p-1">
                                        {["Oldest", "Newest", "Replied", "Snoozed"].map((opt) => (
                                            <DropdownMenuItem key={opt} className="text-[13px] py-2 cursor-pointer hover:bg-accent hover:text-primary transition-colors">
                                                {opt}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator className="bg-border" />
                                        {["Ascending", "Descending"].map((opt) => (
                                            <DropdownMenuItem key={opt} className="text-[13px] py-2 cursor-pointer hover:bg-accent hover:text-primary transition-colors">
                                                {opt}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Contact List */}
                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={cn(
                                    "group flex items-start gap-3 p-5 border-b border-border transition-all relative border-l-[3px] cursor-pointer",
                                    activeContact.id === contact.id ? "bg-accent/50 border-l-primary" : "border-l-transparent"
                                )}
                                onClick={() => {
                                    setActiveContact(contact)
                                    setView("chat")
                                }}
                            >
                                <div className="relative shrink-0">
                                    {contact.avatar ? (
                                        <>
                                            <img src={contact.avatar} alt={contact.name} className="w-11 h-11 rounded-lg object-cover" />
                                        </>
                                    ) : (
                                        <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm", contact.color)}>
                                            {contact.fallback}
                                        </div>
                                    )}
                                    <div className={cn("absolute bottom-0 right-0 size-3 border-2 border-background rounded-full", contact.status === 'online' ? 'bg-emerald-500' : contact.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground')}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className={cn("text-[14px] font-bold truncate", activeContact.id === contact.id ? "text-primary" : "text-foreground")}>{contact.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-muted-foreground/60 ml-1 uppercase whitespace-nowrap">{contact.time}</span>
                                    </div>
                                    <p className="text-[12px] text-muted-foreground font-medium line-clamp-1 leading-normal mb-0">
                                        {contact.message}
                                    </p>
                                </div>
                                <div className="shrink-0 pt-0.5">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="size-7 flex items-center justify-center text-muted-foreground hover:bg-accent rounded-lg transition-colors">
                                                <FontAwesomeIcon icon={faEllipsisV} className="size-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[180px] p-1.5 shadow-xl border-border bg-card">
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faCheckCircle} className="size-3.5" /> Make as Read</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faStar} className="size-3.5" /> Add to Favorite</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faBellSlash} className="size-3.5" /> Mute Notifications</DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faPhoneAlt} className="size-3.5" /> Audio Call</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faVideo} className="size-3.5" /> Video Call</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faEnvelope} className="size-3.5" /> Send eMail</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faExclamationTriangle} className="size-3.5" /> Report Chat</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"><FontAwesomeIcon icon={faTrashAlt} className="size-3.5" /> Delete Chat</DropdownMenuItem>
                                            <DropdownMenuItem className="text-[13px] gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faArchive} className="size-3.5" /> Archive Chat</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t border-gray-100">
                    <Button variant="ghost" className="w-full text-gray-600 text-[12px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:text-[#3454d1] transition-colors">
                        Load More
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex-1 h-full flex flex-col min-w-0 bg-background/50 dark:bg-slate-900/50 relative overflow-hidden transition-colors duration-500",
                view === "list" ? "hidden md:flex" : "flex"
            )}>
                {/* Chat Header - Fixed */}
                <div className="bg-card z-30 border-b border-border shrink-0">
                    <div className="h-[72px] px-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 text-muted-foreground md:hidden"
                                onClick={() => setView("list")}
                            >
                                <FontAwesomeIcon icon={faAlignLeft} className="size-5" />
                            </Button>
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowProfile(!showProfile)}>
                                <div className="relative shrink-0">
                                    {activeContact.profileImage ? (
                                        <>
                                            <img src={activeContact.profileImage} alt={activeContact.name} className="w-11 h-11 rounded-full object-cover" />
                                        </>
                                    ) : (
                                        <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 size-3 border-2 border-background bg-emerald-500 rounded-full"></div>
                                </div>
                                <div className="hidden sm:block">
                                    <h5 className="text-[15px] font-bold text-foreground mb-0.5 leading-none group-hover:text-primary transition-colors">{activeContact.name}</h5>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">ACTIVE NOW</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-10 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition-all"
                                title="Audio Call"
                                onClick={() => setShowVoiceCall(true)}
                            >
                                <FontAwesomeIcon icon={faPhoneAlt} className="size-[18px]" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-10 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition-all"
                                title="Video Call"
                                onClick={() => setShowVideoCall(true)}
                            >
                                <FontAwesomeIcon icon={faVideo} className="size-[18px]" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-10 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg hidden sm:flex transition-all" title="Add to Favorite">
                                <FontAwesomeIcon icon={faStar} className="size-[18px]" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("size-10 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition-all", showProfile && "bg-accent text-primary")}
                                title="Profile Info"
                                onClick={() => setShowProfile(!showProfile)}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} className="size-[18px]" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-10 text-muted-foreground hover:bg-accent hover:text-primary rounded-lg transition-all">
                                        <FontAwesomeIcon icon={faEllipsisV} className="size-[18px]" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[180px] p-1.5 shadow-xl bg-card border-border">
                                    <DropdownMenuItem className="gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faPlus} className="size-4" /> Join Group</DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2 py-2 hover:bg-accent"><FontAwesomeIcon icon={faUsers} className="size-4" /> Invite People</DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem className="gap-2 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"><FontAwesomeIcon icon={faTimes} className="size-4" /> Block Conversion</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-8 py-8 chat-scrollbar focus-visible:outline-none">
                    <div className="flex flex-col gap-6">
                        {/* Chat Header Message with Profile */}
                        <div className="flex justify-end mb-4">
                            <div className="flex items-center gap-3 max-w-[55%]">
                                <div className="text-right">
                                    <div className="text-[14px] font-bold text-foreground">{activeContact.name}</div>
                                    <div className="text-[12px] text-muted-foreground/70">10:32 PM</div>
                                </div>
                                {activeContact.profileImage ? (
                                    <>
                                        <img src={activeContact.profileImage} alt={activeContact.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                    </>
                                ) : (
                                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0", activeContact.color)}>
                                        {activeContact.fallback || activeContact.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={cn(
                                "flex flex-col w-full",
                                msg.type === "sent" ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "flex items-center gap-2.5 mb-2",
                                    msg.type === "sent" ? "flex-row-reverse" : ""
                                )}>
                                    <>
                                        <img src={msg.avatar} alt={msg.sender} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                    </>
                                    <div className={cn("flex items-center gap-2 text-[12px] font-semibold", msg.type === "sent" ? "flex-row-reverse" : "")}>
                                        <span className="text-foreground">{msg.sender}</span>
                                        <div className="size-1 bg-muted rounded-full"></div>
                                        <span className="text-muted-foreground/60 font-bold text-[10px] uppercase">{msg.time}</span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "max-w-[85%] sm:max-w-[70%] lg:max-w-[55%] flex flex-col gap-2",
                                    msg.type === "sent" ? "items-end" : "items-start"
                                )}>
                                    {msg.text.map((t, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "px-5 py-3 text-[14px] font-medium leading-[1.6] tracking-tight",
                                                msg.type === "sent"
                                                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none shadow-sm"
                                                    : "bg-muted text-foreground rounded-2xl rounded-tl-none border border-border"
                                            )}
                                        >
                                            {t}
                                        </div>
                                    ))}
                                    {msg.attachments && (
                                        <div className="flex flex-col gap-3 mt-1 w-full sm:min-w-[300px]">
                                            {msg.attachments.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group/file cursor-pointer">
                                                    <div className="flex items-center min-w-0">
                                                        <div className="size-16 flex items-center justify-center bg-muted/50 border-r border-border p-4 shrink-0 transition-colors group-hover/file:bg-primary/5">
                                                            <img src={file.icon} alt={file.name} className="size-7 object-contain" />
                                                        </div>
                                                        <div className="px-4 py-3 min-w-0">
                                                            <span className="text-[13px] font-bold text-foreground block truncate group-hover/file:text-primary transition-colors">{file.name}</span>
                                                            <span className="text-[11px] font-bold text-muted-foreground/60">{file.size}</span>
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-3 border-l border-border shrink-0">
                                                        <Button variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                                                            <FontAwesomeIcon icon={faDownload} className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex flex-col items-start w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2.5 mb-2">
                                    {activeContact.profileImage ? (
                                        <>
                                            <img src={activeContact.profileImage} alt={activeContact.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                                        </>
                                    ) : (
                                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[12px] font-semibold">
                                        <span className="text-foreground">{activeContact.name}</span>
                                        <div className="size-1 bg-muted rounded-full"></div>
                                        <span className="text-emerald-600 font-bold text-[10px] uppercase">TYPING...</span>
                                    </div>
                                </div>
                                <div className="px-5 py-3 bg-muted border border-border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-emerald-600">Typing</span>
                                    <div className="wave">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Message Editor */}
                <div className="p-6 pt-0 mt-auto bg-transparent shrink-0">
                    <div className="bg-card border border-border rounded-xl shadow-lg flex items-center p-1.5 transition-all focus-within:ring-1 focus-within:ring-primary/20">
                        <div className="flex items-center border-r border-border pr-1.5 ml-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Pick Template">
                                        <FontAwesomeIcon icon={faHashtag} className="size-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[280px] p-1.5 shadow-2xl bg-card border-border">
                                    <div className="px-3 py-2 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest border-b border-border mb-1">Message Templates</div>
                                    {["Welcome message", "Your issues solved", "Thank you message", "Make a offer message"].map((opt) => (
                                        <DropdownMenuItem key={opt} className="text-[13px] py-1.5 gap-3 cursor-pointer hover:bg-accent"><FontAwesomeIcon icon={faFileAlt} className="size-4 text-muted-foreground/40" /> {opt}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Attach Files">
                                        <FontAwesomeIcon icon={faLink} className="size-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[180px] p-1.5 shadow-2xl bg-card border-border">
                                    <DropdownMenuItem className="text-[13px] py-2.5 gap-3 cursor-pointer hover:bg-accent"><FontAwesomeIcon icon={faImage} className="size-4" /> Upload Images</DropdownMenuItem>
                                    <DropdownMenuItem className="text-[13px] py-2.5 gap-3 cursor-pointer hover:bg-accent"><FontAwesomeIcon icon={faMicrophone} className="size-4" /> Upload Audios</DropdownMenuItem>
                                    <DropdownMenuItem className="text-[13px] py-2.5 gap-3 cursor-pointer hover:bg-accent"><FontAwesomeIcon icon={faVideo} className="size-4" /> Upload Videos</DropdownMenuItem>
                                    <DropdownMenuItem className="text-[13px] py-2.5 gap-3 cursor-pointer hover:bg-accent"><FontAwesomeIcon icon={faPlus} className="size-4" /> Upload Documents</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 h-12 px-4 bg-transparent border-none text-[14px] font-medium text-foreground placeholder:text-muted-foreground outline-none"
                        />
                        <div className="flex items-center gap-1.5 pr-1.5">
                            <Button variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Voice Message">
                                <FontAwesomeIcon icon={faMicrophone} className="size-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-11 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-all" title="Emoji">
                                <FontAwesomeIcon icon={faSmile} className="size-5" />
                            </Button>
                            <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95 leading-none">
                                <span className="hidden sm:inline">Send</span> <FontAwesomeIcon icon={faPaperPlane} className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Profile Sidebar */}
                {showProfile && (
                    <div className="absolute top-0 right-0 w-full sm:w-[400px] h-full border-l border-border bg-card flex flex-col z-50 animate-in slide-in-from-right duration-300 shadow-2xl overflow-hidden">
                        <div className="h-[76px] px-6 border-b border-border flex items-center justify-between shrink-0 bg-card">
                            <span className="text-[12px] font-black text-foreground uppercase tracking-widest">Profile Info</span>
                            <Button variant="ghost" size="icon" className="size-9 rounded-lg text-muted-foreground hover:bg-accent" onClick={() => setShowProfile(false)}>
                                <FontAwesomeIcon icon={faTimes} className="size-5" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 chat-scrollbar">
                            <div className="p-8 flex flex-col items-center border-b border-border">
                                <div className="relative mb-6">
                                    {activeContact.profileImage ? (
                                        <>
                                            <img src={activeContact.profileImage} alt={activeContact.name} className="w-[110px] h-[110px] rounded-lg object-cover border border-border shadow-sm" />
                                        </>
                                    ) : (
                                        <div className={cn("w-[110px] h-[110px] rounded-lg flex items-center justify-center text-4xl font-bold border border-border shadow-sm", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute bottom-1 right-1 size-5 border-[3px] border-background bg-emerald-500 rounded-full"></div>
                                </div>
                                <h5 className="text-[18px] font-extrabold text-foreground mb-1">{activeContact.name}</h5>
                                <span className="text-[13px] font-medium text-muted-foreground mb-5">{activeContact.name.toLowerCase().replace(" ", "")}@example.com</span>
                                <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] py-1.5 px-5 rounded-full mb-8 shadow-md">
                                    SOFTWARE ENGINEER
                                </Badge>
                                <div className="flex items-center gap-3">
                                    {[faGithub, faCodepen, faLinkedin, faInstagram].map((icon, i) => (
                                        <Button key={i} variant="outline" size="icon" className="size-10 rounded-lg border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                                            <FontAwesomeIcon icon={icon} className="size-[18px]" />
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="py-2.5 px-6 bg-muted/50 border-y border-border">
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[2px]">Personal Details</span>
                            </div>
                            <div className="p-7 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <FontAwesomeIcon icon={faClock} className="size-[18px] text-emerald-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-wider mb-0.5">Status</span>
                                        <span className="text-[13px] font-bold text-emerald-500 uppercase tracking-tight flex items-center gap-1.5">
                                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Active Now
                                        </span>
                                    </div>
                                </div>
                                {[
                                    { icon: faCalendarAlt, label: "Join Date", text: "26 Mar, 2022" },
                                    { icon: faPhone, label: "Phone Number", text: "759-479-5968" },
                                    { icon: faGlobe, label: "Timezone", text: "GMT: +06, 12:56 PM" },
                                    { icon: faMapMarkerAlt, label: "Location", text: "San Diego, California" },
                                    { icon: faEnvelope, label: "Email Address", text: activeContact.name.toLowerCase().replace(" ", "") + "@example.com" },
                                    { icon: faExternalLinkAlt, label: "Portfolio", text: "https://www.themewagon.com", link: true },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                                            <FontAwesomeIcon icon={item.icon} className="size-[18px] text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-wider mb-0.5">{item.label}</span>
                                            <span className={cn(
                                                "text-[14px] font-bold text-foreground leading-relaxed truncate",
                                                item.link && "text-primary hover:underline cursor-pointer"
                                            )}>{item.text}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 pt-2 text-muted-foreground/60">
                                    <FontAwesomeIcon icon={faChartLine} className="size-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">Recent activity by {activeContact.name}</span>
                                </div>
                            </div>

                            <div className="py-2.5 px-6 bg-muted/50 border-y border-border">
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[2px]">Experience</span>
                            </div>
                            <div className="p-7 space-y-6">
                                {[
                                    { title: "Sr. Web Designer", company: "Gaibandha Computer & IT Education, Bangladesh", date: "2014 - 2016" },
                                    { title: "Jr. Web Designer & Developer", company: "Gaibandha Computer & IT Education, Bangladesh", date: "2016 - 2019" },
                                    { title: "Full-Stack Designer & Developer", company: "Gaibandha Computer & IT Education, Bangladesh", date: "2019 - Present" },
                                ].map((exp, i) => (
                                    <div key={i} className="flex gap-4 group cursor-default">
                                        <div className="size-12 bg-card rounded-xl border border-border flex flex-col items-center justify-center shrink-0 shadow-sm group-hover:border-primary group-hover:bg-primary/5 transition-all">
                                            <FontAwesomeIcon icon={faBriefcase} className="size-6 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="min-w-0">
                                            <h6 className="text-[14px] font-extrabold text-foreground mb-0.5 truncate">{exp.title}</h6>
                                            <p className="text-[12px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">{exp.company}</p>
                                            <span className="text-[11px] font-black text-muted-foreground/40 tracking-wider uppercase">{exp.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="py-2.5 px-6 bg-muted/50 border-y border-border">
                                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[2px]">Technical Skills</span>
                            </div>
                            <div className="p-7 space-y-5">
                                {[
                                    { label: "HTML", val: 80, color: "bg-orange-500" },
                                    { label: "CSS", val: 90, color: "bg-cyan-500" },
                                    { label: "UI/UX", val: 80, color: "bg-indigo-500" },
                                    { label: "JavaScript", val: 90, color: "bg-yellow-500" },
                                    { label: "Communication", val: 95, color: "bg-primary" },
                                ].map((s, i) => (
                                    <div key={i} className="space-y-2.5">
                                        <div className="flex items-center justify-between text-[11px] font-black text-foreground uppercase tracking-wider">
                                            <span>{s.label}</span>
                                            <span className="text-primary">{s.val}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-1000", s.color)}
                                                style={{ width: `${s.val}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>

            {/* Voice Calling Modal */}
            {showVoiceCall && (
                <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex-1 w-full max-w-4xl flex flex-col p-8 items-center justify-between">
                        <div className="w-full flex items-center justify-between border-b border-border pb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full ring-4 ring-accent overflow-hidden shadow-sm">
                                    {activeContact.profileImage ? (
                                        <img src={activeContact.profileImage} alt={activeContact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={cn("w-full h-full flex items-center justify-center text-white font-bold text-lg", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-[16px] font-extrabold text-foreground mb-0.5">{activeContact.name}</h4>
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <div className="size-1.5 bg-emerald-600 rounded-full animate-ping"></div> Audio Calling...
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="size-11 rounded-lg border-border text-muted-foreground hover:text-primary transition-all"><FontAwesomeIcon icon={faPlus} className="size-5" /></Button>
                                <Button variant="outline" size="icon" className="size-11 rounded-lg border-border text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all" onClick={() => setShowVoiceCall(false)}><FontAwesomeIcon icon={faTimes} className="size-5" /></Button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-10 group cursor-pointer">
                                <div className="size-52 rounded-full border-[12px] border-accent overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                    {activeContact.profileImage ? (
                                        <img src={activeContact.profileImage} className="size-full object-cover" alt="" />
                                    ) : (
                                        <div className={cn("size-full flex items-center justify-center text-white font-bold text-6xl", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-[-20px] rounded-full border border-primary animate-ping opacity-10"></div>
                                <div className="absolute inset-[-40px] rounded-full border border-primary animate-ping opacity-5" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                            <h2 className="text-3xl font-black text-foreground mb-3 tracking-tight">{activeContact.name}</h2>
                            <p className="text-[14px] text-muted-foreground font-bold uppercase tracking-[2px]">Calling...</p>
                        </div>

                        <div className="flex items-center gap-5 pb-12">
                            {[faMicrophone, faBellSlash, faSun, faEllipsisV].map((icon, i) => (
                                <Button key={i} variant="outline" size="icon" className="size-16 rounded-lg border-border text-muted-foreground hover:bg-accent transition-all shadow-sm">
                                    <FontAwesomeIcon icon={icon} className="size-6" />
                                </Button>
                            ))}
                            <Button
                                variant="destructive"
                                size="icon"
                                className="size-20 rounded-full bg-rose-500 hover:bg-rose-600 shadow-2xl shadow-rose-500/30 transition-all active:scale-90"
                                onClick={() => setShowVoiceCall(false)}
                            >
                                <FontAwesomeIcon icon={faPhone} className="size-8 rotate-[135deg]" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Calling Modal */}
            {showVideoCall && (
                <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative w-full h-full overflow-hidden flex flex-col shadow-2xl">
                        {/* Remote Video (Mockup) */}
                        <div className="absolute inset-0 size-full flex items-center justify-center">
                            {activeContact.profileImage ? (
                                <>
                                    <img src={activeContact.profileImage} className="size-full object-cover opacity-50 blur-2xl scale-125" alt="" />
                                </>
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
                            <div className="relative flex flex-col items-center text-center animate-in zoom-in-90 duration-700">
                                <div className="relative mb-8">
                                    {activeContact.profileImage ? (
                                        <div className="size-[140px] border-[6px] border-white/10 shadow-2xl rounded-full overflow-hidden">
                                            <img src={activeContact.profileImage} alt={activeContact.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className={cn("size-[140px] border-[6px] border-white/10 shadow-2xl rounded-full flex items-center justify-center text-4xl font-black", activeContact.color)}>
                                            {activeContact.fallback || activeContact.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute inset-[-15px] rounded-full border border-white/20 animate-pulse"></div>
                                </div>
                                <h2 className="text-white text-4xl font-black mb-3 tracking-tight">{activeContact.name}</h2>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/5 font-black text-[10px] text-white/80 uppercase tracking-widest">
                                    <div className="size-1.5 bg-emerald-500 rounded-full"></div> Video Calling...
                                </div>
                            </div>
                        </div>

                        {/* Local Video Preview */}
                        <div className="absolute top-10 right-10 w-[240px] aspect-video bg-black rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl transition-all hover:scale-105 group cursor-pointer">
                            <div className="size-full bg-gray-800 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-60 transition-opacity">
                                    <FontAwesomeIcon icon={faVideo} className="size-8 text-white" />
                                    <span className="text-white text-[9px] font-black uppercase tracking-[2px]">Self View</span>
                                </div>
                            </div>
                        </div>

                        {/* Overlay Controls */}
                        <div className="mt-auto w-full p-12 flex flex-col items-center z-20">
                            <div className="flex items-center gap-3 px-6 py-4 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 mb-10 shadow-2xl">
                                <div className="size-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white text-sm font-black tracking-widest">00:00:00</span>
                            </div>

                            <div className="flex items-center gap-6">
                                {[faMicrophone, faBellSlash, faSun, faVideo, faEllipsisV].map((icon, i) => (
                                    <Button key={i} variant="outline" size="icon" className="size-16 rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md transition-all">
                                        <FontAwesomeIcon icon={icon} className="size-6" />
                                    </Button>
                                ))}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="size-20 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-600/40 transition-all active:scale-90"
                                    onClick={() => setShowVideoCall(false)}
                                >
                                    <FontAwesomeIcon icon={faPhone} className="size-8 rotate-[135deg]" />
                                </Button>
                            </div>
                        </div>

                        {/* Top Bar Controls */}
                        <div className="absolute top-10 left-10 flex items-center gap-4">
                            <Button variant="outline" size="icon" className="size-11 rounded-lg border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-md" onClick={() => setShowVideoCall(false)}>
                                <FontAwesomeIcon icon={faTimes} className="size-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
