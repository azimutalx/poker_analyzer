import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  BarChart3,
  Brain,
  ChevronRight,
  Grid3X3,
  History,
  Layers,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

const features = [
  {
    icon: History,
    title: "Importação de Mãos",
    description: "Importe históricos de PokerStars, 888poker, GGPoker e mais",
    color: "text-neon-pink",
  },
  {
    icon: Grid3X3,
    title: "Ranges GTO",
    description: "Visualize ranges de abertura, 3-bet e defesa por posição",
    color: "text-neon-cyan",
  },
  {
    icon: BarChart3,
    title: "Estatísticas Avançadas",
    description: "VPIP, PFR, 3-bet, WTSD e dezenas de métricas detalhadas",
    color: "text-neon-purple",
  },
  {
    icon: Play,
    title: "Replay de Mãos",
    description: "Reviva cada mão com visualização passo a passo",
    color: "text-green-400",
  },
  {
    icon: Brain,
    title: "Análise com IA",
    description: "Identificação automática de leaks e recomendações de estudo",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    title: "Score GTO",
    description: "Meça sua aderência às estratégias ótimas de jogo",
    color: "text-orange-400",
  },
];

const stats = [
  { value: "1M+", label: "Mãos Analisadas" },
  { value: "50K+", label: "Jogadores Ativos" },
  { value: "15%", label: "Melhoria Média" },
  { value: "24/7", label: "Suporte" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-neon-pink text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/30 bg-background/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-8 w-8 text-neon-pink" />
            <span className="text-xl font-bold tracking-wider">
              POKER<span className="text-neon-cyan">PRO</span>
            </span>
          </div>
          <Button asChild className="btn-neon">
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/50 bg-primary/10 text-sm">
              <Sparkles className="h-4 w-4 text-neon-pink" />
              <span>Powered by AI</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-neon-pink animate-pulse-glow">DOMINE</span>{" "}
              <span className="text-foreground">O JOGO COM</span>
              <br />
              <span className="text-neon-cyan">ANÁLISE INTELIGENTE</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma completa de análise de poker com IA. Importe suas mãos,
              identifique leaks, estude ranges GTO e evolua seu jogo como nunca antes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="btn-neon text-lg px-8 py-6">
                <a href={getLoginUrl()}>
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-border hover:bg-muted"
              >
                Ver Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Tech Line */}
            <div className="tech-line w-full max-w-md mx-auto mt-12" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 border-y border-border/30 bg-muted/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-neon-pink">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-neon-cyan">FERRAMENTAS</span> PODEROSAS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para analisar, estudar e melhorar seu jogo de poker
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="glass-card border-border/50 hover:border-primary/50 transition-all group"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 bg-muted/10">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              COMO <span className="text-neon-pink">FUNCIONA</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Importe suas mãos",
                description: "Faça upload do histórico de qualquer site de poker",
              },
              {
                step: "02",
                title: "Análise automática",
                description: "Nossa IA processa e identifica padrões no seu jogo",
              },
              {
                step: "03",
                title: "Evolua seu game",
                description: "Receba insights personalizados e melhore suas decisões",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container">
          <Card className="glass-card border-neon-pink overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10" />
            <CardContent className="relative p-12 text-center">
              <Zap className="h-12 w-12 text-neon-pink mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                PRONTO PARA <span className="text-neon-cyan">EVOLUIR</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Junte-se a milhares de jogadores que já estão usando análise
                inteligente para melhorar seu jogo.
              </p>
              <Button asChild size="lg" className="btn-neon text-lg px-8 py-6">
                <a href={getLoginUrl()}>
                  Criar Conta Grátis
                  <TrendingUp className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-neon-pink" />
              <span className="font-bold tracking-wider">
                POKER<span className="text-neon-cyan">PRO</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PokerPro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
