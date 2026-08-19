import StatsCards from "@/components/layout/Content/StatsCards";
import ChartsSection from "@/components/layout/Content/ChartsSection";
import TablesSection from "@/components/layout/Content/TablesSection";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Row 1 — 4 Stat Cards */}
      <StatsCards />

      {/* Row 2 — Charts (Payment Record + Total Sales) */}
      <ChartsSection />

      {/* Row 3 — Leads Overview + Latest Leads Table + Schedule + Project Status + Team */}
      <TablesSection />
    </div>
  );
}
