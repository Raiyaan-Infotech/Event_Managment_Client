"use client"

import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faSearch,
    faEllipsisVertical,
    faStar as faStarSolid,
    faCheckCircle,
    faClock,
    faChartLine,
    faExclamationCircle,
    faEye,
    faTag,
    faFolder,
    faFilter,
    faChevronLeft,
    faChevronRight,
    faTh,
    faList,
    faListUl,
    faInbox,
    faFileAlt,
    faTrashAlt,
    faCalendarAlt,
    faUsers,
    faPaperclip,
    faCheckSquare,
    faCircleCheck,
    faChevronDown,
    faHashtag
} from "@fortawesome/free-solid-svg-icons"
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const tasks = [
    {
        id: 1,
        title: "Video conference with Canada Team",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Calls",
        priority: "High",
        date: "27 Nov, 2023",
        status: "Inprogress",
        avatars: ["https://i.pravatar.cc/150?u=11"],
        starred: false
    },
    {
        id: 2,
        title: "Client objective meeting",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Conferences",
        priority: "Normal",
        date: "22 Nov, 2023",
        status: "Completed",
        avatars: ["https://i.pravatar.cc/150?u=12"],
        starred: false
    },
    {
        id: 3,
        title: "Target market trend analysis on the go",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Meetings",
        priority: "Medium",
        date: "23 Nov, 2023",
        status: "Pending",
        avatars: ["https://i.pravatar.cc/150?u=13"],
        starred: false
    },
    {
        id: 4,
        title: "Send revised proposal to Mr. Dow Jones",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Calls",
        priority: "Low",
        date: "28 Nov, 2023",
        status: "New",
        avatars: ["https://i.pravatar.cc/150?u=14"],
        starred: false
    },
    {
        id: 5,
        title: "Project phase 1 delivery",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Conferences",
        priority: "High",
        date: "20 Nov, 2023",
        status: "Inprogress",
        avatars: ["https://i.pravatar.cc/150?u=15"],
        starred: false
    },
    {
        id: 6,
        title: "Weekly team synchronization",
        description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit.",
        category: "Meetings",
        priority: "Normal",
        date: "20 Nov, 2023",
        status: "Pending",
        avatars: ["https://i.pravatar.cc/150?u=16"],
        starred: false
    }
]

export default function TasksPage() {
    const [activeTab, setActiveTab] = React.useState("New")
    const [selectedTasks, setSelectedTasks] = React.useState<number[]>([])
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedTasks(tasks.map(t => t.id))
        } else {
            setSelectedTasks([])
        }
    }

    const toggleSelect = (id: number) => {
        if (selectedTasks.includes(id)) {
            setSelectedTasks(selectedTasks.filter(taskId => taskId !== id))
        } else {
            setSelectedTasks([...selectedTasks, id])
        }
    }

    const isAllSelected = selectedTasks.length === tasks.length && tasks.length > 0

    const getPriorityBadge = (priority: string) => {
        switch (priority.toLowerCase()) {
            case "low": return "bg-sky-500/10 text-sky-500 border-none"
            case "normal": return "bg-emerald-500/10 text-emerald-500 border-none"
            case "medium": return "bg-amber-500/10 text-amber-500 border-none"
            case "high": return "bg-rose-500/10 text-rose-500 border-none"
            case "urgent": return "bg-rose-500/10 text-rose-500 border-none"
            default: return "bg-muted text-muted-foreground border-none"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "new": return <FontAwesomeIcon icon={faListUl} className="size-3.5" />
            case "pending": return <FontAwesomeIcon icon={faClock} className="size-3.5" />
            case "inprogress": return <FontAwesomeIcon icon={faChartLine} className="size-3.5" />
            case "completed": return <FontAwesomeIcon icon={faCircleCheck} className="size-3.5" />
            default: return <FontAwesomeIcon icon={faClock} className="size-3.5" />
        }
    }

    const TaskRow = ({ task }: { task: typeof tasks[0] }) => (
        <div
            key={task.id}
            className="group flex items-center justify-between p-5 hover:bg-accent/50 transition-all cursor-pointer transition-colors duration-300"
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => toggleSelect(task.id)}
                        className="size-[15px] rounded-[3px] border-border bg-card data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <FontAwesomeIcon
                        icon={task.starred ? faStarSolid : faStarRegular}
                        className={cn("size-[15px] cursor-pointer", task.starred ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500")}
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-[14px] font-bold text-foreground truncate tracking-tight">{task.title}</h5>
                        <Badge className={cn("px-2 py-0 h-[18px] text-[10px] font-bold shadow-none", getPriorityBadge(task.priority))}>
                            {task.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-muted-foreground/70 truncate max-w-[400px]">{task.description}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                <Badge className={cn(
                    "hidden sm:flex px-2.5 py-0.5 h-6 text-[10px] font-bold rounded border-none shadow-none",
                    task.category === "Calls" ? "bg-blue-500/10 text-blue-500" :
                        task.category === "Conferences" ? "bg-emerald-500/10 text-emerald-500" :
                            task.category === "Meetings" ? "bg-primary/10 text-primary" :
                                "bg-primary/10 text-primary"
                )}>
                    {task.category}
                </Badge>
                <div className="hidden md:flex flex-col items-start min-w-[85px]">
                    <span className="text-[13px] font-semibold text-muted-foreground">{task.date}</span>
                </div>
                <div className="flex items-center">
                    {task.avatars.map((avatar, i) => (
                        <Avatar key={i} className="size-[28px] sm:size-[32px] border-2 border-background first:ml-0 -ml-2">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground/50 hover:text-foreground hover:bg-accent rounded-full">
                    <FontAwesomeIcon icon={faEllipsisVertical} className="size-3.5" />
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex w-full h-full bg-background overflow-hidden transition-colors duration-500">
            <style jsx global>{`
                .tasks-scrollbar::-webkit-scrollbar { width: 4px; }
                .tasks-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .tasks-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 10px; }
                .tasks-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.3); }
                
                .tasks-scrollbar {
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }
            `}</style>

            {/* Middle Sidebar: Navigation & Filters */}
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

                <div className="h-[72px] px-6 border-b border-border flex items-center shrink-0">
                    <h4 className="text-[18px] font-bold text-foreground m-0">Tasks</h4>
                </div>

                <ScrollArea className="flex-1 tasks-scrollbar">
                    <div className="p-6">
                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl uppercase tracking-wider text-[12px] mb-8 transform transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.99]">
                                    <FontAwesomeIcon icon={faPlus} className="size-5" /> Add Tasks
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-xl border-none shadow-2xl bg-card">
                                <DialogHeader className="p-6 bg-card border-b border-border">
                                    <DialogTitle className="text-[18px] font-bold text-foreground">Add New Task</DialogTitle>
                                </DialogHeader>
                                <div className="p-6 space-y-5">
                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Task Name</Label>
                                        <Input placeholder="Task Name" className="h-11 border-border bg-muted/20 focus:ring-primary" />
                                        <p className="text-[11px] text-muted-foreground/60 font-medium">Tasks name for your todo</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Note</Label>
                                        <textarea
                                            placeholder="Write something..."
                                            className="w-full h-32 p-3 rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary text-[13px] text-foreground"
                                        />
                                        <p className="text-[11px] text-muted-foreground/60 font-medium text-right">0 / 200 characters</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Start date...</Label>
                                            <Input type="date" className="h-11 border-border bg-muted/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">End date...</Label>
                                            <Input type="date" className="h-11 border-border bg-muted/20" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Status</Label>
                                            <Select defaultValue="new">
                                                <SelectTrigger className="h-11 border-border bg-muted/20 text-foreground">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="inprogress">Inprogress</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">Priority</Label>
                                            <Select defaultValue="normal">
                                                <SelectTrigger className="h-11 border-border bg-muted/20 text-foreground">
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card border-border">
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="p-6 bg-muted/10 border-t border-border flex items-center justify-end gap-3">
                                    <Button variant="ghost" className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 h-11 uppercase text-[12px]" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
                                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 h-11 uppercase text-[12px]" onClick={() => setIsAddModalOpen(false)}>Add Task</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="space-y-6">
                            <div>
                                <div className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[1px] mb-4">Task Status</div>
                                <nav className="space-y-1">
                                    {[
                                        { name: "New", icon: faListUl },
                                        { name: "Pending", icon: faClock },
                                        { name: "Inprogress", icon: faChartLine },
                                        { name: "Completed", icon: faCircleCheck },
                                    ].map((item) => (
                                        <div
                                            key={item.name}
                                            onClick={() => setActiveTab(item.name)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                                                activeTab === item.name
                                                    ? "bg-accent text-primary"
                                                    : "text-muted-foreground hover:bg-accent/50 hover:text-primary"
                                            )}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className={cn("size-[16px]", activeTab === item.name ? "text-primary" : "text-muted-foreground/50")} />
                                            <span className={cn("text-[14px]", activeTab === item.name ? "font-bold" : "font-semibold")}>{item.name}</span>
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[1px]">Priority</div>
                                    <Button variant="ghost" size="icon" className="size-5 rounded-full bg-accent text-muted-foreground hover:text-primary">
                                        <FontAwesomeIcon icon={faPlus} className="size-2.5" />
                                    </Button>
                                </div>
                                <div className="space-y-4 px-1">
                                    {[
                                        { name: "Low", color: "bg-sky-500" },
                                        { name: "Normal", color: "bg-emerald-500" },
                                        { name: "Medium", color: "bg-primary" },
                                        { name: "High", color: "bg-amber-500" },
                                        { name: "Urgent", color: "bg-rose-500" },
                                    ].map((p) => (
                                        <div key={p.name} className="flex items-center gap-4 cursor-pointer group">
                                            <div className={cn("size-1.5 rounded-full", p.color)}></div>
                                            <span className="text-[14px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 mt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[1px]">Overview</div>
                                    <Button variant="ghost" size="icon" className="size-5 rounded-full bg-accent text-muted-foreground hover:text-primary">
                                        <FontAwesomeIcon icon={faPlus} className="size-2.5" />
                                    </Button>
                                </div>
                                <nav className="space-y-1">
                                    {[
                                        { name: "Overview", icon: faHashtag },
                                        { name: "My Tasks", icon: faHashtag },
                                        { name: "Tasks Activity", icon: faHashtag },
                                        { name: "Tasks Attachments", icon: faHashtag },
                                    ].map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-muted-foreground hover:bg-accent hover:text-primary group transition-all"
                                        >
                                            <FontAwesomeIcon icon={item.icon} className="size-[14px] text-muted-foreground/50 group-hover:text-primary" />
                                            <span className="text-[14px] font-semibold">{item.name}</span>
                                        </div>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column: Main Content */}
            <div className="flex-1 h-full flex flex-col min-w-0 bg-background/50">
                {/* Fixed Top Header */}
                <div className="h-[72px] px-6 flex items-center justify-between shrink-0 z-20 gap-3">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden size-9 text-muted-foreground shrink-0"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <FontAwesomeIcon icon={faFilter} className="size-5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-[38px] px-3 sm:px-4 text-[13px] font-bold text-foreground bg-card border-border flex items-center gap-2 hover:bg-accent rounded-md transition-colors shadow-sm uppercase tracking-wider shrink-0">
                                    <FontAwesomeIcon icon={faCircleCheck} className="size-3.5 text-primary" /> <span className="hidden xs:inline">My Tasks</span> <FontAwesomeIcon icon={faChevronDown} className="size-2.5 ml-1 text-muted-foreground/50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 bg-card border-border">
                                <DropdownMenuItem>Projects</DropdownMenuItem>
                                <DropdownMenuItem>Teams</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="outline" size="icon" className="size-[38px] text-muted-foreground bg-card border-border hover:bg-accent rounded-md">
                                <FontAwesomeIcon icon={faEye} className="size-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="size-[38px] text-muted-foreground bg-card border-border hover:bg-accent rounded-md">
                                <FontAwesomeIcon icon={faTag} className="size-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="size-[38px] text-muted-foreground bg-card border-border hover:bg-accent rounded-md">
                                <FontAwesomeIcon icon={faFolder} className="size-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="size-[34px] rounded-full text-muted-foreground bg-card border-border hover:bg-accent hidden xs:flex">
                            <FontAwesomeIcon icon={faSearch} className="size-3.5" />
                        </Button>
                        <div className="flex items-center bg-card border border-border rounded-md h-[34px] px-1 hidden sm:flex">
                            <Button variant="ghost" size="icon" className="size-7 rounded text-muted-foreground hover:bg-accent">
                                <FontAwesomeIcon icon={faChevronLeft} className="size-2.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 rounded text-muted-foreground hover:bg-accent">
                                <FontAwesomeIcon icon={faChevronRight} className="size-2.5" />
                            </Button>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-[34px] px-3 sm:px-4 text-[11px] font-bold text-muted-foreground bg-card border-border hover:bg-accent rounded-full uppercase tracking-wider shrink-0">
                                    <span className="hidden xs:inline">NEWEST</span> <FontAwesomeIcon icon={faChevronDown} className="size-2 ml-1 text-muted-foreground/50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                                <DropdownMenuItem>Oldest</DropdownMenuItem>
                                <DropdownMenuItem>Newest</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" size="icon" className="size-[34px] rounded-full text-muted-foreground bg-card border-border hover:bg-accent shrink-0">
                            <FontAwesomeIcon icon={faEllipsisVertical} className="size-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Task List / Content Area */}
                <ScrollArea className="flex-1 tasks-scrollbar">
                    <div className="px-6 pb-6 space-y-6 pt-4">

                        {/* Recently Assigned Section */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="h-[60px] px-6 border-b border-border flex items-center justify-between">
                                <h5 className="text-[15px] font-bold text-foreground">Recently Assigned</h5>
                            </div>
                            <div className="divide-y divide-dashed divide-border">
                                {tasks.slice(0, 4).map((task) => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </div>

                        {/* Yesterday Section */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="h-[60px] px-6 border-b border-border flex items-center justify-between">
                                <h5 className="text-[15px] font-bold text-foreground">Yesterday</h5>
                            </div>
                            <div className="divide-y divide-dashed divide-border">
                                {tasks.slice(1, 4).map((task) => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </div>

                        {/* 20 Nov, 2023 Section */}
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="h-[60px] px-6 border-b border-border flex items-center justify-between">
                                <h5 className="text-[15px] font-bold text-foreground">20 Nov, 2023</h5>
                            </div>
                            <div className="divide-y divide-dashed divide-border">
                                {tasks.slice(2, 6).map((task) => (
                                    <TaskRow key={task.id} task={task} />
                                ))}
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                {/* Fixed Action Footer (Policy Links) */}
                <div className="h-[56px] px-6 items-center justify-between border-t border-border bg-card flex shrink-0">
                    <div className="flex items-center gap-4 text-[13px] font-bold text-muted-foreground/70">
                        <span className="hover:text-primary cursor-pointer">Terms</span>
                        <div className="size-1 bg-muted-foreground/30 rounded-full"></div>
                        <span className="hover:text-primary cursor-pointer">Privacy</span>
                        <div className="size-1 bg-muted-foreground/30 rounded-full"></div>
                        <span className="hover:text-primary cursor-pointer">Policies</span>
                    </div>
                    <div className="text-[13px] font-bold text-muted-foreground/70">© 2026 Raiyaan Infotech</div>
                </div>
            </div>
        </div>
    )
}
