import { PokerLayout } from "@/components/PokerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock data
const positionStats = [
  { position: "BTN", vpip: 28, pfr: 22, threeBet: 8, winrate: 15.2, hands: 2500 },
  { position: "CO", vpip: 24, pfr: 20, threeBet: 7, winrate: 8.5, hands: 2300 },
  { position: "MP", vpip: 18, pfr: 15, threeBet: 5, winrate: 3.2, hands: 2100 },
  { position: "UTG", vpip: 14, pfr: 12, threeBet: 4, winrate: -2.1, hands: 2000 },
  { position: "BB", vpip: 35, pfr: 12, threeBet: 10, winrate: -12.5, hands: 2400 },
  { position: "SB", vpip: 30, pfr: 18, threeBet: 9, winrate: -18.3, hands: 2200 },
];

const actionDistribution = [
  { name: "Fold", value: 65, color: "oklch(0.4 0.02 270)" },
  { name: "Call", value: 20, color: "oklch(0.75 0.15 195)" },
  { name: "Raise", value: 12, color: "oklch(0.7 0.25 330)" },
  { name: "3-Bet", value: 3, color: "oklch(0.6 0.25 290)" },
];

const radarData = [
  { stat: "VPIP", value: 22, optimal: 24 },
  { stat: "PFR", value: 18, optimal: 20 },
  { stat: "3-Bet", value: 7, optimal: 8 },
  { stat: "Agg", value: 45, optimal: 50 },
  { stat: "WTSD", value: 28, optimal: 25 },
  { stat: "W$SD", value: 52, optimal: 55 },
];

interface StatRowProps {
  label: string;
  value: number;
  optimal?: { min: number; max: number };
  suffix?: string;
  description?: string;
}

function StatRow({ label, value, optimal, suffix = "%", description }: StatRowProps) {
  const isInRange = optimal ? value >= optimal.min && value <= optimal.max : true;
  const isLow = optimal ? value < optimal.min : false;
  const isHigh = optimal ? value > optimal.max : false;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">{label}</span>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span
            className={`text-xl font-bold ${
              isInRange
                ? "text-green-400"
                : isLow
                ? "text-blue-400"
                : "text-red-400"
            }`}
          >
            {value.toFixed(1)}
            {suffix}
          </span>
          {optimal && (
            <p className="text-xs text-muted-foreground">
              Ideal: {optimal.min}-{optimal.max}
              {suffix}
            </p>
          )}
        </div>
      </div>
      {optimal && (
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-green-500/30"
            style={{
              left: `${optimal.min}%`,
              width: `${optimal.max - optimal.min}%`,
            }}
          />
          <div
            className={`absolute h-full w-1 ${
              isInRange ? "bg-green-400" : isLow ? "bg-blue-400" : "bg-red-400"
            }`}
            style={{ left: `${Math.min(value, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function Statistics() {
  const [timeRange, setTimeRange] = useState("all");

  const { data: stats } = trpc.stats.getUserStats.useQuery();

  return (
    <PokerLayout title="Estatísticas">
      <div className="space-y-6">
        {/* Time Range Filter */}
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-input border-border">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Stats Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="preflop">Pré-Flop</TabsTrigger>
            <TabsTrigger value="postflop">Pós-Flop</TabsTrigger>
            <TabsTrigger value="position">Por Posição</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Radar Chart */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-neon-pink" />
                    Perfil de Jogo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="oklch(0.3 0.1 330 / 0.3)" />
                        <PolarAngleAxis
                          dataKey="stat"
                          tick={{ fill: "oklch(0.6 0.05 180)", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: "oklch(0.6 0.05 180)", fontSize: 10 }}
                        />
                        <Radar
                          name="Seu Jogo"
                          dataKey="value"
                          stroke="oklch(0.7 0.25 330)"
                          fill="oklch(0.7 0.25 330)"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="Ideal"
                          dataKey="optimal"
                          stroke="oklch(0.75 0.15 195)"
                          fill="oklch(0.75 0.15 195)"
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                        />
                        <Legend />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.12 0.02 270)",
                            border: "1px solid oklch(0.3 0.1 330)",
                            borderRadius: "8px",
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Action Distribution */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-neon-cyan" />
                    Distribuição de Ações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={actionDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={{ stroke: "oklch(0.6 0.05 180)" }}
                        >
                          {actionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.12 0.02 270)",
                            border: "1px solid oklch(0.3 0.1 330)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-neon-pink" />
                  Métricas Principais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <StatRow
                    label="VPIP"
                    value={parseFloat(stats?.vpip || "22")}
                    optimal={{ min: 20, max: 28 }}
                    description="Voluntarily Put In Pot"
                  />
                  <StatRow
                    label="PFR"
                    value={parseFloat(stats?.pfr || "18")}
                    optimal={{ min: 16, max: 22 }}
                    description="Pre-Flop Raise"
                  />
                  <StatRow
                    label="3-Bet"
                    value={parseFloat(stats?.threeBet || "7")}
                    optimal={{ min: 6, max: 10 }}
                    description="3-Bet Percentage"
                  />
                  <StatRow
                    label="Fold to 3-Bet"
                    value={parseFloat(stats?.foldToThreeBet || "55")}
                    optimal={{ min: 45, max: 60 }}
                    description="Fold to 3-Bet %"
                  />
                  <StatRow
                    label="WTSD"
                    value={parseFloat(stats?.wtsd || "28")}
                    optimal={{ min: 24, max: 30 }}
                    description="Went To Showdown"
                  />
                  <StatRow
                    label="W$SD"
                    value={parseFloat(stats?.wsd || "52")}
                    optimal={{ min: 50, max: 58 }}
                    description="Won $ at Showdown"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preflop Tab */}
          <TabsContent value="preflop" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Estatísticas Pré-Flop</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatRow
                    label="VPIP"
                    value={22}
                    optimal={{ min: 20, max: 28 }}
                    description="% de mãos jogadas voluntariamente"
                  />
                  <StatRow
                    label="PFR"
                    value={18}
                    optimal={{ min: 16, max: 22 }}
                    description="% de raises pré-flop"
                  />
                  <StatRow
                    label="RFI"
                    value={24}
                    optimal={{ min: 20, max: 30 }}
                    description="Raise First In"
                  />
                  <StatRow
                    label="3-Bet"
                    value={7}
                    optimal={{ min: 6, max: 10 }}
                    description="% de 3-bets"
                  />
                  <StatRow
                    label="Fold to 3-Bet"
                    value={55}
                    optimal={{ min: 45, max: 60 }}
                    description="% de folds vs 3-bet"
                  />
                  <StatRow
                    label="4-Bet"
                    value={2.5}
                    optimal={{ min: 2, max: 4 }}
                    description="% de 4-bets"
                  />
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Blinds Defense</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatRow
                    label="BB Fold vs Steal"
                    value={42}
                    optimal={{ min: 35, max: 50 }}
                    description="Fold no BB vs roubo"
                  />
                  <StatRow
                    label="BB 3-Bet vs Steal"
                    value={12}
                    optimal={{ min: 10, max: 15 }}
                    description="3-bet no BB vs roubo"
                  />
                  <StatRow
                    label="SB Fold vs Steal"
                    value={68}
                    optimal={{ min: 60, max: 75 }}
                    description="Fold no SB vs roubo"
                  />
                  <StatRow
                    label="SB 3-Bet vs Steal"
                    value={10}
                    optimal={{ min: 8, max: 14 }}
                    description="3-bet no SB vs roubo"
                  />
                  <StatRow
                    label="Steal Attempt"
                    value={35}
                    optimal={{ min: 30, max: 45 }}
                    description="% de tentativas de roubo"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Postflop Tab */}
          <TabsContent value="postflop" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Agressividade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatRow
                    label="Aggression Frequency"
                    value={45}
                    optimal={{ min: 40, max: 55 }}
                    description="Frequência de apostas/raises"
                  />
                  <StatRow
                    label="Aggression Factor"
                    value={2.8}
                    optimal={{ min: 2.5, max: 3.5 }}
                    suffix=""
                    description="(Bet+Raise) / Call"
                  />
                  <StatRow
                    label="C-Bet Flop"
                    value={65}
                    optimal={{ min: 55, max: 75 }}
                    description="Continuation bet no flop"
                  />
                  <StatRow
                    label="C-Bet Turn"
                    value={55}
                    optimal={{ min: 45, max: 65 }}
                    description="Continuation bet no turn"
                  />
                  <StatRow
                    label="C-Bet River"
                    value={48}
                    optimal={{ min: 40, max: 55 }}
                    description="Continuation bet no river"
                  />
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Showdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <StatRow
                    label="WTSD"
                    value={28}
                    optimal={{ min: 24, max: 30 }}
                    description="Went To Showdown"
                  />
                  <StatRow
                    label="W$SD"
                    value={52}
                    optimal={{ min: 50, max: 58 }}
                    description="Won $ at Showdown"
                  />
                  <StatRow
                    label="WWSF"
                    value={48}
                    optimal={{ min: 44, max: 52 }}
                    description="Won When Saw Flop"
                  />
                  <StatRow
                    label="Fold to C-Bet"
                    value={45}
                    optimal={{ min: 40, max: 55 }}
                    description="Fold vs continuation bet"
                  />
                  <StatRow
                    label="Probe Bet"
                    value={38}
                    optimal={{ min: 30, max: 45 }}
                    description="Bet quando oponente não c-bet"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Position Tab */}
          <TabsContent value="position" className="space-y-6">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Estatísticas por Posição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionStats}>
                      <XAxis
                        dataKey="position"
                        stroke="oklch(0.6 0.05 180)"
                        fontSize={12}
                      />
                      <YAxis stroke="oklch(0.6 0.05 180)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.12 0.02 270)",
                          border: "1px solid oklch(0.3 0.1 330)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="vpip" name="VPIP" fill="oklch(0.7 0.25 330)" />
                      <Bar dataKey="pfr" name="PFR" fill="oklch(0.75 0.15 195)" />
                      <Bar dataKey="threeBet" name="3-Bet" fill="oklch(0.6 0.25 290)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Position Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positionStats.map((pos) => (
                <Card key={pos.position} className="glass-card border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-neon-cyan">{pos.position}</span>
                      <span
                        className={`text-lg ${
                          pos.winrate >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {pos.winrate >= 0 ? "+" : ""}
                        {pos.winrate} BB/100
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">VPIP:</span>
                        <span className="ml-2 font-bold">{pos.vpip}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">PFR:</span>
                        <span className="ml-2 font-bold">{pos.pfr}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">3-Bet:</span>
                        <span className="ml-2 font-bold">{pos.threeBet}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mãos:</span>
                        <span className="ml-2 font-bold">{pos.hands.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PokerLayout>
  );
}
