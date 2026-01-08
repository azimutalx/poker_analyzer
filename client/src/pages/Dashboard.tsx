import { PokerLayout } from "@/components/PokerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  DollarSign,
  Layers,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data for charts
const profitData = [
  { date: "Jan", profit: 120 },
  { date: "Fev", profit: -50 },
  { date: "Mar", profit: 200 },
  { date: "Abr", profit: 150 },
  { date: "Mai", profit: 300 },
  { date: "Jun", profit: 180 },
];

const positionData = [
  { position: "BTN", winrate: 15.2 },
  { position: "CO", winrate: 8.5 },
  { position: "MP", winrate: 3.2 },
  { position: "UTG", winrate: -2.1 },
  { position: "BB", winrate: -12.5 },
  { position: "SB", winrate: -18.3 },
];

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="glass-card border-border/50 hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-neon-cyan" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <p
            className={`text-xs flex items-center gap-1 mt-1 ${
              trend === "up"
                ? "text-green-400"
                : trend === "down"
                ? "text-red-400"
                : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3" />
            ) : trend === "down" ? (
              <ArrowDown className="h-3 w-3" />
            ) : null}
            {change > 0 ? "+" : ""}
            {change}% vs mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats } = trpc.stats.getUserStats.useQuery();

  return (
    <PokerLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Mãos"
            value={stats?.totalHands?.toLocaleString() || "0"}
            change={12}
            trend="up"
            icon={Layers}
          />
          <StatCard
            title="Lucro Total"
            value={`$${stats?.totalProfit || "0.00"}`}
            change={8}
            trend="up"
            icon={DollarSign}
          />
          <StatCard
            title="BB/100"
            value={stats?.bbPer100 || "0.00"}
            change={-3}
            trend="down"
            icon={TrendingUp}
          />
          <StatCard
            title="Sessões"
            value={stats?.totalSessions?.toString() || "0"}
            change={5}
            trend="up"
            icon={Clock}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profit Chart */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-neon-pink" />
                Evolução do Lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitData}>
                    <defs>
                      <linearGradient
                        id="profitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="oklch(0.7 0.25 330)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.7 0.25 330)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      stroke="oklch(0.6 0.05 180)"
                      fontSize={12}
                    />
                    <YAxis stroke="oklch(0.6 0.05 180)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.12 0.02 270)",
                        border: "1px solid oklch(0.3 0.1 330)",
                        borderRadius: "8px",
                        color: "oklch(0.92 0.02 180)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="oklch(0.7 0.25 330)"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Position Winrate Chart */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-neon-cyan" />
                Winrate por Posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={positionData} layout="vertical">
                    <XAxis type="number" stroke="oklch(0.6 0.05 180)" fontSize={12} />
                    <YAxis
                      dataKey="position"
                      type="category"
                      stroke="oklch(0.6 0.05 180)"
                      fontSize={12}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.12 0.02 270)",
                        border: "1px solid oklch(0.3 0.1 330)",
                        borderRadius: "8px",
                        color: "oklch(0.92 0.02 180)",
                      }}
                      formatter={(value: number) => [`${value} BB/100`, "Winrate"]}
                    />
                    <Bar
                      dataKey="winrate"
                      fill="oklch(0.75 0.15 195)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              VPIP
            </div>
            <div className="text-xl font-bold text-neon-pink mt-1">
              {stats?.vpip || "0.0"}%
            </div>
          </Card>
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              PFR
            </div>
            <div className="text-xl font-bold text-neon-cyan mt-1">
              {stats?.pfr || "0.0"}%
            </div>
          </Card>
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              3-Bet
            </div>
            <div className="text-xl font-bold text-neon-purple mt-1">
              {stats?.threeBet || "0.0"}%
            </div>
          </Card>
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              WTSD
            </div>
            <div className="text-xl font-bold text-foreground mt-1">
              {stats?.wtsd || "0.0"}%
            </div>
          </Card>
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              W$SD
            </div>
            <div className="text-xl font-bold text-green-400 mt-1">
              {stats?.wsd || "0.0"}%
            </div>
          </Card>
          <Card className="glass-card border-border/50 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Agg Freq
            </div>
            <div className="text-xl font-bold text-orange-400 mt-1">
              {stats?.aggFreq || "0.0"}%
            </div>
          </Card>
        </div>
      </div>
    </PokerLayout>
  );
}
