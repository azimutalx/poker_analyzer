import { PokerLayout } from "@/components/PokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    name: "Grátis",
    slug: "free",
    price: 0,
    interval: "forever",
    description: "Perfeito para começar a estudar",
    features: [
      "50 mãos por mês",
      "1 análise de IA por mês",
      "10 replays de mãos",
      "Estatísticas básicas",
      "Dashboard principal",
    ],
    limitations: [
      "Sem acesso a ranges GTO",
      "Sem exportação de relatórios",
    ],
    icon: Zap,
    popular: false,
    color: "text-muted-foreground",
  },
  {
    name: "Starter",
    slug: "starter",
    price: 19.90,
    interval: "mês",
    description: "Para jogadores recreativos",
    features: [
      "500 mãos por mês",
      "5 análises de IA por mês",
      "Replays ilimitados",
      "Estatísticas completas",
      "Ranges GTO básicos",
      "Exportação CSV",
    ],
    limitations: [],
    icon: Sparkles,
    popular: true,
    color: "text-neon-cyan",
  },
  {
    name: "Pro",
    slug: "pro",
    price: 49.90,
    interval: "mês",
    description: "Para jogadores sérios",
    features: [
      "Mãos ilimitadas",
      "Análises ilimitadas",
      "Replays ilimitados",
      "Todas as estatísticas",
      "Ranges GTO completos",
      "Exportação PDF/CSV",
      "Perfis de oponentes",
      "Suporte prioritário",
    ],
    limitations: [],
    icon: Crown,
    popular: false,
    color: "text-neon-pink",
  },
];

export default function Pricing() {
  const { data: credits } = trpc.credits.getMyCredits.useQuery();
  const { data: subscription } = trpc.subscription.getMySubscription.useQuery();

  const handleSubscribe = (planSlug: string) => {
    if (planSlug === "free") {
      toast.info("Você já está no plano gratuito!");
      return;
    }
    toast.info("Integração com pagamento em breve! Entre em contato para assinar.");
  };

  return (
    <PokerLayout title="Planos e Preços">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Escolha seu <span className="text-neon-pink">Plano</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desbloqueie todo o potencial do Poker Analyzer Pro e leve seu jogo para o próximo nível
          </p>
        </div>

        {/* Current Usage */}
        {credits && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Seu uso atual</h3>
                  <p className="text-sm text-muted-foreground">
                    {credits.isSubscribed ? "Plano ativo" : "Plano Gratuito"}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-cyan">
                      {credits.handsImported}/{credits.handsLimit}
                    </div>
                    <div className="text-xs text-muted-foreground">Mãos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-pink">
                      {credits.analysisUsed}/{credits.analysisLimit}
                    </div>
                    <div className="text-xs text-muted-foreground">Análises</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-purple">
                      {credits.replaysUsed}/{credits.replaysLimit}
                    </div>
                    <div className="text-xs text-muted-foreground">Replays</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.slug}
              className={`glass-card border-border/50 relative ${
                plan.popular ? "border-neon-cyan ring-2 ring-neon-cyan/20" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-cyan text-black">
                  Mais Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto mb-4 p-3 rounded-full bg-muted/30 ${plan.color}`}>
                  <plan.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "R$0" : `R$${plan.price.toFixed(2).replace(".", ",")}`}
                  </span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <li key={`lim-${i}`} className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-4 w-4 flex-shrink-0 text-center">✕</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan.slug)}
                  className={`w-full ${
                    plan.popular
                      ? "btn-neon-cyan"
                      : plan.slug === "pro"
                      ? "btn-neon"
                      : "btn-neon-outline"
                  }`}
                  variant={plan.slug === "free" ? "outline" : "default"}
                >
                  {plan.slug === "free" ? "Plano Atual" : "Assinar Agora"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. Seu acesso continua até o final do período pago.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Os créditos acumulam?</h4>
              <p className="text-sm text-muted-foreground">
                Não, os créditos são resetados mensalmente. Use-os antes do próximo ciclo!
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quais formas de pagamento são aceitas?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartão de crédito, débito e PIX através do Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Posso fazer upgrade do plano?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade a qualquer momento e o valor será ajustado proporcionalmente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
