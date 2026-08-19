"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faChevronLeft,
  faChevronRight,
  faCalendarAlt,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────
const leads = [
  { id: 1, name: "Archie Cantones", email: "arcie.tones@gmail.com", avatar: "https://i.pravatar.cc/40?img=5", proposal: "Sent", date: "11/06/2023 10:53", status: "Completed" },
  { id: 2, name: "Holmes Cherryman", email: "golms.chan@gmail.com", avatar: "https://i.pravatar.cc/40?img=6", proposal: "New", date: "11/06/2023 10:53", status: "In Progress" },
  { id: 3, name: "Malanie Hanvey", email: "lanie.nveyn@gmail.com", avatar: "https://i.pravatar.cc/40?img=3", proposal: "Sent", date: "11/06/2023 10:53", status: "Completed" },
  { id: 4, name: "Kenneth Hune", email: "nneth.une@gmail.com", avatar: "https://i.pravatar.cc/40?img=4", proposal: "Returning", date: "11/06/2023 10:53", status: "Not Interested" },
  { id: 5, name: "Valentine Maton", email: "alenine.aton@gmail.com", avatar: "https://i.pravatar.cc/40?img=2", proposal: "Sent", date: "11/06/2023 10:53", status: "Completed" },
];

const schedule = [
  { day: 20, month: "Dec", title: "React Dashboard Design", time: "11:30am - 12:30pm", avatars: [1, 2, 3, 4], color: "#3454d1", bg: "bg-primary/10", border: "border-primary/20", text: "text-primary" },
  { day: 30, month: "Dec", title: "Admin Design Concept", time: "10:00am - 12:00pm", avatars: [2, 3, 5], color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500" },
  { day: 17, month: "Dec", title: "Standup Team Meeting", time: "8:00am - 9:00am", avatars: [1, 2, 3], color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500" },
  { day: 25, month: "Dec", title: "Zoom Team Meeting", time: "03:30pm - 05:30pm", avatars: [2, 4, 5], color: "#7c3aed", bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-500" },
];

const projects = [
  { name: "Apps Development", type: "Applications", percent: 54, img: "https://www.google.com/s2/favicons?sz=64&domain=apple.com" },
  { name: "Dashboard Design", type: "App UI Kit", percent: 86, img: "https://www.google.com/s2/favicons?sz=64&domain=figma.com" },
  { name: "Facebook Marketing", type: "Marketing", percent: 90, img: "https://www.google.com/s2/favicons?sz=64&domain=facebook.com" },
  { name: "React Dashboard Github", type: "Dashboard", percent: 37, img: "https://www.google.com/s2/favicons?sz=64&domain=github.com" },
  { name: "Paypal Payment Gateway", type: "Payment", percent: 29, img: "https://www.google.com/s2/favicons?sz=64&domain=paypal.com" },
];

const team = [
  { name: "Alexandra Della", role: "Frontend Developer", avatar: "https://i.pravatar.cc/40?img=1", progress: 75, color: "bg-primary" },
  { name: "Archie Cantones", role: "UI/UX Designer", avatar: "https://i.pravatar.cc/40?img=5", progress: 90, color: "bg-emerald-500" },
  { name: "Malanie Hanvey", role: "Backend Developer", avatar: "https://i.pravatar.cc/40?img=3", progress: 68, color: "bg-amber-500" },
  { name: "Kenneth Hune", role: "Digital Marketer", avatar: "https://i.pravatar.cc/40?img=4", progress: 55, color: "bg-violet-500" },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "In Progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Not Interested": "bg-rose-500/10 text-rose-500 border-rose-500/20",
    Sent: "bg-muted text-muted-foreground border-border",
    New: "bg-primary/10 text-primary border-primary/20",
    Returning: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  return (
    <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function TablesSection() {
  return (
    <div className="space-y-6">

      {/* Latest Leads Table (full width) */}
      <Card className="border-border shadow-sm overflow-hidden bg-card">
        <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
          <CardTitle className="font-extrabold text-[15px] tracking-tight">Latest Leads</CardTitle>
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
            <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/30">
                  <TableHead className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground">User</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground">Proposal</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground">Date</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground">Status</TableHead>
                  <TableHead className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-[1.5px] text-muted-foreground text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="group hover:bg-muted/50 transition-colors border-none">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-border">
                          <AvatarImage src={lead.avatar} />
                          <AvatarFallback>{lead.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-extrabold text-[13.5px] text-foreground leading-none">{lead.name}</p>
                          <p className="text-[12px] font-medium text-muted-foreground mt-1">{lead.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={lead.proposal} />
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-[13px] font-bold text-muted-foreground flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faCalendarAlt} className="!size-3 text-muted-foreground/70" /> {lead.date}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground group-hover:text-primary">
                        <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between">
          <p className="text-[12px] font-bold text-muted-foreground capitalize">Showing 1 to 5 of 24 entries</p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="size-8 rounded-lg border-border"><FontAwesomeIcon icon={faChevronLeft} className="!size-3.5" /></Button>
            {[1, 2, 3].map((n) => (
              <Button key={n} variant={n === 1 ? "default" : "outline"} size="icon" className={`size-8 rounded-lg ${n === 1 ? 'bg-primary' : 'border-border'}`}>{n}</Button>
            ))}
            <Button variant="outline" size="icon" className="size-8 rounded-lg border-border"><FontAwesomeIcon icon={faChevronRight} className="!size-3.5" /></Button>
          </div>
        </CardFooter>
      </Card>

      {/* Bottom 3 cards row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Schedule */}
        <Card className="border-border shadow-sm overflow-hidden flex flex-col bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Upcoming Schedule</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-2 divide-y divide-border flex-1">
            {schedule.map((event, i) => (
              <div key={i} className="flex gap-4 py-5 first:pt-2 last:pb-2">
                <div className={cn("size-11 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2", event.bg, event.border)}>
                  <span className={cn("text-[16px] font-black leading-none", event.text)}>{event.day}</span>
                  <span className={cn("text-[9px] font-extrabold uppercase tracking-tighter mt-0.5", event.text)}>{event.month}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-extrabold text-[13.5px] text-foreground leading-tight">{event.title}</p>
                  <p className="text-[12px] font-bold text-muted-foreground">{event.time}</p>
                  <div className="flex -space-x-1.5 mt-2">
                    {event.avatars.map((n) => (
                      <Avatar key={n} className="size-6 border-2 border-background">
                        <AvatarImage src={`https://i.pravatar.cc/40?img=${n}`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-6 py-4 border-t border-border bg-muted/10">
            <Button variant="link" className="p-0 h-auto text-[12px] font-extrabold text-primary uppercase tracking-wider group">
              View All Schedule <FontAwesomeIcon icon={faArrowRight} className="ml-1 group-hover:translate-x-1 transition-transform !size-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Project Status */}
        <Card className="border-border shadow-sm overflow-hidden flex flex-col bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Project Progress</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-2 divide-y divide-border flex-1">
            {projects.map((project, i) => (
              <div key={i} className="py-5 first:pt-2 last:pb-2 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 bg-background shadow-sm border border-border rounded-xl p-2 relative overflow-hidden">
                    <Image src={project.img} alt={project.name} fill className="object-contain p-2" unoptimized />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[13.5px] text-foreground leading-tight">{project.name}</p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{project.type}</p>
                  </div>
                  <span className="font-black text-[14px] text-primary">{project.percent}%</span>
                </div>
                <Progress
                  value={project.percent}
                  className="h-1.5"
                  indicatorClassName={
                    project.percent > 70 ? 'bg-emerald-500' : project.percent > 40 ? 'bg-primary' : 'bg-rose-500'
                  }
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-6 py-4 border-t border-border bg-muted/10">
            <Button variant="link" className="p-0 h-auto text-[12px] font-extrabold text-primary uppercase tracking-wider group">
              View All Projects <FontAwesomeIcon icon={faArrowRight} className="ml-1 group-hover:translate-x-1 transition-transform !size-3" />
            </Button>
          </CardFooter>
        </Card>

        {/* Team Progress */}
        <Card className="border-border shadow-sm overflow-hidden flex flex-col bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Team Management</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-2 divide-y divide-border flex-1">
            {team.map((member, i) => (
              <div key={i} className="py-5 first:pt-2 last:pb-2 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 relative">
                    <Avatar className="size-10 border border-border">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[13.5px] text-foreground leading-tight">{member.name}</p>
                    <p className="text-[12px] font-bold text-muted-foreground mt-0.5">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="rounded-lg bg-muted text-foreground font-black border-border">
                    {member.progress}%
                  </Badge>
                </div>
                <Progress
                  value={member.progress}
                  className="h-1.5"
                  indicatorClassName={cn("transition-all duration-500", member.color)}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="px-6 py-4 border-t border-border bg-muted/10">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Last intelligence update: 12m ago
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
