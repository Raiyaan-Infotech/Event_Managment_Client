"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faEllipsisV,
    faChevronLeft,
    faChevronRight,
    faFilter,
    faPlus,
} from "@fortawesome/free-solid-svg-icons"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const projectStats = [
    {
        title: "NFT Mobile Apps Developemnt",
        deadline: "20 days left",
        progress: 40,
        color: "#3454d1" // Blue
    },
    {
        title: "NFT Mobile Apps Developemnt",
        deadline: "20 days left",
        progress: 85,
        color: "#3454d1" // Indigo-ish (Using same for now or slightly different)
    },
    {
        title: "NFT Mobile Apps Developemnt",
        deadline: "20 days left",
        progress: 50,
        color: "#f59e0b" // Orange
    },
    {
        title: "NFT Mobile Apps Developemnt",
        deadline: "20 days left",
        progress: 75,
        color: "#22c55e" // Green
    }
]

const teamProgress = [
    {
        name: "Alexandra Della",
        role: "Frontend Developer",
        avatar: "https://i.pravatar.cc/40?img=11",
        progress: 40,
        color: "#ef4444"
    },
    {
        name: "Archie Cantones",
        role: "UI/UX Designer",
        avatar: "https://i.pravatar.cc/40?img=12",
        progress: 65,
        color: "#3454d1"
    },
    {
        name: "Malanie Hanvey",
        role: "Backend Developer",
        avatar: "https://i.pravatar.cc/40?img=13",
        progress: 50,
        color: "#f59e0b"
    },
    {
        name: "Kenneth Hune",
        role: "Digital Marketer",
        avatar: "https://i.pravatar.cc/40?img=14",
        progress: 75,
        color: "#22c55e"
    }
]

const activeProjects = [
    { name: "Apps Developemnt", type: "Applications", progress: 54, color: "bg-red-500", icon: "📱" },
    { name: "Dashboard Design", type: "App UI Kit", progress: 86, color: "bg-blue-600", icon: "📊" },
    { name: "Facebook Marketing", type: "Marketing", progress: 90, color: "bg-teal-500", icon: "🌐" },
    { name: "React Dashboard Github", type: "Dashboard", progress: 37, color: "bg-cyan-500", icon: "⚛️" },
    { name: "Paypal Payment Gateway", type: "Payment", progress: 29, color: "bg-orange-500", icon: "💳" }
]

const projectStatsTable = [
    {
        name: "Apps Safety",
        project: "Valentine Maton",
        budget: "$2,550 USD",
        stage: [1, 1, 1, 1, 0, 0],
        status: "In Progress",
        statusColor: "bg-blue-500/10 text-blue-500",
        icon: "📱",
        team: ["https://i.pravatar.cc/40?img=1", "https://i.pravatar.cc/40?img=2", "https://i.pravatar.cc/40?img=3"]
    },
    {
        name: "Github Update",
        project: "Kenneth Hune",
        budget: "$1,200 USD",
        stage: [1, 1, 1, 0, 0, 0],
        status: "On Hold",
        statusColor: "bg-amber-500/10 text-amber-500",
        icon: "Octocat",
        team: ["https://i.pravatar.cc/40?img=4", "https://i.pravatar.cc/40?img=5"]
    },
    {
        name: "Dropbox Customization",
        project: "Malanie Hanvey",
        budget: "$3,300 USD",
        stage: [1, 1, 1, 1, 1, 1],
        status: "Completed",
        statusColor: "bg-green-500/10 text-green-500",
        icon: "📦",
        team: ["https://i.pravatar.cc/40?img=6", "https://i.pravatar.cc/40?img=7", "https://i.pravatar.cc/40?img=8", "https://i.pravatar.cc/40?img=9"]
    },
    {
        name: "Facebook Marketing",
        project: "Archie Cantones",
        budget: "$2,000 USD",
        stage: [1, 1, 1, 1, 0, 0],
        status: "In Progress",
        statusColor: "bg-blue-500/10 text-blue-500",
        icon: "🌐",
        team: ["https://i.pravatar.cc/40?img=10", "https://i.pravatar.cc/40?img=11"]
    },
    {
        name: "Figma Dashboard",
        project: "Valentine Maton",
        budget: "$2,550 USD",
        stage: [1, 1, 1, 0, 0, 0],
        status: "Upcomming",
        statusColor: "bg-cyan-500/10 text-cyan-500",
        icon: "🎨",
        team: ["https://i.pravatar.cc/40?img=12", "https://i.pravatar.cc/40?img=13"]
    }
]

export default function ProjectReportPage() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const projectReportOptions: any = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        stroke: { curve: 'smooth', width: 2, dashArray: [0, 5, 5] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Saturday', 'Sunday', 'Monday', 'Thusday', 'Wensday', 'Thusday', 'Friday'],
            axisBorder: { show: false }, axisTicks: { show: false },
            labels: { style: { fontSize: '11px', fontWeight: 600 } }
        },
        yaxis: {
            min: 10, max: 80, tickAmount: 7,
            labels: {
                formatter: (val: number) => `${val}K`,
                style: { fontSize: '11px', fontWeight: 600 }
            }
        },
        colors: ['#3454d1', '#22c55e', '#f59e0b'],
        grid: {
            borderColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '11px',
            fontWeight: 700,
            markers: { radius: 12 },
            itemMargin: { horizontal: 10 }
        }
    }

    const hoursSpentOptions: any = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        plotOptions: { bar: { borderRadius: 10, columnWidth: '25%' } },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['SAT', 'SUN', 'MON', 'THU', 'WEN', 'THU', 'FRI'],
            axisBorder: { show: false }, axisTicks: { show: false }
        },
        yaxis: { labels: { formatter: (val: number) => `${val}M` } },
        colors: [
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            '#3454d1',
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
        ],
        grid: { show: false }
    }

    const circleProgressOptions = (color: string): any => ({
        chart: { type: 'radialBar', height: 80, sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                hollow: { size: '60%' },
                track: { background: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f1f5f9' },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: 6, fontSize: '14px', fontWeight: '700',
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#ffffff' : '#1e293b',
                        formatter: (val: number) => `${val}%`
                    }
                }
            }
        },
        colors: [color],
        stroke: { lineCap: 'round' }
    })

    if (!isClient) return null

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div>
                    <h4 className="text-[20px] font-black text-foreground">Projects</h4>
                    <p className="text-[13px] font-bold text-muted-foreground">Recent project progress</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-9 text-[11px] font-black uppercase tracking-widest text-muted-foreground border-border bg-card hover:bg-muted shadow-sm">
                        VIEW ALLS
                    </Button>
                </div>
            </div>

            {/* Top Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {projectStats.map((stat, idx) => (
                    <Card key={idx} className="border-border shadow-sm bg-card relative overflow-hidden group hover:shadow-md transition-all border-dashed">
                        <div className="absolute top-0 left-0 bottom-0 w-[40px] bg-muted/50 border-r border-border flex items-center justify-center">
                            <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Updates</span>
                        </div>
                        <CardContent className="p-6 pl-[60px] flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-[14px] font-black text-foreground leading-tight pr-4">{stat.title}</h3>
                                <p className="text-[12px] font-bold text-muted-foreground">Deadiline: {stat.deadline}</p>
                            </div>
                            <div className="h-16 w-16 shrink-0">
                                <Chart options={circleProgressOptions(stat.color)} series={[stat.progress]} type="radialBar" height={80} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Project Report Chart */}
            <Card className="border-border shadow-sm bg-card overflow-hidden">
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Project Report</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground bg-muted rounded-full">
                            <FontAwesomeIcon icon={faFilter} className="!size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="!size-3.5" />
                        </Button>
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full">
                        <Chart
                            options={projectReportOptions}
                            series={[
                                { name: 'Income', data: [20, 48, 32, 62, 55, 42, 80] },
                                { name: 'Outcome', data: [30, 25, 42, 35, 52, 45, 60] },
                                { name: 'Revenue', data: [18, 35, 25, 50, 40, 65, 45] }
                            ]}
                            type="area"
                            height="100%"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card className="border-border shadow-sm bg-card">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border hover:bg-muted">
                                <FontAwesomeIcon icon={faChevronLeft} className="!size-3" />
                            </Button>
                            <div className="text-center">
                                <h4 className="text-[13px] font-black text-foreground uppercase tracking-widest">February</h4>
                                <p className="text-[11px] font-bold text-muted-foreground">2026</p>
                            </div>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border hover:bg-muted">
                                <FontAwesomeIcon icon={faChevronRight} className="!size-3" />
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-7 gap-y-6 text-center">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                <span key={day} className="text-[11px] font-black text-muted-foreground tracking-wider">{day}</span>
                            ))}
                            {[26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 1].map((date, i) => {
                                const isCurrentMonth = i >= 6 && i <= 33;
                                const isToday = date === 23 && isCurrentMonth;
                                const hasEvent = [21, 22, 24, 28].includes(date) && isCurrentMonth;
                                return (
                                    <div key={i} className="flex flex-col items-center justify-center p-2 relative">
                                        <span className={cn(
                                            "text-[13px] font-bold transition-colors w-10 h-10 flex items-center justify-center rounded-full cursor-pointer",
                                            !isCurrentMonth ? "text-muted-foreground/30" : (isToday ? "bg-[#3454d1] text-white shadow-lg shadow-blue-200/50" : "text-foreground hover:bg-muted"),
                                        )}>
                                            {date}
                                        </span>
                                        {hasEvent && !isToday && <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500/50" />}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Hours Spent */}
                <Card className="border-border shadow-sm bg-card">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Hours Spent</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6">
                        <div className="h-[300px] w-full">
                            <Chart options={hoursSpentOptions} series={[{ name: 'Hours', data: [200, 300, 420, 500, 450, 420, 380] }]} type="bar" height="100%" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-border">
                            <div className="text-center space-y-1">
                                <h4 className="text-[20px] font-black text-foreground leading-none">66H:35M</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Billable Hours</p>
                            </div>
                            <div className="text-center space-y-1 border-l border-border">
                                <h4 className="text-[20px] font-black text-foreground leading-none">06H:25M</h4>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unbillable Hours</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team Progress */}
                <Card className="border-border shadow-sm bg-card">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Team Progress</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                        </Button>
                    </div>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {teamProgress.map((team, idx) => (
                                <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-muted/50 transition-colors group gap-4">
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <Avatar className="h-10 w-10 border border-border group-hover:border-primary transition-colors">
                                            <AvatarImage src={team.avatar} />
                                            <AvatarFallback>{team.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-0.5">
                                            <h4 className="text-[14px] font-black text-foreground">{team.name}</h4>
                                            <p className="text-[12px] font-bold text-muted-foreground">{team.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        <div className="h-12 w-12 shrink-0">
                                            <Chart options={circleProgressOptions(team.color)} series={[team.progress]} type="radialBar" height={50} />
                                        </div>
                                        <Button variant="outline" className="h-8 px-4 text-[10px] font-black text-primary border-primary/20 bg-primary/5 hover:bg-primary hover:text-white transition-all uppercase tracking-widest">View</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Project */}
                <Card className="border-border shadow-sm flex flex-col bg-card">
                    <div className="p-6 flex justify-between items-center">
                        <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Active Project</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6 pt-0 space-y-6 flex-1">
                        {activeProjects.map((proj, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl shadow-sm border border-border">{proj.icon}</div>
                                        <div>
                                            <h4 className="text-[14px] font-black text-foreground">{proj.name}</h4>
                                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{proj.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-[13px] font-black text-muted-foreground">{proj.progress}%</span>
                                </div>
                                <Progress value={proj.progress} className="h-1 bg-muted" />
                            </div>
                        ))}
                    </CardContent>
                    <div className="p-4 border-t border-border text-center">
                        <Button variant="ghost" className="text-[11px] font-black text-muted-foreground uppercase tracking-[2px] hover:text-primary transition-colors">Upcoming Projects</Button>
                    </div>
                </Card>
            </div>

            {/* Projects Stats Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Projects Stats</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-muted/50">
                            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border italic">
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Budgets <FontAwesomeIcon icon={faChevronRight} className="inline rotate-90 !size-2" /></th>
                                <th className="px-6 py-4">Stage</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Team</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {projectStatsTable.map((proj, idx) => (
                                <tr key={idx} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xl shrink-0">
                                                {proj.icon === "Octocat" ? <FontAwesomeIcon icon={faGithub} className="!size-5" /> : proj.icon}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-[13px] font-bold text-foreground leading-tight">{proj.name}</h4>
                                                <p className="text-[11px] font-medium text-muted-foreground">Project: {proj.project}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="text-[13px] font-black text-foreground">{proj.budget}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1.5">
                                            {proj.stage.map((active, k) => (
                                                <div key={k} className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-green-500" : "bg-muted")} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wider", proj.statusColor)}>{proj.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2.5">
                                            {proj.team.map((avatar, k) => (
                                                <Avatar key={k} className="h-7 w-7 border-2 border-background shadow-sm shrink-0">
                                                    <AvatarImage src={avatar} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border hover:border-primary hover:text-primary group-hover:translate-x-1 transition-all shadow-sm">
                                            <FontAwesomeIcon icon={faChevronRight} className="!size-3" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-6 border-t border-border flex items-center justify-start gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border text-muted-foreground"><FontAwesomeIcon icon={faChevronLeft} className="!size-3" /></Button>
                    <Button variant="default" className="h-8 w-8 rounded-full bg-primary text-white p-0 text-xs font-bold">1</Button>
                    <Button variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground p-0 text-xs font-bold hover:bg-muted">2</Button>
                    <span className="text-muted-foreground/30 mx-1">...</span>
                    <Button variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground p-0 text-xs font-bold hover:bg-muted">8</Button>
                    <Button variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground p-0 text-xs font-bold hover:bg-muted">9</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border text-muted-foreground"><FontAwesomeIcon icon={faChevronRight} className="!size-3" /></Button>
                </div>
            </div>

            {/* Upcoming Schedule */}
            <Card className="border-border shadow-sm mb-10 bg-card">
                <div className="p-6 flex justify-between items-center">
                    <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest">Upcomming Schedule</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                    </Button>
                </div>
                <CardContent className="p-6 pt-0 relative">
                    <div className="absolute left-[95px] top-6 bottom-10 w-px bg-border hidden md:block" />
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-card hover:bg-muted/50 transition-all border border-border shadow-sm group relative">
                            <div className="bg-muted p-3 rounded-xl border border-border text-center min-w-[70px] z-10 transition-colors group-hover:bg-card">
                                <h2 className="text-[20px] font-black text-primary leading-none">20</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">DEC</p>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="text-[15px] font-black text-foreground">React Dashboard Design</h4>
                                <p className="text-[12px] font-bold text-muted-foreground">11:30am - 12:30pm</p>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <Avatar key={i} className="h-9 w-9 border-2 border-background shadow-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            <AvatarImage src={`https://i.pravatar.cc/40?img=${i + 20}`} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>
                                <Button variant="ghost" size="icon" className="size-8 rounded-full text-slate-300">
                                    <FontAwesomeIcon icon={faEllipsisV} className="!size-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
