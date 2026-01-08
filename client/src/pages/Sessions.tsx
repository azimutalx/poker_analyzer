import { PokerLayout } from "@/components/PokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, DollarSign, Layers, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Mock sessions data
const mockSessions = [
  {
    id: 1,
    name: "Sessão Noturna",
    site: "PokerStars",
    stakes: "$0.50/$1.00",
    gameType: "NL Hold'em",
    startTime: "2024-01-08T20:00:00Z",
    endTime: "2024-01-09T00:30:00Z",
    handsPlayed: 450,
    netProfit: 125.50,
    notes: "Boa sessão, poucos erros",
  },
  {
    id: 2,
    name: "Sessão Matinal",
    site: "888poker",
    stakes: "$0.25/$0.50",
    gameType: "NL Hold'em",
    startTime: "2024-01-07T08:00:00Z",
    endTime: "2024-01-07T11:00:00Z",
    handsPlayed: 320,
    netProfit: -45.00,
    notes: "Tilt no final",
  },
  {
    id: 3,
    name: "Grind Tarde",
    site: "PokerStars",
    stakes: "$1.00/$2.00",
    gameType: "NL Hold'em",
    startTime: "2024-01-06T14:00:00Z",
    endTime: "2024-01-06T18:00:00Z",
    handsPlayed: 520,
    netProfit: 280.00,
    notes: "Excelente run",
  },
  {
    id: 4,
    name: "Quick Session",
    site: "GGPoker",
    stakes: "$0.50/$1.00",
    gameType: "NL Hold'em",
    startTime: "2024-01-05T22:00:00Z",
    endTime: "2024-01-05T23:30:00Z",
    handsPlayed: 180,
    netProfit: -85.00,
    notes: "Coolers",
  },
];

// Profit evolution data
const profitEvolution = [
  { date: "01/01", profit: 0 },
  { date: "02/01", profit: 50 },
  { date: "03/01", profit: 120 },
  { date: "04/01", profit: 80 },
  { date: "05/01", profit: -5 },
  { date: "06/01", profit: 275 },
  { date: "07/01", profit: 230 },
  { date: "08/01", profit: 355.50 },
];

interface SessionCardProps {
  session: typeof mockSessions[0];
}

function SessionCard({ session }: SessionCardProps) {
  const isProfit = session.netProfit >= 0;
  const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card className="glass-card border-border/50 hover:border-primary/50 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{session.name}</h3>
              <Badge variant="outline" className="text-neon-cyan border-neon-cyan/50">
                {session.site}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(session.startTime).toLocaleDateString("pt-BR")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {hours}h {minutes}m
              </span>
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                {session.handsPlayed} mãos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{session.stakes}</Badge>
              <Badge variant="secondary">{session.gameType}</Badge>
            </div>
            {session.notes && (
              <p className="text-sm text-muted-foreground italic">
                "{session.notes}"
              </p>
            )}
          </div>

          <div className="text-right">
            <div
              className={`text-2xl font-bold flex items-center gap-1 ${
                isProfit ? "text-green-400" : "text-red-400"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {isProfit ? "+" : ""}${session.netProfit.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {(session.netProfit / session.handsPlayed * 100).toFixed(2)} BB/100
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewSessionDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    site: "pokerstars",
    stakes: "$0.50/$1.00",
    gameType: "NL Hold'em",
  });

  const handleSubmit = () => {
    toast.success("Sessão iniciada!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-neon gap-2">
          <Plus className="h-4 w-4" />
          Nova Sessão
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Sessão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Sessão</Label>
            <Input
              placeholder="Ex: Grind Noturno"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-input border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site</Label>
              <Select
                value={formData.site}
                onValueChange={(v) => setFormData({ ...formData, site: v })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pokerstars">PokerStars</SelectItem>
                  <SelectItem value="888poker">888poker</SelectItem>
                  <SelectItem value="ggpoker">GGPoker</SelectItem>
                  <SelectItem value="partypoker">PartyPoker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stakes</Label>
              <Select
                value={formData.stakes}
                onValueChange={(v) => setFormData({ ...formData, stakes: v })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$0.01/$0.02">$0.01/$0.02</SelectItem>
                  <SelectItem value="$0.05/$0.10">$0.05/$0.10</SelectItem>
                  <SelectItem value="$0.10/$0.25">$0.10/$0.25</SelectItem>
                  <SelectItem value="$0.25/$0.50">$0.25/$0.50</SelectItem>
                  <SelectItem value="$0.50/$1.00">$0.50/$1.00</SelectItem>
                  <SelectItem value="$1.00/$2.00">$1.00/$2.00</SelectItem>
                  <SelectItem value="$2.00/$5.00">$2.00/$5.00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Jogo</Label>
            <Select
              value={formData.gameType}
              onValueChange={(v) => setFormData({ ...formData, gameType: v })}
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NL Hold'em">NL Hold'em</SelectItem>
                <SelectItem value="PLO">PLO</SelectItem>
                <SelectItem value="PLO5">PLO5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full btn-neon">
            Iniciar Sessão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Sessions() {
  const [filter, setFilter] = useState("all");

  // Calculate totals
  const totalProfit = mockSessions.reduce((sum, s) => sum + s.netProfit, 0);
  const totalHands = mockSessions.reduce((sum, s) => sum + s.handsPlayed, 0);
  const winningSessions = mockSessions.filter((s) => s.netProfit > 0).length;

  return (
    <PokerLayout title="Sessões">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Layers className="h-5 w-5 text-neon-pink" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessões</p>
                  <p className="text-2xl font-bold">{mockSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Total</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {totalProfit >= 0 ? "+" : ""}${totalProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <TrendingUp className="h-5 w-5 text-neon-cyan" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">
                    {((winningSessions / mockSessions.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Mãos</p>
                  <p className="text-2xl font-bold">{totalHands.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profit Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-pink" />
              Evolução do Bankroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitEvolution}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.7 0.25 330)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.7 0.25 330)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="oklch(0.6 0.05 180)" fontSize={12} />
                  <YAxis stroke="oklch(0.6 0.05 180)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.02 270)",
                      border: "1px solid oklch(0.3 0.1 330)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Lucro"]}
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

        {/* Sessions List */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Histórico de Sessões</h2>
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] bg-input border-border">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="winning">Vencedoras</SelectItem>
                <SelectItem value="losing">Perdedoras</SelectItem>
              </SelectContent>
            </Select>
            <NewSessionDialog />
          </div>
        </div>

        <div className="space-y-4">
          {mockSessions
            .filter((s) => {
              if (filter === "winning") return s.netProfit > 0;
              if (filter === "losing") return s.netProfit < 0;
              return true;
            })
            .map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
        </div>
      </div>
    </PokerLayout>
  );
}
