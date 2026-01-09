import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import PokerLayout from "@/components/PokerLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Megaphone, Trash2, Eye, MousePointerClick } from "lucide-react";
import { toast } from "sonner";

export default function AdminAnnouncements() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "banner" as "banner" | "modal" | "notification" | "toast",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    targetAudience: "all" as "all" | "free" | "subscribed" | "admin",
    displayLocation: "",
    imageUrl: "",
    ctaText: "",
    ctaUrl: "",
    startDate: "",
    endDate: "",
  });

  const { data: announcements, isLoading, refetch } = trpc.admin.getAnnouncements.useQuery();

  const createMutation = trpc.admin.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Anúncio criado com sucesso!");
      setIsCreateOpen(false);
      setFormData({
        title: "",
        content: "",
        type: "banner",
        priority: "medium",
        targetAudience: "all",
        displayLocation: "",
        imageUrl: "",
        ctaText: "",
        ctaUrl: "",
        startDate: "",
        endDate: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar anúncio: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Anúncio atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Anúncio excluído!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      displayLocation: formData.displayLocation || undefined,
      imageUrl: formData.imageUrl || undefined,
      ctaText: formData.ctaText || undefined,
      ctaUrl: formData.ctaUrl || undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    });
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este anúncio?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  return (
    <PokerLayout title="Gestão de Anúncios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neon-text-pink">Anúncios e Banners</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie banners, modais e notificações para os usuários
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-neon gap-2">
                <Plus className="h-4 w-4" />
                Novo Anúncio
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border max-w-3xl">
              <DialogHeader>
                <DialogTitle className="neon-text-pink">Criar Novo Anúncio</DialogTitle>
                <DialogDescription>
                  Configure um novo anúncio ou banner para exibir aos usuários
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Título do anúncio"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: any) => setFormData({ ...formData, type: v })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="modal">Modal</SelectItem>
                        <SelectItem value="notification">Notificação</SelectItem>
                        <SelectItem value="toast">Toast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo *</Label>
                  <Textarea
                    id="content"
                    placeholder="Conteúdo do anúncio..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-input border-border min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Público-Alvo</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(v: any) => setFormData({ ...formData, targetAudience: v })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="free">Usuários Free</SelectItem>
                        <SelectItem value="subscribed">Assinantes</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayLocation">Local de Exibição</Label>
                    <Input
                      id="displayLocation"
                      placeholder="dashboard, pricing..."
                      value={formData.displayLocation}
                      onChange={(e) => setFormData({ ...formData, displayLocation: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Texto do Botão (CTA)</Label>
                    <Input
                      id="ctaText"
                      placeholder="Saiba Mais"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaUrl">URL do Botão</Label>
                    <Input
                      id="ctaUrl"
                      placeholder="/pricing"
                      value={formData.ctaUrl}
                      onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="btn-neon"
                  onClick={handleCreate}
                  disabled={!formData.title || !formData.content}
                >
                  Criar Anúncio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements Table */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Anúncios Criados</CardTitle>
            <CardDescription>
              Lista de todos os anúncios e banners configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : announcements && announcements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Público</TableHead>
                    <TableHead>Métricas</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement: any) => (
                    <TableRow key={announcement.id} className="border-border/50">
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {announcement.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{announcement.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{announcement.targetAudience}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{announcement.impressions || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                            <span>{announcement.clicks || 0}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {announcement.endDate
                          ? new Date(announcement.endDate).toLocaleDateString("pt-BR")
                          : "Sem limite"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={announcement.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(announcement.id, announcement.isActive)
                            }
                          />
                          <Badge variant={announcement.isActive ? "default" : "secondary"}>
                            {announcement.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum anúncio criado ainda</p>
                <Button className="btn-neon" onClick={() => setIsCreateOpen(true)}>
                  Criar Primeiro Anúncio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
