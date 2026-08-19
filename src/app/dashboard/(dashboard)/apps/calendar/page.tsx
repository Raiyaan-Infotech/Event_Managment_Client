"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faCalendarDays,
    faPlus,
    faChevronLeft,
    faChevronRight,
    faCheckSquare,
    faMapPin,
    faClock,
    faRotate,
    faPeopleGroup,
    faLock,
    faCog,
    faPen,
    faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const calendarEvents = [
    {
        id: 1,
        month: 1,
        startDate: 1,
        endDate: 2,
        category: "Company",
        title: "Lurhumo ziw kunwiuti.",
        icon: "pin",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: true,
    },
    {
        id: 2,
        month: 1,
        startDate: 1,
        endDate: 1,
        category: "Travel",
        title: "17:00 Vo i...",
        icon: "pin",
        color: "bg-green-100 dark:bg-green-900/40 border-green-400",
        textColor: "text-green-700 dark:text-green-300",
        multiDay: false,
    },
    {
        id: 3,
        month: 1,
        startDate: 6,
        endDate: 8,
        category: "Private",
        title: "Icfi defja kunberkif.",
        icon: "clock",
        color: "bg-orange-100 dark:bg-orange-900/40 border-orange-400",
        textColor: "text-orange-700 dark:text-orange-300",
        multiDay: true,
    },
    {
        id: 4,
        month: 1,
        startDate: 9,
        endDate: 12,
        category: "Company",
        title: "Tab zelagip juluk.",
        icon: "rotate",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: true,
    },
    {
        id: 5,
        month: 1,
        startDate: 14,
        endDate: 14,
        category: "Company",
        title: "07:30 Liru...",
        icon: "rotate",
        color: "bg-slate-200 dark:bg-slate-700/60 border-slate-400",
        textColor: "text-slate-700 dark:text-slate-300",
        multiDay: false,
    },
    {
        id: 6,
        month: 1,
        startDate: 15,
        endDate: 15,
        category: "Private",
        title: "Jeten rovi eti.",
        icon: "people",
        color: "bg-red-100 dark:bg-red-900/40 border-red-400",
        textColor: "text-red-600 dark:text-red-300",
        multiDay: false,
    },
    {
        id: 7,
        month: 1,
        startDate: 16,
        endDate: 16,
        category: "Company",
        title: "Nilowewa be acupefig.",
        icon: "rotate",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: false,
    },
    {
        id: 8,
        month: 1,
        startDate: 17,
        endDate: 17,
        category: "Company",
        title: "Ke jih hoc.",
        icon: "people",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: false,
    },
    {
        id: 9,
        month: 1,
        startDate: 18,
        endDate: 18,
        category: "Travel",
        title: "20:00 Ja...",
        icon: "pin",
        color: "bg-green-100 dark:bg-green-900/40 border-green-400",
        textColor: "text-green-700 dark:text-green-300",
        multiDay: false,
    },
    {
        id: 10,
        month: 1,
        startDate: 24,
        endDate: 24,
        category: "Private",
        title: "13:00 Priv...",
        icon: "lock",
        color: "bg-slate-200 dark:bg-slate-700/60 border-slate-400",
        textColor: "text-slate-700 dark:text-slate-300",
        multiDay: false,
    },
    {
        id: 11,
        month: 2,
        startDate: 1,
        endDate: 1,
        category: "Private",
        title: "12:00 Tat...",
        icon: "rotate",
        color: "bg-red-100 dark:bg-red-900/40 border-red-400",
        textColor: "text-red-600 dark:text-red-300",
        multiDay: false,
    },
    {
        id: 12,
        month: 2,
        startDate: 2,
        endDate: 3,
        category: "Company",
        title: "Viwkazo koimiga bu.",
        icon: "people",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: true,
    },
    {
        id: 13,
        month: 2,
        startDate: 3,
        endDate: 7,
        category: "Company",
        title: "Ko ukikec mi.",
        icon: "people",
        color: "bg-gray-100 dark:bg-gray-800/60 border-gray-300",
        textColor: "text-gray-600 dark:text-gray-300",
        multiDay: true,
    },
    {
        id: 14,
        month: 2,
        startDate: 4,
        endDate: 4,
        category: "Travel",
        title: "14:00 Priv...",
        icon: "lock",
        color: "bg-green-100 dark:bg-green-900/40 border-green-400",
        textColor: "text-green-700 dark:text-green-300",
        multiDay: false,
    },
    {
        id: 15,
        month: 2,
        startDate: 11,
        endDate: 11,
        category: "Company",
        title: "06:00 Pri...",
        icon: "lock",
        color: "bg-green-100 dark:bg-green-900/40 border-green-400",
        textColor: "text-green-700 dark:text-green-300",
        multiDay: false,
    },
    {
        id: 16,
        month: 2,
        startDate: 13,
        endDate: 13,
        category: "Travel",
        title: "08:30 Po...",
        icon: "pin",
        color: "bg-teal-100 dark:bg-teal-900/40 border-teal-400",
        textColor: "text-teal-700 dark:text-teal-300",
        multiDay: false,
    },
]

const categories = [
    { name: "Office", color: "text-blue-600", dot: "bg-blue-600", checked: true },
    { name: "Family", color: "text-teal-600", dot: "bg-teal-600", checked: true },
    { name: "Friend", color: "text-red-600", dot: "bg-red-600", checked: true },
    { name: "Travel", color: "text-green-600", dot: "bg-green-600", checked: true },
    { name: "Private", color: "text-orange-500", dot: "bg-orange-500", checked: true },
    { name: "Holidays", color: "text-blue-600", dot: "bg-blue-600", checked: true },
    { name: "Company", color: "text-cyan-600", dot: "bg-cyan-600", checked: true },
]

const ICON_MAP = {
    pin: faMapPin,
    clock: faClock,
    people: faPeopleGroup,
    lock: faLock,
    rotate: faRotate,
}

export default function CalendarPage() {
    const { theme } = useTheme()
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 26))
    const [events, setEvents] = useState(calendarEvents)
    const [filterCategories, setFilterCategories] = useState(categories)
    const [isAddEventOpen, setIsAddEventOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<any>(null)
    const [newEvent, setNewEvent] = useState({
        title: "",
        category: "Company",
        startDate: 26,
        endDate: 26,
        multiDay: false
    })

    const today = new Date(2026, 1, 26)

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const calendarCells = useMemo(() => {
        const cells = []
        const totalDays = daysInMonth(currentDate)
        const firstDay = firstDayOfMonth(currentDate)

        const prevMonthDays = daysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
        for (let i = firstDay - 1; i >= 0; i--) {
            cells.push({
                day: prevMonthDays - i,
                month: currentDate.getMonth() - 1 < 0 ? 11 : currentDate.getMonth() - 1,
                year: currentDate.getMonth() - 1 < 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear(),
                isCurrentMonth: false,
            })
        }

        for (let i = 1; i <= totalDays; i++) {
            cells.push({
                day: i,
                month: currentDate.getMonth(),
                year: currentDate.getFullYear(),
                isCurrentMonth: true,
            })
        }

        const remaining = 42 - cells.length
        for (let i = 1; i <= remaining; i++) {
            cells.push({
                day: i,
                month: currentDate.getMonth() + 1 > 11 ? 0 : currentDate.getMonth() + 1,
                year: currentDate.getMonth() + 1 > 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear(),
                isCurrentMonth: false,
            })
        }

        return cells
    }, [currentDate])

    const monthName = currentDate.toLocaleString("default", { month: "long" })
    const year = currentDate.getFullYear()
    const dateString = `${String(currentDate.getDate()).padStart(2, "0")}.${String(currentDate.getMonth() + 1).padStart(2, "0")}.${String(year).slice(-2)}`

    const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

    const isToday = (cell: { day: number; month: number; year: number }) =>
        cell.day === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear()

    const getEventsForCell = (cell: { day: number; month: number; year: number }) => {
        const activeCategories = filterCategories.filter(c => c.checked).map(c => c.name);

        return events.filter((ev) => {
            if (!activeCategories.includes(ev.category)) return false;
            if (ev.month !== cell.month) return false
            if (ev.multiDay) {
                return cell.day >= ev.startDate && cell.day <= ev.endDate
            }
            return ev.startDate === cell.day
        })
    }

    const toggleCategory = (name: string) => {
        setFilterCategories(prev => prev.map(c =>
            c.name === name ? { ...c, checked: !c.checked } : c
        ))
    }

    const toggleAllCategories = (checked: boolean) => {
        setFilterCategories(prev => prev.map(c => ({ ...c, checked })))
    }

    const handleDeleteEvent = (id: number) => {
        setEvents(prev => prev.filter(e => e.id !== id))
    }

    const openEditEvent = (event: any) => {
        setEditingEvent(event)
        setNewEvent({
            title: event.title,
            category: event.category,
            startDate: event.startDate,
            endDate: event.endDate || event.startDate,
            multiDay: event.multiDay
        })
        setIsAddEventOpen(true)
    }

    const handleSaveEvent = () => {
        const categoryData = categories.find(c => c.name === newEvent.category) || categories[0];

        const eventData = {
            ...newEvent,
            icon: "clock",
            color: categoryData.name === "Company" ? "bg-cyan-100 dark:bg-cyan-900/40 border-cyan-400" :
                categoryData.name === "Travel" ? "bg-green-100 dark:bg-green-900/40 border-green-400" :
                    categoryData.name === "Private" ? "bg-orange-100 dark:bg-orange-900/40 border-orange-400" :
                        "bg-blue-100 dark:bg-blue-900/40 border-blue-400",
            textColor: categoryData.name === "Company" ? "text-cyan-700 dark:text-cyan-300" :
                categoryData.name === "Travel" ? "text-green-700 dark:text-green-300" :
                    categoryData.name === "Private" ? "text-orange-700 dark:text-orange-300" :
                        "text-blue-700 dark:text-blue-300",
        };

        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e))
        } else {
            const id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            setEvents([...events, { id, month: currentDate.getMonth(), ...eventData }]);
        }

        setIsAddEventOpen(false);
        setEditingEvent(null);
        setNewEvent({ title: "", category: "Company", startDate: 26, endDate: 26, multiDay: false });
    }

    const openAddEvent = (day?: number) => {
        setEditingEvent(null)
        if (day) {
            setNewEvent(prev => ({ ...prev, startDate: day, endDate: day }));
        }
        setIsAddEventOpen(true);
    }

    const getEventDisplay = (ev: typeof calendarEvents[0], cell: { day: number }) => {
        if (!ev.multiDay) return "single"
        if (ev.startDate === cell.day) return "start"
        if (ev.endDate === cell.day) return "end"
        return "continue"
    }

    return (
        <TooltipProvider>
            <div className="flex w-full h-full bg-gray-50 dark:bg-slate-950 overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-[400px] border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-hidden shrink-0">
                    {/* Header */}
                    <div className="h-[72px] border-b border-gray-200 dark:border-slate-800 flex items-center px-6 shrink-0">
                        <h2 className="text-[22px] font-black tracking-tight text-gray-900 dark:text-white">Calendar</h2>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {/* New Event Button */}
                        <Button
                            onClick={() => openAddEvent()}
                            className="w-full h-[46px] bg-[#3454D1] hover:bg-[#2a44a8] text-white font-black rounded-sm text-xs mb-6 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(52,84,209,0.2)]"
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-4" />
                            NEW EVENT
                        </Button>

                        {/* View All Schedules */}
                        <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={filterCategories.every(c => c.checked)}
                                onChange={(e) => toggleAllCategories(e.target.checked)}
                                className="size-4 rounded accent-blue-600"
                            />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">View All Schedules</span>
                        </label>

                        {/* Categories */}
                        <div className="space-y-1 mb-7">
                            {filterCategories.map((category) => (
                                <label key={category.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={category.checked}
                                        onChange={() => toggleCategory(category.name)}
                                        className="size-4 rounded accent-blue-600 border-gray-300"
                                    />
                                    <div className={cn("size-2 rounded-full", category.dot)} />
                                    <span className="text-sm text-gray-700 dark:text-slate-300">{category.name}</span>
                                </label>
                            ))}
                        </div>

                        {/* Events & Schedules */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-3 tracking-widest">Events & Schedules</h3>

                            <div className="space-y-3">
                                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-3 mb-2">
                                        <div className="text-center shrink-0 bg-blue-50 dark:bg-blue-950/40 rounded-lg px-2 py-1 min-w-[44px]">
                                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">21</div>
                                            <div className="text-xs font-bold text-blue-500 dark:text-blue-400 uppercase">DEC</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Standup Design Presentation</h4>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">2:00pm - 5:00pm, Virtual Platform</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        Lorem ipsum quia dolor sit amet, consectetur, adipisci velit, abore et dolore magnam aliquam...
                                    </p>
                                    <div className="flex items-center -space-x-2">
                                        <img src="https://i.pravatar.cc/24?img=5" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=6" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=7" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=8" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-slate-900">...</div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-3 mb-2">
                                        <div className="text-center shrink-0 bg-red-50 dark:bg-red-950/40 rounded-lg px-2 py-1 min-w-[44px]">
                                            <div className="text-xl font-bold text-red-500 dark:text-red-400">14</div>
                                            <div className="text-xs font-bold text-red-400 dark:text-red-400 uppercase">DEC</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Company Start Concept</h4>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">8:00am - 9:00am, Engineering Room</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        Lorem ipsum quia dolor sit amet, consectetur, adipisci velit, abore et dolore magnam aliquam...
                                    </p>
                                    <div className="flex items-center -space-x-2">
                                        <img src="https://i.pravatar.cc/24?img=9" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=10" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=11" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=12" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-slate-900">...</div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-3 mb-2">
                                        <div className="text-center shrink-0 bg-teal-50 dark:bg-teal-950/40 rounded-lg px-2 py-1 min-w-[44px]">
                                            <div className="text-xl font-bold text-teal-600 dark:text-teal-400">08</div>
                                            <div className="text-xs font-bold text-teal-500 dark:text-teal-400 uppercase">JAN</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Team Sync Meeting</h4>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">10:00am - 11:00am, Conference Room A</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        Lorem ipsum quia dolor sit amet, consectetur, adipisci velit, abore et dolore magnam aliquam...
                                    </p>
                                    <div className="flex items-center -space-x-2">
                                        <img src="https://i.pravatar.cc/24?img=13" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=14" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=15" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-slate-900">...</div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-3 mb-2">
                                        <div className="text-center shrink-0 bg-orange-50 dark:bg-orange-950/40 rounded-lg px-2 py-1 min-w-[44px]">
                                            <div className="text-xl font-bold text-orange-500 dark:text-orange-400">19</div>
                                            <div className="text-xs font-bold text-orange-400 dark:text-orange-400 uppercase">JAN</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Product Launch Event</h4>
                                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">9:00am - 6:00pm, Main Hall</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                                        Lorem ipsum quia dolor sit amet, consectetur, adipisci velit, abore et dolore magnam aliquam...
                                    </p>
                                    <div className="flex items-center -space-x-2">
                                        <img src="https://i.pravatar.cc/24?img=16" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=17" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=18" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <img src="https://i.pravatar.cc/24?img=19" alt="" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900" />
                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-slate-900">...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="h-[72px] border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-[34px] px-3 text-[11px] font-bold border-gray-200 dark:border-slate-700 rounded-md">
                                <FontAwesomeIcon icon={faCalendarDays} className="size-3 mr-1.5" />
                                MONTHLY
                            </Button>
                            <Button variant="outline" size="sm" className="h-[34px] px-3 text-[11px] font-bold border-gray-200 dark:border-slate-700 rounded-md">
                                <FontAwesomeIcon icon={faClock} className="size-3 mr-1.5" />
                                TODAY
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[17px] font-black text-gray-900 dark:text-white">{dateString}</div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="size-8 rounded-full border-gray-200 dark:border-slate-700" onClick={previousMonth}>
                                    <FontAwesomeIcon icon={faChevronLeft} className="size-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="size-8 rounded-full border-gray-200 dark:border-slate-700" onClick={nextMonth}>
                                    <FontAwesomeIcon icon={faChevronRight} className="size-3" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-auto bg-white dark:bg-slate-950">
                        <div className="p-4">
                            {/* Day Headers */}
                            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-800">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                                    <div
                                        key={day}
                                        className={`p-3 text-center font-bold text-xs text-gray-600 dark:text-slate-400 border-r last:border-r-0 border-gray-200 dark:border-slate-800 ${i === 0 ? "text-red-500" : ""}`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Cells */}
                            <div className="grid grid-cols-7">
                                {calendarCells.map((cell, idx) => {
                                    const cellEvents = getEventsForCell(cell)
                                    const todayCell = isToday(cell)
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => cell.isCurrentMonth && openAddEvent(cell.day)}
                                            className={cn(
                                                // ✅ FIX: Added overflow-hidden to strictly clip all child content within the cell border
                                                "min-h-[120px] border-r border-b border-gray-100 dark:border-slate-800 transition-colors cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-900/30 overflow-hidden",
                                                !cell.isCurrentMonth ? "bg-gray-50/50 dark:bg-slate-900/20" : "bg-white dark:bg-slate-950",
                                                todayCell && "bg-blue-50 dark:bg-blue-950/20"
                                            )}
                                        >
                                            {/* Day Number — kept in padded container */}
                                            <div className="px-2 pt-2 pb-1">
                                                <div className={cn(
                                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
                                                    todayCell ? "bg-blue-600 text-white" : cell.isCurrentMonth ? "text-gray-800 dark:text-slate-200" : "text-red-400 dark:text-red-500"
                                                )}>
                                                    {cell.day}
                                                </div>
                                            </div>

                                            {/* Events */}
                                            <div className="space-y-0.5 w-full px-1 pb-1 overflow-hidden">
                                                {cellEvents.map((event) => {
                                                    const display = getEventDisplay(event, cell)
                                                    const icon = ICON_MAP[event.icon as keyof typeof ICON_MAP]
                                                    const isMultiDay = event.multiDay

                                                    if (isMultiDay) {
                                                        const isStart = display === "start"
                                                        const isEnd = display === "end"
                                                        const isContinue = display === "continue"

                                                        /*
                                                         * ✅ FIX for color bleed across cell borders:
                                                         *
                                                         * Multi-day bars now use negative horizontal margins (-mx-px on the
                                                         * right for start, -mx-px on the left for end/continue) so they butt
                                                         * up against the cell's border without overflowing it.
                                                         * The parent cell has overflow-hidden which strictly clips them.
                                                         *
                                                         * - START  : rounded on left, flat on right, no right margin gap
                                                         * - CONTINUE: flat on both sides, extends edge-to-edge
                                                         * - END    : flat on left, rounded on right, no left margin gap
                                                         */
                                                        return (
                                                            <Tooltip key={`${event.id}-${cell.day}`}>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                                                                        className={cn(
                                                                            "h- flex items-center cursor-pointer hover:opacity-90 transition-opacity",
                                                                            event.color,
                                                                            // Horizontal positioning: butt against borders
                                                                            isStart    && "ml-2 mr-0 rounded-l-sm rounded-r-none",
                                                                            isContinue && "mx-0 rounded-none",
                                                                            isEnd      && "ml-0 mr-2 rounded-l-none rounded-r-sm",
                                                                        )}
                                                                    >
                                                                        {/* Only show icon + text on the start cell */}
                                                                        {isStart && (
                                                                            <div className={cn("flex items-center gap-1 px-1.5 overflow-hidden", event.textColor)}>
                                                                                {icon && <FontAwesomeIcon icon={icon} className="size-2 shrink-0" />}
                                                                                <span className="text-[10px] font-bold truncate tracking-tight">{event.title}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" sideOffset={5} className="p-0 border-none bg-transparent shadow-none">
                                                                    <div className="w-[260px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                                                                        <div className={cn("h-1.5 w-full", event.color.split(' ')[0])} />
                                                                        <div className="p-4">
                                                                            <h4 className="text-sm font-black mb-2 text-gray-900 dark:text-white leading-tight">{event.title}</h4>
                                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mb-3">
                                                                                <FontAwesomeIcon icon={faClock} className="size-2.5 text-blue-500" />
                                                                                <span>{event.startDate} - {event.endDate} {currentDate.toLocaleString('default', { month: 'short' })}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                                                                                <button onClick={(e) => { e.stopPropagation(); openEditEvent(event); }} className="size-8 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center"><FontAwesomeIcon icon={faPen} className="size-3" /></button>
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="size-8 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"><FontAwesomeIcon icon={faTrash} className="size-3" /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )
                                                    }

                                                    // Single-day event — unchanged pill style
                                                    return (
                                                        <Tooltip key={event.id}>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                                                                    className={cn(
                                                                        "text-[10px] rounded mx-2 px-1.5 py-0.5 flex items-start gap-1 cursor-pointer hover:opacity-100 transition-opacity border-l-2 relative overflow-hidden",
                                                                        event.color,
                                                                        event.textColor
                                                                    )}
                                                                >
                                                                    {icon && <FontAwesomeIcon icon={icon} className="size-2 shrink-0 mt-0.5" />}
                                                                    <span className="truncate font-bold tracking-tight">{event.title}</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" sideOffset={5} className="p-0 border-none bg-transparent shadow-none overflow-visible">
                                                                <div className="w-[260px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                                    <div className={cn("h-1.5 w-full", event.color.split(' ')[0])} />
                                                                    <div className="p-4">
                                                                        <div className="flex items-center justify-between mb-3">
                                                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-opacity-10", event.color.split(' ')[0], event.textColor)}>
                                                                                {event.category}
                                                                            </span>
                                                                            {icon && <FontAwesomeIcon icon={icon} className="size-3.5 text-gray-400/60" />}
                                                                        </div>
                                                                        <h4 className="text-[15px] font-black text-gray-900 dark:text-white leading-tight mb-3">
                                                                            {event.title}
                                                                        </h4>
                                                                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                                                                                <FontAwesomeIcon icon={faClock} className="size-3 text-blue-500" />
                                                                                <span>09:00 AM - 10:00 AM</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 ml-auto">
                                                                                <button onClick={(e) => { e.stopPropagation(); openEditEvent(event); }} className="size-8 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center"><FontAwesomeIcon icon={faPen} className="size-3" /></button>
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="size-8 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"><FontAwesomeIcon icon={faTrash} className="size-3" /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 shrink-0">
                        <span>COPYRIGHT © 2026</span>
                        <div className="flex items-center gap-4">
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">HELP</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">TERMS</a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">PRIVACY</a>
                        </div>
                    </div>
                </div>

                {/* Right Settings Toggle (Floating) */}
                <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
                    <Button className="size-10 bg-[#3454D1] hover:bg-[#2a44a8] text-white rounded-l-md shadow-lg flex items-center justify-center p-0 border-none transition-transform hover:scale-105 active:scale-95">
                        <FontAwesomeIcon icon={faCog} className="size-5" />
                    </Button>
                </div>
            </div>

            {/* Add Event Dialog */}
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900 dark:text-white">
                            {editingEvent ? 'Edit Event' : 'Add New Event'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-gray-500">Event Title</Label>
                            <Input
                                id="title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="Enter event title..."
                                className="h-11 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 font-bold"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-gray-500">Category</Label>
                            <Select
                                value={newEvent.category}
                                onValueChange={(v) => setNewEvent({ ...newEvent, category: v })}
                            >
                                <SelectTrigger className="h-11 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 font-bold">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                                    {categories.map(c => (
                                        <SelectItem key={c.name} value={c.name} className="font-bold">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Date</Label>
                                <div className="h-11 flex items-center px-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-md font-bold text-sm">
                                    {newEvent.startDate} {currentDate.toLocaleString('default', { month: 'short' })}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500">Time</Label>
                                <div className="h-11 flex items-center px-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-md font-bold text-sm">
                                    10:00 AM
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddEventOpen(false)}
                            className="font-black border-gray-200 dark:border-slate-700"
                        >
                            CANCEL
                        </Button>
                        <Button
                            onClick={handleSaveEvent}
                            disabled={!newEvent.title}
                            className="bg-[#3454D1] hover:bg-[#2a44a8] text-white font-black"
                        >
                            {editingEvent ? 'SAVE CHANGES' : 'ADD EVENT'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider >
    )
}
