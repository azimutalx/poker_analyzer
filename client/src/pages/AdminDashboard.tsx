import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PokerLayout from "@/components/PokerLayout";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  UserPlus,
  CreditCard,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: metrics, isLoading } = trpc.admin.getDashboardMetrics.useQuery();

  if (isLoading) {
    return (
      <PokerLayout title="Painel Administrativo">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card border-border/50">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PokerLayout>
    );
  }

  const stats = [
    {
      title: "Total de Usuários",
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
    },
    {
      title: "Assinaturas Ativas",
      value: metrics?.activeSubscriptions || 0,
      icon: CreditCard,
      color: "text-neon-pink",
      bgColor: "bg-neon-pink/10",
    },
    {
      title: "MRR",
      value: `R$ ${metrics?.mrr || "0.00"}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Receita Total",
      value: `R$ ${metrics?.totalRevenue || "0.00"}`,
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
    {
      title: "Novos Usuários (Mês)",
      value: metrics?.newUsersThisMonth || 0,
      icon: UserPlus,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics?.conversionRate || "0.00"}%`,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Churn Rate",
      value: `${metrics?.churnRate || "0.00"}%`,
      icon: AlertCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
    },
    {
      title: "Total de Mãos",
      value: metrics?.totalHands || 0,
      icon: Activity,
      color: "text-neon-cyan",
      bgColor: "bg-neon-cyan/10",
    },
  ];

  return (
    <PokerLayout title="Painel Administrativo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neon-text-pink">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral da plataforma e métricas principais
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-card border-border/50 hover:border-neon-pink/50 transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-neon-cyan" />
                Gestão de Usuários
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/users" className="btn-neon inline-block">
                Ver Usuários
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-neon-pink" />
                Assinaturas
              </CardTitle>
              <CardDescription>
                Gerencie assinaturas ativas e canceladas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/subscriptions" className="btn-neon inline-block">
                Ver Assinaturas
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Promoções
              </CardTitle>
              <CardDescription>
                Crie e gerencie cupons de desconto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/promotions" className="btn-neon inline-block">
                Ver Promoções
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-yellow-400" />
                Anúncios
              </CardTitle>
              <CardDescription>
                Gerencie banners e notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/announcements" className="btn-neon inline-block">
                Ver Anúncios
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-400" />
                Transações
              </CardTitle>
              <CardDescription>
                Histórico de pagamentos e receita
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/transactions" className="btn-neon inline-block">
                Ver Transações
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Logs de Atividade
              </CardTitle>
              <CardDescription>
                Auditoria de ações administrativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/admin/logs" className="btn-neon inline-block">
                Ver Logs
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Preview */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon-cyan" />
              Resumo de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium">Novos usuários este mês</p>
                    <p className="text-sm text-muted-foreground">{metrics?.newUsersThisMonth || 0} cadastros</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-neon-pink" />
                  <div>
                    <p className="font-medium">MRR (Receita Recorrente Mensal)</p>
                    <p className="text-sm text-muted-foreground">R$ {metrics?.mrr || "0.00"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">Taxa de Churn</p>
                    <p className="text-sm text-muted-foreground">{metrics?.churnRate || "0.00"}%</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
