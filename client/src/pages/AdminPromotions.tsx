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
import { Plus, Percent, DollarSign, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

export default function AdminPromotions() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    maxUses: "",
    validFrom: "",
    validUntil: "",
  });

  const { data: promotions, isLoading, refetch } = trpc.admin.getPromotions.useQuery();

  const createMutation = trpc.admin.createPromotion.useMutation({
    onSuccess: () => {
      toast.success("Promoção criada com sucesso!");
      setIsCreateOpen(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        maxUses: "",
        validFrom: "",
        validUntil: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar promoção: ${error.message}`);
    },
  });

  const updateMutation = trpc.admin.updatePromotion.useMutation({
    onSuccess: () => {
      toast.success("Promoção atualizada!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMutation = trpc.admin.deletePromotion.useMutation({
    onSuccess: () => {
      toast.success("Promoção excluída!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : undefined,
    });
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta promoção?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <PokerLayout title="Gestão de Promoções">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold neon-text-pink">Promoções e Cupons</h1>
            <p className="text-muted-foreground mt-1">
              Crie e gerencie cupons de desconto para atrair e reter usuários
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-neon gap-2">
                <Plus className="h-4 w-4" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="neon-text-pink">Criar Nova Promoção</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo cupom de desconto
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código do Cupom *</Label>
                    <Input
                      id="code"
                      placeholder="PROMO2024"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Promoção *</Label>
                    <Input
                      id="name"
                      placeholder="Desconto de Lançamento"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descrição da promoção..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Tipo de Desconto *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(v: any) => setFormData({ ...formData, discountType: v })}
                    >
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">Valor do Desconto *</Label>
                    <Input
                      id="discountValue"
                      type="number"
                      placeholder={formData.discountType === "percentage" ? "20" : "10.00"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Usos Máximos</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      placeholder="100"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validFrom">Válido De</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Válido Até</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                  disabled={!formData.code || !formData.name || !formData.discountValue}
                >
                  Criar Promoção
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Promotions Table */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Promoções Ativas</CardTitle>
            <CardDescription>
              Lista de todos os cupons de desconto criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : promotions && promotions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promo: any) => (
                    <TableRow key={promo.id} className="border-border/50">
                      <TableCell className="font-mono font-bold text-neon-pink">
                        {promo.code}
                      </TableCell>
                      <TableCell className="font-medium">{promo.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {promo.discountType === "percentage" ? (
                            <>
                              <Percent className="h-4 w-4 text-green-400" />
                              <span>{promo.discountValue}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-400" />
                              <span>R$ {promo.discountValue}</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.usedCount || 0}
                        {promo.maxUses ? ` / ${promo.maxUses}` : " / ∞"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {promo.validUntil
                          ? new Date(promo.validUntil).toLocaleDateString("pt-BR")
                          : "Sem limite"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promo.isActive}
                            onCheckedChange={() => handleToggleActive(promo.id, promo.isActive)}
                          />
                          <Badge variant={promo.isActive ? "default" : "secondary"}>
                            {promo.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promo.id)}
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
                <p className="text-muted-foreground mb-4">Nenhuma promoção criada ainda</p>
                <Button className="btn-neon" onClick={() => setIsCreateOpen(true)}>
                  Criar Primeira Promoção
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
