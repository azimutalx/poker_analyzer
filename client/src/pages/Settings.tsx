import { PokerLayout } from "@/components/PokerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Bell,
  Cloud,
  Database,
  Download,
  Globe,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    milestones: true,
    improvements: true,
    leaks: true,
    weeklyReport: true,
  });
  const [preferences, setPreferences] = useState({
    currency: "USD",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    defaultStakes: "$0.50/$1.00",
  });

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <PokerLayout title="Configurações">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/30">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2">
              <Cloud className="h-4 w-4" />
              <span className="hidden sm:inline">Backup</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-neon-pink" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-10 w-10 text-neon-pink" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{user?.name || "Jogador"}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome de Exibição</Label>
                    <Input
                      defaultValue={user?.name || ""}
                      placeholder="Seu nome"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      defaultValue={user?.email || ""}
                      disabled
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nickname nos Sites</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="PokerStars" className="bg-input border-border" />
                    <Input placeholder="888poker" className="bg-input border-border" />
                    <Input placeholder="GGPoker" className="bg-input border-border" />
                    <Input placeholder="PartyPoker" className="bg-input border-border" />
                  </div>
                </div>

                <Button onClick={handleSave} className="btn-neon gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-neon-cyan" />
                  Configurações de Notificações
                </CardTitle>
                <CardDescription>
                  Escolha quais notificações você deseja receber
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium">Marcos Atingidos</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando atingir marcos importantes (1000 mãos, etc.)
                      </p>
                    </div>
                    <Switch
                      checked={notifications.milestones}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, milestones: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium">Melhorias de Performance</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando houver melhoria significativa no winrate
                      </p>
                    </div>
                    <Switch
                      checked={notifications.improvements}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, improvements: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium">Identificação de Leaks</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando um leak crítico for identificado
                      </p>
                    </div>
                    <Switch
                      checked={notifications.leaks}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, leaks: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div>
                      <h4 className="font-medium">Relatório Semanal</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber resumo semanal de performance por email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="btn-neon gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-neon-pink" />
                  Preferências Gerais
                </CardTitle>
                <CardDescription>
                  Personalize sua experiência no aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma
                    </Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(v) =>
                        setPreferences({ ...preferences, language: v })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Moeda Padrão</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(v) =>
                        setPreferences({ ...preferences, currency: v })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(v) =>
                        setPreferences({ ...preferences, timezone: v })
                      }
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          São Paulo (GMT-3)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          New York (GMT-5)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          London (GMT+0)
                        </SelectItem>
                        <SelectItem value="Europe/Paris">
                          Paris (GMT+1)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Stakes Padrão</Label>
                    <Select
                      value={preferences.defaultStakes}
                      onValueChange={(v) =>
                        setPreferences({ ...preferences, defaultStakes: v })
                      }
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSave} className="btn-neon gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-neon-cyan" />
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription>
                  Exporte ou importe seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-muted/20 border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Download className="h-5 w-5 text-neon-pink" />
                        <h4 className="font-medium">Exportar Dados</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Baixe todas as suas mãos e estatísticas
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          CSV
                        </Button>
                        <Button variant="outline" size="sm">
                          JSON
                        </Button>
                        <Button variant="outline" size="sm">
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20 border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Upload className="h-5 w-5 text-neon-cyan" />
                        <h4 className="font-medium">Importar Dados</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Restaure dados de um backup anterior
                      </p>
                      <Button variant="outline" size="sm">
                        Selecionar Arquivo
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="border-t border-border/30 pt-6">
                  <h4 className="font-medium text-red-400 flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5" />
                    Zona de Perigo
                  </h4>
                  <Card className="bg-red-500/10 border-red-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Excluir Todos os Dados</h5>
                          <p className="text-sm text-muted-foreground">
                            Esta ação é irreversível e excluirá todas as suas mãos e estatísticas
                          </p>
                        </div>
                        <Button variant="destructive" className="gap-2">
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-neon-pink" />
                  Backup Automático
                </CardTitle>
                <CardDescription>
                  Configure backups automáticos para a nuvem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
                  <div>
                    <h4 className="font-medium">Backup Automático</h4>
                    <p className="text-sm text-muted-foreground">
                      Salvar automaticamente seus dados no S3
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Backup</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">A cada hora</SelectItem>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Status do Backup</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Último backup: Hoje às 10:30
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Próximo backup: Amanhã às 10:30
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button className="btn-neon gap-2">
                    <Cloud className="h-4 w-4" />
                    Fazer Backup Agora
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Restaurar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PokerLayout>
  );
}
