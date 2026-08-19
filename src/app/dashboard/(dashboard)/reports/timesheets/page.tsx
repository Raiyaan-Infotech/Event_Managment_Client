"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faEllipsisV,
    faGlobe,
    faPrint,
    faBell,
    faComment,
    faClock,
    faArrowTrendUp,
    faArrowTrendDown
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const summaryCards = [
    {
        title: "REGULAR",
        value: "42H : 35M",
        trend: "56.67%",
        isUp: true,
        desc: "Up from last week"
    },
    {
        title: "OVERTIME",
        value: "12H : 40M",
        trend: "23.49%",
        isUp: false,
        desc: "Down from last week"
    },
    {
        title: "BILLABLE",
        value: "35H : 30M",
        trend: "43.85%",
        isUp: true,
        desc: "Up from last week"
    },
    {
        title: "UNBILLABLE",
        value: "10H : 25M",
        trend: "20.46%",
        isUp: false,
        desc: "Down from last week"
    }
]

const projectTrackerData = [
    {
        name: "Search inspiration for project",
        icon: "🎨",
        timeLogged: "04:00 PM",
        comments: 32,
        status: 86,
        timeRange: "08:30 - 09:30",
        totalLogged: "00/h : 52/m : 34/s",
        tasks: "3/5 Tasks"
    },
    {
        name: "React admnin dashboard design",
        icon: "📊",
        timeLogged: "05:00 PM",
        comments: 45,
        status: 46,
        timeRange: "09:30 - 10:30",
        totalLogged: "00/h : 50/m : 46/s",
        tasks: "2/8 Tasks"
    },
    {
        name: "Laravel ecommerce project tasks",
        icon: "🛍️",
        timeLogged: "06:00 PM",
        comments: 22,
        status: 65,
        timeRange: "11:00 - 12:30",
        totalLogged: "00/h : 56/m : 47/s",
        tasks: "5/10 Tasks"
    },
    {
        name: "Search inspiration for project",
        icon: "🔎",
        timeLogged: "07:00 PM",
        comments: 36,
        status: 75,
        timeRange: "12:30 - 14:30",
        totalLogged: "01/h : 48/m : 36/s",
        tasks: "4/6 Tasks"
    },
    {
        name: "Digital marketing for react project",
        icon: "📈",
        timeLogged: "08:30 PM",
        comments: 42,
        status: 80,
        timeRange: "11:00 - 12:30",
        totalLogged: "01/h : 22/m : 52/s",
        tasks: "6/8 Tasks"
    }
]

export default function TimesheetsPage() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const timeLoggedOptions: any = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        stroke: { curve: 'smooth', width: 3, colors: ['#3454d1'] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['1 Nov', '2 Nov', '3 Nov', '4 Nov', '5 Nov', '6 Nov', '7 Nov', '8 Nov', '9 Nov', '10 Nov'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { fontSize: '11px', fontWeight: 600 } }
        },
        yaxis: {
            labels: {
                style: { fontSize: '11px', fontWeight: 600 }
            }
        },
        colors: ['#3454d1'],
        grid: {
            borderColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#e5eaf2',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        tooltip: {
            theme: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            x: { show: false }
        }
    }

    const billableTimeOptions: any = {
        chart: { type: 'radialBar', height: 350 },
        plotOptions: {
            radialBar: {
                hollow: { size: '65%' },
                track: { background: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.05)' : '#f2f5f9' },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '13px',
                        fontWeight: 600,
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        fontSize: '30px',
                        fontWeight: 800,
                        color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                        offsetY: 5,
                        formatter: (val: number) => `${val}%`
                    }
                }
            }
        },
        colors: ['#3454d1'],
        stroke: { lineCap: 'round' },
        labels: ['Billable'],
    }

    if (!isClient) return null

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <Card key={idx} className="border-border shadow-sm rounded-[4px] bg-card transition-all">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
                                <h2 className="text-[22px] font-bold text-foreground">{card.value}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={cn(
                                        "flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded",
                                        card.isUp ? "text-[#25b76e] bg-[#25b76e]/10" : "text-[#ea4d4d] bg-[#ea4d4d]/10"
                                    )}>
                                        {card.isUp ? <FontAwesomeIcon icon={faArrowTrendUp} className="size-3.5" /> : <FontAwesomeIcon icon={faArrowTrendDown} className="size-3.5" />}
                                        {card.trend}
                                    </div>
                                    <span className="text-[12px] font-medium text-muted-foreground">{card.desc}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Time Logged Area Chart */}
                <Card className="lg:col-span-2 border-border shadow-sm rounded-[4px] bg-card">
                    <div className="p-6 flex justify-between items-center border-b border-border">
                        <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Time Logged</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6">
                        <div className="h-[350px] w-full">
                            <Chart
                                options={timeLoggedOptions}
                                series={[{ name: 'Logged Time', data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 110] }]}
                                type="area"
                                height="100%"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Billable Time Radial Chart & Stats */}
                <Card className="border-border shadow-sm rounded-[4px] bg-card flex flex-col">
                    <div className="p-6 flex justify-between items-center border-b border-border">
                        <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Billable Time</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                        </Button>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="h-[250px] w-full">
                            <Chart
                                options={billableTimeOptions}
                                series={[76]}
                                type="radialBar"
                                height="100%"
                            />
                        </div>
                        <div className="mt-8 space-y-4 pt-6 border-t border-border">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-muted-foreground">13/20 Projects Completed</span>
                                <span className="text-[13px] font-bold text-[#3454d1]">65%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] font-bold text-muted-foreground">00/25 Projects Upcomming</span>
                                <span className="text-[13px] font-bold text-muted-foreground">0%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Tracker Table */}
            <Card className="border-border shadow-sm rounded-[4px] bg-card overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-[14px] font-bold text-foreground uppercase tracking-wider">Project Tracker</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted">
                            <tr className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                                <th className="px-6 py-4">PROJECT</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">TIME</th>
                                <th className="px-6 py-4">LOGGED</th>
                                <th className="px-6 py-4 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {projectTrackerData.map((proj, idx) => (
                                <tr key={idx} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xl shrink-0 border border-border">
                                                {proj.icon}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-[14px] font-bold text-foreground leading-tight">{proj.name}</h4>
                                                <div className="flex items-center gap-3 text-[12px] font-medium text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faClock} className="size-[13px] text-muted-foreground/50" />
                                                        {proj.timeLogged}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faComment} className="size-[13px] text-muted-foreground/50" />
                                                        {proj.comments} comments
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-32 space-y-1.5">
                                            <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground">
                                                <span>{proj.status}% Completed</span>
                                            </div>
                                            <Progress value={proj.status} className="h-1 bg-muted" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-medium text-foreground">{proj.timeRange}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-bold text-foreground">{proj.totalLogged}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                <FontAwesomeIcon icon={faGlobe} className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                <FontAwesomeIcon icon={faPrint} className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                <FontAwesomeIcon icon={faBell} className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
