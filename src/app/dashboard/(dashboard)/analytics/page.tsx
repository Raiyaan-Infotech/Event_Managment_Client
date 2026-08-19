"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChevronRight,
    faCalendarAlt,
    faFilter,
    faEllipsisV,
    faEnvelope,
    faPaperPlane,
    faCheckCircle,
    faEye,
    faMousePointer,
    faExclamationCircle,
    faDownload,
    faClock,
    faUser,
    faArrowRight
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

const emailStats = [
    { title: "Total Email", value: "50,545", icon: faEnvelope, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Email Sent", value: "25,000", icon: faPaperPlane, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Emails Delivered", value: "20,354", icon: faCheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Emails Opened", value: "12,422", icon: faEye, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Emails Clicked", value: "6,248", icon: faMousePointer, color: "text-teal-500", bg: "bg-teal-500/10" },
    { title: "Emails Bounce", value: "2,047", icon: faExclamationCircle, color: "text-red-500", bg: "bg-red-500/10" },
]

export default function AnalyticsPage() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = mounted && theme === "dark"

    const visitorsChartOptions: any = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            foreColor: isDark ? '#94a3b8' : '#64748b',
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#3454d1'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: { show: true },
        grid: {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4
        },
        tooltip: { theme: isDark ? 'dark' : 'light' }
    }

    const campaignChartOptions: any = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            foreColor: isDark ? '#94a3b8' : '#64748b',
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                borderRadius: 4,
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        colors: ['#3454d1', isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'],
        grid: {
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4
        },
    }

    const radarChartOptions: any = {
        chart: {
            toolbar: { show: false },
            foreColor: isDark ? '#94a3b8' : '#64748b',
        },
        colors: ['#3454d1', '#22c55e', '#ef4444'],
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        stroke: { width: 2 },
        fill: { opacity: 0.1 },
        markers: { size: 0 },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'center',
            labels: {
                colors: isDark ? '#ffffff' : '#111827',
            }
        },
        grid: {
            show: true,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
        }
    }

    if (!mounted) return null

    return (
        <div className="space-y-6">
            {/* Header & Breadcrumbs - REMOVED because they are in DashboardLayout */}

            <div className="space-y-6">
                {/* Email Reports Section */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {emailStats.map((stat, idx) => (
                        <div key={idx} className="bg-card rounded-xl border border-border p-5 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110", stat.bg)}>
                                <FontAwesomeIcon icon={stat.icon} className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</p>
                            <h4 className=" text-foreground tracking-tight">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visitors Overview */}
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Visitors Overview</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="h-[350px]">
                            {mounted && (
                                <Chart
                                    options={visitorsChartOptions}
                                    series={[{ name: 'Total Reach', data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 95, 110, 130] }]}
                                    type="area"
                                    height="100%"
                                />
                            )}
                        </div>
                    </div>

                    {/* Browser States */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Browser States</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { name: "Chrome", perc: 85, color: "bg-[#3454d1]" },
                                { name: "Safari", perc: 65, color: "bg-[#3454d1]" },
                                { name: "Firefox", perc: 45, color: "bg-[#3454d1]" },
                                { name: "Opera", perc: 35, color: "bg-[#3454d1]" },
                                { name: "Edge", perc: 25, color: "bg-[#3454d1]" },
                                { name: "Others", perc: 15, color: "bg-[#3454d1]" },
                            ].map((browser, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-bold text-muted-foreground">{browser.name}</span>
                                        <span className="text-[12px] text-foreground">{browser.perc}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={cn("h-full transition-all duration-1000", browser.color)} style={{ width: `${browser.perc}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Middle Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Bounce Rate (Avg)", val: "78.65%", trend: "+22.85%", up: true, data: [30, 40, 35, 50, 49, 60, 70] },
                        { label: "Page Views (Avg)", val: "86.37%", trend: "-12.56%", up: false, data: [70, 60, 65, 50, 51, 40, 30] },
                        { label: "Site Impressions (Avg)", val: "67.53%", trend: "+35.21%", up: true, data: [20, 35, 40, 30, 45, 50, 60] },
                        { label: "Conversions Rate (Avg)", val: "32.53%", trend: "+15.89%", up: true, data: [10, 20, 15, 25, 22, 30, 35] },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-card rounded-xl border border-border p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                    <h4 className="text-xl  text-foreground">{item.val}</h4>
                                </div>
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", item.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                    {item.trend}
                                </span>
                            </div>
                            <div className="h-12 w-full">
                                {mounted && (
                                    <Chart
                                        options={{
                                            chart: { sparkline: { enabled: true } },
                                            stroke: { curve: 'smooth', width: 2 },
                                            colors: [item.up ? '#22c55e' : '#ef4444'],
                                            fill: { opacity: 0.1 },
                                            tooltip: { theme: isDark ? 'dark' : 'light' }
                                        }}
                                        series={[{ data: item.data }]}
                                        type="area"
                                        height="100%"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Goal Progress */}
                    <div className="bg-card rounded-xl border border-border p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Goal Progress</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { label: "Marketing Goal", val: "$550/$1250 USD", perc: 40, color: '#ef4444' },
                                { label: "Teams Goal", val: "$550/$1250 USD", perc: 65, color: '#3454d1' },
                                { label: "Leads Goal", val: "$550/$1250 USD", perc: 50, color: '#f59e0b' },
                                { label: "Revenue Goal", val: "$550/$1250 USD", perc: 75, color: '#22c55e' },
                            ].map((goal, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center space-y-4 p-4 border border-dashed border-border rounded-lg">
                                    <div className="relative h-24 w-24">
                                        {mounted && (
                                            <Chart
                                                options={{
                                                    chart: { type: 'radialBar', sparkline: { enabled: true } },
                                                    plotOptions: {
                                                        radialBar: {
                                                            hollow: { size: '65%' },
                                                            dataLabels: {
                                                                name: { show: false },
                                                                value: {
                                                                    offsetY: 6,
                                                                    fontSize: '14px',
                                                                    fontWeight: '900',
                                                                    formatter: (v: any) => `${v}%`
                                                                }
                                                            }
                                                        }
                                                    },
                                                    colors: [goal.color],
                                                }}
                                                series={[goal.perc]}
                                                type="radialBar"
                                                height="100%"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[12px] font-bold text-foreground">{goal.label}</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{goal.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Marketing Campaign */}
                    <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Marketing Campaign</h3>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold tracking-widest uppercase px-3">Weekly</Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 h-[300px]">
                            {mounted && (
                                <Chart
                                    options={campaignChartOptions}
                                    series={[{ name: 'Campaign', data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10] }]}
                                    type="bar"
                                    height="100%"
                                />
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                            {[
                                { l: "Reach", v: "8,546", c: "bg-blue-500" },
                                { l: "Opened", v: "45.23%", c: "bg-green-500" },
                                { l: "Clicked", v: "12.35%", c: "bg-amber-500" },
                                { l: "Bounce", v: "2.45%", c: "bg-red-500" }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">{s.l}</p>
                                    <h5 className="text-[13px] font-bold text-foreground">{s.v}</h5>
                                    <div className={cn("h-1 w-8 mx-auto mt-2 rounded-full", s.c)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Generate Report Button */}
                <div className="py-2">
                    <Button className="w-full bg-[#3454d1] hover:bg-[#3454d1]/90 h-11 text-[12px] font-bold tracking-widest uppercase shadow-lg shadow-primary/10">
                        Generate Report
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Project Remainders */}
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Project Remainders</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Update User Flows with UX Feedback", status: "Working", time: "00 : 00 : 00", desc: "UX Design Team", progress: [1, 1, 1, 0, 0], color: "amber" },
                                { name: "Backend API Integration", status: "In Progress", time: "12 : 30 : 45", desc: "Dev Team", progress: [1, 1, 0, 0, 0], color: "blue" },
                                { name: "Mobile App Refactoring", status: "Pending", time: "05 : 15 : 10", desc: "App Team", progress: [1, 0, 0, 0, 0], color: "red" },
                            ].map((proj, idx) => (
                                <div key={idx} className="group p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-2 w-2 rounded-full bg-muted shrink-0" />
                                        <div>
                                            <h4 className="text-[13px] text-foreground group-hover:text-primary transition-colors">{proj.name}</h4>
                                            <p className="text-[11px] font-medium text-muted-foreground">{proj.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 md:gap-8 justify-between md:justify-end">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded shrink-0",
                                            proj.color === 'amber' ? "bg-amber-500/10 text-amber-500" :
                                                proj.color === 'blue' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {proj.status}
                                        </span>
                                        <div className="flex gap-2 shrink-0">
                                            {proj.time.split(' : ').map((t, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="bg-muted border border-border rounded px-2 py-1 text-[13px] font-bold text-foreground tracking-widest">{t}</div>
                                                    {i < 2 && <span className="font-bold text-muted/50">:</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="hidden sm:flex gap-1 shrink-0">
                                            {proj.progress.map((p, i) => (
                                                <div key={i} className={cn("h-1 w-4 rounded-full", p ? "bg-green-500" : "bg-muted")} />
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border shrink-0">
                                            <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex justify-center gap-2">
                            {[1, 2, '...', 8, 9].map((p, i) => (
                                <Button key={i} variant={p === 1 ? "default" : "outline"} className={cn("h-8 w-8 p-0 text-[11px] font-bold", p === 1 ? "bg-[#3454d1]" : "")}>
                                    {p}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Social Statistics */}
                    <div className="bg-card rounded-xl border border-border p-6 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Social Statistics</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 min-h-[350px]">
                            <Chart
                                options={radarChartOptions}
                                series={[
                                    { name: 'Facebook', data: [80, 50, 30, 40, 100, 20, 80] },
                                    { name: 'Twitter', data: [20, 30, 40, 80, 20, 80, 30] },
                                    { name: 'Youtube', data: [44, 76, 78, 13, 43, 10, 50] }
                                ]}
                                type="radar"
                                height="100%"
                            />
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-[11px] font-bold tracking-widest uppercase border-t border-border pt-6 group">
                            Explore Details <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Footer - REMOVED because it's in DashboardLayout */}
            </div>
        </div>
    )
}
