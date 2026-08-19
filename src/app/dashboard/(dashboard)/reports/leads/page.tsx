"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faEllipsisV,
    faArrowTrendUp,
    faArrowTrendDown,
    faSearch,
    faFilter,
    faCalendarAlt,
    faShareAlt,
    faDownload,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faExternalLinkAlt,
    faClock,
    faCheckCircle,
    faExclamationCircle,
    faUserPlus,
    faBullseye,
    faChartBar
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const stats = [
    {
        title: "Total Inquiry",
        value: "32,458",
        trend: "+20.36%",
        up: true,
        icon: faEnvelope,
        color: "text-blue-600",
        bg: "bg-blue-500/10"
    },
    {
        title: "Performance",
        value: "45.68%",
        trend: "-10.46%",
        up: false,
        icon: faBullseye,
        color: "text-rose-500",
        bg: "bg-rose-500/10"
    },
    {
        title: "Escalations",
        value: "985",
        trend: "+25.48%",
        up: true,
        icon: faExclamationCircle,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        title: "SLA Compliant",
        value: "895",
        trend: "+15.39%",
        up: true,
        icon: faCheckCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        title: "Avg. Time (H)",
        value: "03.45",
        trend: "-12.86%",
        up: false,
        icon: faClock,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    },
    {
        title: "Avg. Fulfillment",
        value: "65.95%",
        trend: "+20.35%",
        up: true,
        icon: faChartBar,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    }
]

const leadStatus = [
    {
        name: "Archie Tones",
        role: "Sale Rep",
        avatar: "https://i.pravatar.cc/40?img=11",
        date: "24 Mar, 2023",
        status: "Deal Won",
        statusType: "success",
        value: "$15.65K"
    },
    {
        name: "Holmes Cherry",
        role: "Sale Rep",
        avatar: "https://i.pravatar.cc/40?img=12",
        date: "22 Mar, 2023",
        status: "Intro Call",
        statusType: "info",
        value: "$10.24K"
    },
    {
        name: "Kenneth Hune",
        role: "Sale Rep",
        avatar: "https://i.pravatar.cc/40?img=13",
        date: "20 Mar, 2023",
        status: "Stuck",
        statusType: "danger",
        value: "$12.47K"
    },
    {
        name: "Malanie Hanvey",
        role: "Sale Rep",
        avatar: "https://i.pravatar.cc/40?img=14",
        date: "18 Mar, 2023",
        status: "Nurturing",
        statusType: "warning",
        value: "$08.35K"
    },
    {
        name: "Valentine Maton",
        role: "Sale Rep",
        avatar: "https://i.pravatar.cc/40?img=15",
        date: "15 Mar, 2023",
        status: "Qualifying",
        statusType: "primary",
        value: "$05.42K"
    }
]

const projectLeads = [
    {
        title: "React admin dashboard",
        revenue: "$3,500 - $6,500",
        progress: 75,
        status: "Inprogress",
        statusColor: "text-blue-500 bg-blue-500/10"
    },
    {
        title: "E-commerce App Design",
        revenue: "$2,800 - $4,200",
        progress: 100,
        status: "Completed",
        statusColor: "text-green-500 bg-green-500/10"
    },
    {
        title: "Mobile CRM Application",
        revenue: "$5,200 - $8,100",
        progress: 30,
        status: "Upcoming",
        statusColor: "text-amber-500 bg-amber-500/10"
    }
]

export default function LeadsReportPage() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const inquiryTrackingOptions: any = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        plotOptions: {
            bar: {
                borderRadius: 5,
                columnWidth: '35%',
                distributed: false,
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { fontWeight: 600, fontSize: '11px' }
            }
        },
        yaxis: {
            labels: {
                formatter: (val: number) => `${val}K`,
                style: { fontWeight: 600, fontSize: '11px' }
            }
        },
        colors: ['#4C8EF7'],
        grid: {
            borderColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4,
            padding: { left: 0, right: 0 }
        },
        tooltip: {
            theme: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            y: { formatter: (val: any) => `${val}K Inquiries` }
        }
    }

    const inquiryChannelOptions: any = {
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'inherit',
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        plotOptions: {
            bar: {
                columnWidth: '40%',
                borderRadius: 0,
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { fontWeight: 600, fontSize: '11px' }
            }
        },
        yaxis: {
            labels: {
                style: { fontWeight: 600, fontSize: '11px' }
            }
        },
        colors: ['#3454d1', '#4C8EF7', '#ffa500', '#28C76F', '#ffc107'],
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '11px',
            fontWeight: 700,
            markers: { radius: 12, size: 4 },
            itemMargin: { horizontal: 10 }
        },
        grid: {
            borderColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4,
            padding: { left: 0, right: 0 }
        },
    }

    if (!isClient) return null

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header / Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div>
                    <h2 className="text-[20px] font-black text-foreground tracking-tight">Leads Report</h2>
                    <p className="text-[13px] font-bold text-muted-foreground mt-1">Detailed analysis of your inquiry channels and performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 rounded-xl bg-muted border-border text-muted-foreground font-bold text-[13px] px-5 hover:bg-muted/80 transition-all">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 h-4 w-4 text-primary" /> 01 Jan 2023 - 31 Dec 2023
                    </Button>
                    <Button className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-[13px] px-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                        <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {stats.map((s, idx) => (
                    <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card group select-none cursor-default">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-5">
                                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110 duration-300", s.bg)}>
                                    <FontAwesomeIcon icon={s.icon} className={cn("h-5 w-5", s.color)} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                    s.up ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                                )}>
                                    {s.up ? <FontAwesomeIcon icon={faArrowTrendUp} className="h-3 w-3" /> : <FontAwesomeIcon icon={faArrowTrendDown} className="h-3 w-3" />}
                                    {s.trend}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">{s.title}</p>
                                <h3 className="text-[26px] font-black text-foreground tracking-tight">{s.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <h3 className="text-[15px] font-black text-foreground uppercase tracking-wider">Inquiry Tracking</h3>
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-xl">
                                <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-6 h-[350px]">
                            <Chart
                                options={inquiryTrackingOptions}
                                series={[{ name: 'Inquiries', data: [28, 35, 42, 48, 48, 52, 45, 40, 55, 50, 48, 60] }]}
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <h3 className="text-[15px] font-black text-foreground uppercase tracking-wider">Inquiry Channel</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" className="h-8 text-[11px] font-bold text-muted-foreground px-3 bg-muted rounded-lg">Last 6 Months</Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-xl">
                                    <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="p-6 h-[350px]">
                            <Chart
                                options={inquiryChannelOptions}
                                series={[
                                    { name: 'Leads', data: [44, 55, 41, 67, 22, 43] },
                                    { name: 'Active', data: [13, 23, 20, 8, 13, 27] },
                                    { name: 'Pending', data: [11, 17, 15, 15, 21, 14] },
                                    { name: 'Resolved', data: [21, 7, 25, 13, 22, 8] },
                                    { name: 'Cancelled', data: [9, 7, 5, 12, 11, 23] }
                                ]}
                                type="bar"
                                height="100%"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables and Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leads Status Table */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-card">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-[15px] font-black text-foreground uppercase tracking-wider">Leads Status</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative group">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search leads..."
                                    className="pl-9 pr-4 h-10 w-full sm:w-[220px] bg-muted border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground bg-muted hover:bg-muted/80 rounded-xl">
                                <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10.5px] font-black text-muted-foreground uppercase tracking-[1.5px] bg-muted/50">
                                    <th className="px-6 py-4">Sale representative</th>
                                    <th className="px-6 py-4">Contacted date</th>
                                    <th className="px-6 py-4">Current Status</th>
                                    <th className="px-6 py-4">Value</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leadStatus.map((lead, idx) => (
                                    <tr key={idx} className="group hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                        <AvatarImage src={lead.avatar} />
                                                        <AvatarFallback>{lead.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-background rounded-full" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13.5px] font-black text-foreground">{lead.name}</span>
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{lead.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12.5px] font-bold text-muted-foreground">{lead.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={cn(
                                                "text-[9.5px] font-black px-3 py-1 rounded-full border-none shadow-sm uppercase tracking-wider",
                                                lead.statusType === 'success' ? "bg-emerald-500/10 text-emerald-500" :
                                                    lead.statusType === 'info' ? "bg-blue-500/10 text-blue-500" :
                                                        lead.statusType === 'danger' ? "bg-rose-500/10 text-rose-500" :
                                                            lead.statusType === 'warning' ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
                                            )}>
                                                {lead.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[14px] font-black text-foreground">{lead.value}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5">
                                                    <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5">
                                                    <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5">
                                                    <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Project Leads Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[15px] font-black text-foreground uppercase tracking-wider">Project Leads</h3>
                        <Button variant="link" className="text-[12px] font-black text-primary p-0 h-auto hover:no-underline">View Details</Button>
                    </div>
                    {projectLeads.map((p, idx) => (
                        <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card group hover:-translate-y-1">
                            <CardContent className="p-5">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <h4 className="text-[14px] font-black text-foreground leading-tight">{p.title}</h4>
                                            <p className="text-[11px] font-bold text-muted-foreground">Revenue: {p.revenue}</p>
                                        </div>
                                        <Badge className={cn("text-[10px] font-black px-2 py-0.5 rounded-lg border-none", p.statusColor)}>
                                            {p.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[11px] font-black">
                                            <span className="text-muted-foreground uppercase tracking-widest">Progress</span>
                                            <span className="text-foreground">{p.progress}%</span>
                                        </div>
                                        <Progress value={p.progress} className="h-1.5" />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map((i) => (
                                                <Avatar key={i} className="h-7 w-7 border-2 border-background ring-1 ring-border">
                                                    <AvatarImage src={`https://i.pravatar.cc/40?img=${10 + i}`} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                                +5
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/5">
                                            <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Quick Analytics Mini Card */}
                    <Card className="bg-primary border-none shadow-lg overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faChartBar} size="6x" strokeWidth={1} />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="space-y-4">
                                <div className="p-2 bg-white/20 w-fit rounded-lg">
                                    <FontAwesomeIcon icon={faBullseye} className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-[16px]">Monthly Target</h4>
                                    <p className="text-white/70 text-[12px] font-medium">You have reached 85% of your goal</p>
                                </div>
                                <Button className="w-full bg-white text-primary hover:bg-slate-50 font-black text-[12px] h-10 rounded-xl">
                                    View Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
