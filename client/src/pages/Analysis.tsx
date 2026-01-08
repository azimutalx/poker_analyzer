import { PokerLayout } from "@/components/PokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

// Mock analysis data
const mockAnalysis = {
  summary: `## Análise do Seu Jogo

Após analisar suas últimas **1,470 mãos**, identifiquei alguns padrões importantes no seu jogo que merecem atenção.

### Pontos Fortes
Seu jogo pré-flop está sólido, com um VPIP de 22% e PFR de 18%, dentro dos ranges ideais para 6-max. Sua agressividade no button é particularmente boa.

### Áreas de Melhoria
1. **Fold to 3-bet muito alto (62%)** - Você está foldando demais contra 3-bets, especialmente fora de posição
2. **C-bet frequency baixa no turn (48%)** - Você está desistindo de muitos pots onde tem equity
3. **Showdown frequência alta (32%)** - Indica que você está pagando demais em rivers`,
  strengths: [
    { title: "Seleção de Mãos Pré-Flop", score: 85, description: "VPIP e PFR dentro do range ideal" },
    { title: "Agressividade no Button", score: 90, description: "Excelente aproveitamento da posição" },
    { title: "Fold Equity", score: 78, description: "Bom timing em bluffs" },
  ],
  weaknesses: [
    { title: "Fold to 3-Bet", score: 35, description: "Muito passivo contra 3-bets", priority: "high" },
    { title: "Turn C-Bet", score: 45, description: "Desistindo de pots com equity", priority: "medium" },
    { title: "River Calls", score: 40, description: "Pagando demais em rivers", priority: "high" },
  ],
  recommendations: [
    {
      title: "Estude ranges de defesa vs 3-bet",
      description: "Foque em entender quais mãos você deve defender vs 3-bet por posição",
      priority: "high",
      resources: ["GTO Wizard - 3-Bet Defense", "Upswing Poker - Defending vs 3-Bets"],
    },
    {
      title: "Pratique double barrels",
      description: "Trabalhe sua frequência de c-bet no turn com mãos de equity",
      priority: "medium",
      resources: ["Run It Once - Turn Strategy", "Poker Coaching - C-Bet Mastery"],
    },
    {
      title: "Revise spots de river call",
      description: "Analise suas mãos onde você pagou river e perdeu",
      priority: "high",
      resources: ["Hand Review Sessions", "Solver Work - River Decisions"],
    },
  ],
  gtoScore: 72,
  handsAnalyzed: 1470,
  lastUpdated: "2024-01-08T10:30:00Z",
};

function StrengthCard({ strength }: { strength: typeof mockAnalysis.strengths[0] }) {
  return (
    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <span className="font-medium">{strength.title}</span>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400/50">
          {strength.score}%
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{strength.description}</p>
    </div>
  );
}

function WeaknessCard({ weakness }: { weakness: typeof mockAnalysis.weaknesses[0] }) {
  const priorityColors = {
    high: "text-red-400 border-red-400/50 bg-red-500/10",
    medium: "text-yellow-400 border-yellow-400/50 bg-yellow-500/10",
    low: "text-blue-400 border-blue-400/50 bg-blue-500/10",
  };

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[weakness.priority as keyof typeof priorityColors]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          <span className="font-medium">{weakness.title}</span>
        </div>
        <Badge variant="outline" className={priorityColors[weakness.priority as keyof typeof priorityColors]}>
          {weakness.score}%
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{weakness.description}</p>
      <Badge variant="secondary" className="mt-2 text-xs">
        Prioridade: {weakness.priority === "high" ? "Alta" : weakness.priority === "medium" ? "Média" : "Baixa"}
      </Badge>
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: typeof mockAnalysis.recommendations[0]; index: number }) {
  const priorityColors = {
    high: "border-l-red-400",
    medium: "border-l-yellow-400",
    low: "border-l-blue-400",
  };

  return (
    <Card className={`glass-card border-border/50 border-l-4 ${priorityColors[rec.priority as keyof typeof priorityColors]}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-neon-pink font-bold">
            {index + 1}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-bold">{rec.title}</h4>
            <p className="text-sm text-muted-foreground">{rec.description}</p>
            <div className="flex flex-wrap gap-2">
              {rec.resources.map((resource, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {resource}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Analysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const runAnalysis = trpc.analysis.generateReport.useMutation({
    onSuccess: () => {
      setIsAnalyzing(false);
      setProgress(100);
      toast.success("Análise concluída!");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error("Erro na análise: " + error.message);
    },
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    // In real app, this would call the mutation
    setTimeout(() => {
      clearInterval(interval);
      setIsAnalyzing(false);
      setProgress(100);
      toast.success("Análise concluída!");
    }, 5000);
  };

  return (
    <PokerLayout title="Análise IA">
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="glass-card border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Brain className="h-8 w-8 text-neon-pink" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Análise Inteligente</CardTitle>
                  <CardDescription>
                    IA analisa seu jogo e identifica padrões de melhoria
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn-neon gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Nova Análise
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isAnalyzing && (
            <CardContent className="relative">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analisando mãos...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          )}
        </Card>

        {/* GTO Score */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="glass-card border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-neon-cyan" />
                Score GTO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="oklch(0.2 0.02 270)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="oklch(0.7 0.25 330)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${mockAnalysis.gtoScore * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-neon-pink">
                      {mockAnalysis.gtoScore}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Baseado em {mockAnalysis.handsAnalyzed.toLocaleString()} mãos analisadas
                </p>
                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(mockAnalysis.lastUpdated).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-neon-pink" />
                Resumo da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert prose-sm max-w-none">
              <Streamdown>{mockAnalysis.summary}</Streamdown>
            </CardContent>
          </Card>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Strengths */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-5 w-5" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAnalysis.strengths.map((strength, i) => (
                <StrengthCard key={i} strength={strength} />
              ))}
            </CardContent>
          </Card>

          {/* Weaknesses */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Áreas de Melhoria (Leaks)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAnalysis.weaknesses.map((weakness, i) => (
                <WeaknessCard key={i} weakness={weakness} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-neon-cyan" />
              Recomendações de Estudo
            </CardTitle>
            <CardDescription>
              Plano de estudo personalizado baseado nos seus leaks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockAnalysis.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Exportar Relatório</h4>
                <p className="text-sm text-muted-foreground">
                  Baixe a análise completa em PDF ou CSV
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  Exportar PDF
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  Exportar CSV
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
