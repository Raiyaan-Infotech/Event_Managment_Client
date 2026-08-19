"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faChartLine, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ─── Simple SVG Sparkline ─────────────────────────────────────────────────────
function Sparkline({
  data,
  color = "#3454d1",
  fill = false,
}: {
  data: number[];
  color?: string;
  fill?: boolean;
}) {
  const w = 100,
    h = 50;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: Number(((i / (data.length - 1)) * w).toFixed(2)),
    y: Number((h - ((v - min) / range) * (h - 4) - 2).toFixed(2)),
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `M ${points[0].x},${h} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      {fill && (
        <path d={area} fill={color} opacity="0.15" />
      )}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Bar Chart (pure SVG) ─────────────────────────────────────────────────────
function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const h = 160;

  return (
    <svg viewBox={`0 0 ${data.length * 40} ${h + 20}`} className="w-full h-full">
      {data.map((v, i) => {
        const barH = (v / max) * h;
        const x = i * 40 + 8;
        const y = h - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={24}
              height={barH}
              rx={6}
              fill="currentColor"
              className="text-primary"
              opacity={0.8 + (i / data.length) * 0.2}
            />
            <text
              x={x + 12}
              y={h + 14}
              textAnchor="middle"
              fontSize={10}
              className="fill-muted-foreground font-bold"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut Chart (pure SVG) ───────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const r = 55, cx = 70, cy = 70;
  const total = segments.reduce((a, b) => a + b.value, 0);
  const arcs = segments.map((seg, i) => {
    const prevSum = segments.slice(0, i).reduce((sum, s) => sum + s.value, 0);
    const startAngle = -Math.PI / 2 + (prevSum / total) * 2 * Math.PI;
    const endAngle = startAngle + (seg.value / total) * 2 * Math.PI;

    const x1 = Number((cx + r * Math.cos(startAngle)).toFixed(2));
    const y1 = Number((cy + r * Math.sin(startAngle)).toFixed(2));
    const x2 = Number((cx + r * Math.cos(endAngle)).toFixed(2));
    const y2 = Number((cy + r * Math.sin(endAngle)).toFixed(2));
    const large = (seg.value / total) * 2 * Math.PI > Math.PI ? 1 : 0;

    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: seg.color,
    };
  });

  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill={arc.color} opacity={0.9} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.55} className="fill-card" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={14} className="font-extrabold fill-foreground">
        12.8K
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} className="fill-muted-foreground font-bold uppercase tracking-wider">
        Total
      </text>
    </svg>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
const paymentData = [30, 40, 45, 50, 49, 60, 70, 91, 125];
const paymentLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

const donutSegments = [
  { value: 20, color: "#3454d1" },
  { value: 15, color: "#7c3aed" },
  { value: 10, color: "#0891b2" },
  { value: 18, color: "#10b981" },
  { value: 10, color: "#f59e0b" },
];

const miniStats = [
  { label: "Tasks Completed", value: "22/35", percent: 28, color: "#3454d1", data: [10, 15, 12, 18, 20, 25, 22] },
  { label: "New Leads", value: "48/100", percent: 34, color: "#10b981", data: [5, 8, 6, 10, 7, 12, 9] },
  { label: "Average Revenue", value: "$2,245", percent: 42, color: "#e11d48", data: [20, 22, 25, 24, 28, 30, 27] },
];

export default function ChartsSection() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="space-y-6">
      {/* Row 1: Payment Record + Total Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Record */}
        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col overflow-hidden bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Payment Records</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            <div className="h-[200px]">
              <BarChart data={paymentData} labels={paymentLabels} />
            </div>
          </CardContent>
          <CardFooter className="px-6 py-5 border-t border-border bg-muted/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { label: "Awaiting", value: "$5,486", color: "#3454d1", w: 81 },
                { label: "Completed", value: "$10,275", color: "#10b981", w: 82 },
                { label: "Rejected", value: "$3,868", color: "#e11d48", w: 68 },
                { label: "Revenue", value: "$50,668", color: "#0f172a", darkColor: "#f8fafc", w: 75 },
              ].map((item: any) => (
                <div key={item.label} className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-[15px] font-extrabold text-foreground">
                    {item.value}
                  </p>
                  <Progress
                    value={item.w}
                    className="h-1"
                    indicatorClassName="transition-all duration-500"
                    style={{ backgroundColor: 'transparent' }}
                  />
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden -mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.w}%`,
                        backgroundColor: item.darkColor
                          ? (isDark ? item.darkColor : item.color)
                          : item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>

        {/* Total Sales */}
        <div className="flex flex-col gap-6">
          <Card className="bg-primary text-white border-none relative overflow-hidden h-[180px] flex flex-col justify-between shadow-[0_4px_24px_rgba(52,84,209,0.3)]">
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-3xl font-extrabold">30,569</p>
                  <p className="text-[13px] font-bold opacity-80 uppercase tracking-wider mt-1">Total Sales Overall</p>
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent text-[11px] font-extrabold">
                  +12.5%
                </Badge>
              </div>
              <div className="h-[60px] opacity-40">
                <Sparkline data={[25, 66, 41, 89, 63, 25, 44, 12, 36]} color="#fff" fill />
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 border-border shadow-sm overflow-hidden p-0 bg-card">
            <CardContent className="p-0 divide-y divide-border">
              {[
                { img: "https://www.google.com/s2/favicons?sz=64&domain=shopify.com", name: "Shopify eCommerce", type: "Sales", amount: "$1,200", trend: "+12%" },
                { img: "https://www.google.com/s2/favicons?sz=64&domain=apple.com", name: "iOS App Store", type: "Sales", amount: "$1,450", trend: "+8%" },
                { img: "https://www.google.com/s2/favicons?sz=64&domain=figma.com", name: "Figma Platform", type: "Sales", amount: "$1,250", trend: "+5%" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer group">
                  <div className="relative size-10 shrink-0 shadow-sm border border-border rounded-xl overflow-hidden p-2 bg-background">
                    <Image src={item.img} alt={item.name} fill className="object-contain p-2" unoptimized />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-[13.5px] text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[14px] text-foreground">{item.amount}</p>
                    <p className="text-[11px] font-bold text-emerald-500">{item.trend}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 2: Mini Sparkline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {miniStats.map((s) => (
          <Card key={s.label} className="border-border shadow-sm flex flex-col transition-all hover:-translate-y-1 bg-card">
            <CardContent className="p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-500 bg-emerald-500/10 border-emerald-500/20 px-2 py-1">
                  <FontAwesomeIcon icon={faChartLine} className="!size-3" /> {s.percent}%
                </Badge>
              </div>
              <div className="h-[60px] my-2">
                <Sparkline data={s.data} color={s.color} fill />
              </div>
              <p className="text-[11.5px] font-bold text-muted-foreground mt-2 italic text-center">
                + {s.percent}% more than last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 3: Leads Overview Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border shadow-sm flex flex-col bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Target Audience Overview</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="size-[160px] mb-6">
                <DonutChart segments={donutSegments} />
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {[
                  { label: "New", value: "20K", color: "#3454d1" },
                  { label: "Contacted", value: "15K", color: "#7c3aed" },
                  { label: "Qualified", value: "10K", color: "#0891b2" },
                  { label: "Working", value: "18K", color: "#10b981" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center p-3 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="font-extrabold text-[16px] text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col bg-card">
          <CardHeader className="px-6 py-5 border-b border-border flex flex-row justify-between items-center space-y-0">
            <CardTitle className="font-extrabold text-[15px] tracking-tight">Strategic Analytics</CardTitle>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary">
              <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[250px] space-y-4 flex-1">
            <div className="p-4 rounded-3xl bg-muted border border-border">
              <FontAwesomeIcon icon={faChartLine} className="!size-8 text-primary opacity-50" />
            </div>
            <h4 className="font-extrabold text-foreground">Premium Analytics Insights</h4>
            <p className="text-[13.5px] text-muted-foreground text-center max-w-sm font-medium">
              Unlock detailed insights into your CRM performance with Raiyaan Infotech Strategic Intelligence.
            </p>
            <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest px-8 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
              View Reports <FontAwesomeIcon icon={faChevronRight} className="!size-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
