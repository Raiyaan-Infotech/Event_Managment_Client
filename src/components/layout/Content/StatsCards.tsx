import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faFileAlt,
  faBriefcase,
  faChartLine,
  faEllipsisV
} from "@fortawesome/free-solid-svg-icons";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    id: 1,
    icon: <FontAwesomeIcon icon={faDollarSign} className="!size-[21px] text-muted-foreground" />,
    value1: "45",
    value2: "/76",
    title: "Invoices Awaiting Payment",
    label: "Invoices Awaiting",
    amount: "$5,569",
    percentage: "56",
    progressColor: "bg-primary",
  },
  {
    id: 2,
    icon: <FontAwesomeIcon icon={faFileAlt} className="!size-[21px] text-muted-foreground" />,
    value1: "48",
    value2: "/86",
    title: "Converted Leads",
    label: "Converted Leads",
    amount: "52 Completed",
    percentage: "63",
    progressColor: "bg-amber-500",
  },
  {
    id: 3,
    icon: <FontAwesomeIcon icon={faBriefcase} className="!size-[21px] text-muted-foreground" />,
    value1: "16",
    value2: "/20",
    title: "Projects In Progress",
    label: "Projects In Progress",
    amount: "16 Completed",
    percentage: "78",
    progressColor: "bg-emerald-500",
  },
  {
    id: 4,
    icon: <FontAwesomeIcon icon={faChartLine} className="!size-[21px] text-muted-foreground" />,
    value1: "46.59",
    value2: "%",
    title: "Conversion Rate",
    label: "Conversion Rate",
    amount: "$2,254",
    percentage: "46",
    progressColor: "bg-rose-500",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {stats.map((s) => (
        <Card key={s.id} className="border border-border shadow-sm rounded-lg bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with icon and more button */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-4">
                <div className="bg-muted flex items-center justify-center rounded-full size-10 shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{s.value1}</span>
                    <span className="text-2xl font-bold text-foreground">{s.value2}</span>
                  </div>
                  <h3 className="text-sm font-normal text-muted-foreground mt-1">{s.title}</h3>
                </div>
              </div>
              <button className="text-muted-foreground/50 hover:text-foreground transition-colors p-1 flex items-center justify-center">
                <FontAwesomeIcon icon={faEllipsisV} className="!size-4" />
              </button>
            </div>

            {/* Progress section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {s.label}
                </span>
                <div className="text-right">
                  <span className="text-xs font-normal text-muted-foreground">{s.amount}</span>
                  <span className="text-xs font-normal text-muted-foreground ml-1">({s.percentage}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted w-full rounded overflow-hidden">
                <div
                  className={`h-full ${s.progressColor} transition-all duration-300`}
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
