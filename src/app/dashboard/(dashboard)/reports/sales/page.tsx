"use client"

import dynamic from "next/dynamic"
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faDollarSign,
    faClock,
    faPlus,
    faFilter,
    faEllipsisV,
    faChevronRight,
    faArrowTrendUp,
    faArrowTrendDown,
    faUser,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faTrophy,
    faBullseye,
    faZap,
    faBriefcase,
    faSearch
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const stats = [
    {
        title: "Active Deals",
        value: "$5,658 USD",
        trend: "+23.65%",
        up: true,
        subtext: "vs last month: $4,563 USD",
        icon: faDollarSign,
        color: "text-blue-600",
        bg: "bg-blue-500/10"
    },
    {
        title: "Revenue Deals",
        value: "$89,657 USD",
        trend: "-06.32%",
        up: false,
        subtext: "vs last month: $76,852 USD",
        icon: faClock,
        color: "text-red-500",
        bg: "bg-red-500/10"
    },
    {
        title: "Deals Created",
        value: "$2,354 USD",
        trend: "+30.47%",
        up: true,
        subtext: "vs last month: $1,578 USD",
        icon: faPlus,
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        title: "Deals Closing",
        value: "$2,422 USD",
        trend: "-08.55%",
        up: false,
        subtext: "vs last month: $2,847 USD",
        icon: faTrophy,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    }
]

const leadData = [
    {
        name: "Archie Cantones",
        email: "arcie.tones@gmail.com",
        avatar: "https://i.pravatar.cc/40?img=1",
        company: "theme_ocean",
        amount: "$250.00 USD",
        status: "Completed",
        statusColor: "bg-green-500/10 text-green-500",
        stage: 78
    },
    {
        name: "Holmes Cherryman",
        email: "h.cherryman@gmail.com",
        avatar: "https://i.pravatar.cc/40?img=2",
        company: "theme_ocean",
        amount: "$500.00 USD",
        status: "In Progress",
        statusColor: "bg-blue-500/10 text-blue-500",
        stage: 45
    },
    {
        name: "Malanie Hanvey",
        email: "m.hanvey@outlook.com",
        avatar: "https://i.pravatar.cc/40?img=3",
        company: "theme_ocean",
        amount: "$150.00 USD",
        status: "Completed",
        statusColor: "bg-green-500/10 text-green-500",
        stage: 92
    },
    {
        name: "Valentine Maton",
        email: "v.maton@gmail.com",
        avatar: "https://i.pravatar.cc/40?img=4",
        company: "theme_ocean",
        amount: "$420.00 USD",
        status: "Pending",
        statusColor: "bg-amber-500/10 text-amber-500",
        stage: 15
    },
    {
        name: "Archie Cantones",
        email: "arcie.tones@gmail.com",
        avatar: "https://i.pravatar.cc/40?img=5",
        company: "theme_ocean",
        amount: "$250.00 USD",
        status: "Completed",
        statusColor: "bg-green-500/10 text-green-500",
        stage: 78
    }
]

export default function SalesReportPage() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const salesReportOptions: any = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            foreColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b',
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '25%',
                distributed: true,
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['JAN/23', 'FEB/23', 'MAR/23', 'APR/23', 'MAY/23', 'JUN/23', 'JUL/23', 'AUG/23', 'SEP/23', 'OCT/23', 'NOV/23', 'DEC/23'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (val: number) => `${val / 1000}K`
            }
        },
        colors: [
            'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)',
            '#3454d1', // Highlight APR
            'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)',
            'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)',
            'rgba(52, 84, 209, 0.1)', 'rgba(52, 84, 209, 0.1)'
        ],
        grid: {
            borderColor: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            strokeDashArray: 4,
        },
        legend: { show: false }
    }

    const radialOptions = (color: string): any => ({
        chart: { type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
            radialBar: {
                hollow: { size: '65%' },
                dataLabels: {
                    name: { show: false },
                    value: {
                        offsetY: 6,
                        fontSize: '18px',
                        fontWeight: '900',
                        formatter: (v: any) => `$${v * 10} USD`
                    }
                }
            }
        },
        colors: [color],
        stroke: { lineCap: 'round' }
    })

    if (!isClient) return null

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, idx) => (
                    <Card key={idx} className="border-border shadow-sm transition-all hover:shadow-md hover:-translate-y-1 bg-card">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-lg border border-border", s.bg)}>
                                        <FontAwesomeIcon icon={s.icon} className={cn("h-4 w-4", s.color)} />
                                    </div>
                                    <span className="text-[13px] font-bold text-muted-foreground">{s.title}</span>
                                </div>
                                <span className={cn(
                                    "text-[11px]  px-2 py-0.5 rounded",
                                    s.up ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    {s.trend}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[22px]  tracking-tight text-foreground">{s.value}</h3>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase">{s.subtext}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Sales Pipeline Main Section */}
            <Card className="border-border shadow-sm bg-card">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[14px] font-bold  text-foreground uppercase tracking-widest">Sales Pipeline</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Leads", val: "$47,569", sub: "57 Deals", border: "border-border" },
                            { label: "Proposal", val: "$35,258", sub: "46 Deals", border: "border-border" },
                            { label: "Contract", val: "$24,569", sub: "34 Deals", border: "border-border" },
                            { label: "Project", val: "$53,853", sub: "42 Deals", border: "border-border" },
                        ].map((box, idx) => (
                            <div key={idx} className={cn("p-5 rounded-2xl border border-dashed text-center space-y-1", box.border)}>
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{box.label}</p>
                                <h4 className="text-[20px]  text-foreground">{box.val}</h4>
                                <p className="text-[10px] font-bold text-muted-foreground">{box.sub}</p>
                            </div>
                        ))}
                    </div>

                    <div className="h-[350px] mb-8">
                        <Chart
                            options={salesReportOptions}
                            series={[{ name: 'Sales', data: [20000, 30000, 40000, 50000, 45000, 42000, 38000, 34000, 30000, 28000, 26000, 24000] }]}
                            type="bar"
                            height="100%"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                        {[
                            { label: "Current", val: "$65,658 USD", color: "text-[#3454d1]" },
                            { label: "Overdue", val: "$34,54 USD", color: "text-red-500" },
                            { label: "Additional", val: "$20,478 USD", color: "text-green-500" },
                        ].map((stat, idx) => (
                            <div key={idx} className="space-y-1">
                                <p className="text-[10px]  text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                <h4 className={cn("text-[18px] ", stat.color)}>{stat.val}</h4>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Circular Progress Deals Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border border-dashed bg-card shadow-none">
                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                        <div className="h-32 w-32 shrink-0">
                            <Chart
                                options={radialOptions('#f59e0b')}
                                series={[85]}
                                type="radialBar"
                                height="100%"
                            />
                        </div>
                        <div className="space-y-3 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="https://i.pravatar.cc/40?img=11" />
                                </Avatar>
                                <span className="text-[13px] font-bold text-muted-foreground">Alexandra Della</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[15px]  text-foreground leading-tight">Web development deal with alex</h4>
                                <p className="text-[11px] font-bold text-muted-foreground">Closing date: 24 March, 2023</p>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="https://i.pravatar.cc/40?img=14" />
                                </Avatar>
                                <span className="text-[12px] font-bold text-muted-foreground/60">Holmes Cherryman</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border border-dashed bg-card shadow-none">
                    <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                        <div className="h-32 w-32 shrink-0">
                            <Chart
                                options={radialOptions('#ef4444')}
                                series={[90]}
                                type="radialBar"
                                height="100%"
                            />
                        </div>
                        <div className="space-y-3 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="https://i.pravatar.cc/40?img=12" />
                                </Avatar>
                                <span className="text-[13px] font-bold text-muted-foreground">Green Cute</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-[15px]  text-foreground leading-tight">UI/UX Design deal for app refactoring</h4>
                                <p className="text-[11px] font-bold text-muted-foreground">Closing date: 25 March, 2023</p>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="https://i.pravatar.cc/40?img=15" />
                                </Avatar>
                                <span className="text-[12px] font-bold text-muted-foreground/60">Malanie Hanvey</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Earnings */}
                <Card className="border-border bg-card">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[12px]  text-muted-foreground uppercase tracking-widest">Earnings</h3>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-[22px]  text-foreground">(+) $55,236 USD</h2>
                                    <div className="bg-muted border border-border px-2 py-0.5 rounded text-[10px] font-bold">2023</div>
                                </div>
                                <p className="text-[11px] font-bold text-muted-foreground mt-1">Earnings is 69% more than last...</p>
                            </div>
                        </div>
                        <div className="h-[200px]">
                            <Chart
                                options={{
                                    chart: { type: 'area', sparkline: { enabled: true } },
                                    stroke: { curve: 'smooth', width: 2 },
                                    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
                                    colors: ['#22c55e'],
                                    tooltip: { enabled: false }
                                }}
                                series={[{ name: 'Earnings', data: [31, 40, 28, 51, 42, 109, 100] }]}
                                type="area"
                                height="100%"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Leads Table */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h3 className="text-[14px]  text-foreground uppercase tracking-widest">Contact Leads</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <FontAwesomeIcon icon={faEllipsisV} className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50">
                                <tr className="text-[11px]  text-muted-foreground uppercase tracking-widest border-b border-border">
                                    <th className="px-6 py-4">Lead Name</th>
                                    <th className="px-6 py-4">Company</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Stage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {leadData.map((lead, idx) => (
                                    <tr key={idx} className="group hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarImage src={lead.avatar} />
                                                    <AvatarFallback>{lead.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors">{lead.name}</span>
                                                    <span className="text-[11px] text-muted-foreground">{lead.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg">{lead.company}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[13px]  text-foreground">{lead.amount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("text-[10px]  px-3 py-1 rounded-full", lead.statusColor)}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${lead.stage}%` }} />
                                                </div>
                                                <span className="text-[11px] font-bold text-muted-foreground">{lead.stage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
