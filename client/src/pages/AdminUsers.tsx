import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PokerLayout from "@/components/PokerLayout";
import { trpc } from "@/lib/trpc";
import { Search, Shield, User, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const { data, isLoading, refetch } = trpc.admin.getUsers.useQuery({
    page,
    limit: 20,
    search,
    role: roleFilter,
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Role do usuário atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar role: ${error.message}`);
    },
  });

  const handleRoleChange = (userId: number, newRole: "user" | "admin") => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  return (
    <PokerLayout title="Gestão de Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold neon-text-pink">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e gerencie todos os usuários da plataforma
          </p>
        </div>

        {/* Filters */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-input border-border"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <SelectValue placeholder="Filtrar por role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Usuários ({data?.users.length || 0})</CardTitle>
            <CardDescription>
              Lista de todos os usuários cadastrados na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.users.map((user: any) => (
                      <TableRow key={user.id} className="border-border/50">
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                        <TableCell className="font-medium">{user.name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin" ? "default" : "secondary"}
                            className={user.role === "admin" ? "bg-neon-pink/20 text-neon-pink border-neon-pink/50" : ""}
                          >
                            {user.role === "admin" ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : (
                              <User className="h-3 w-3 mr-1" />
                            )}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.subscription ? (
                            <Badge
                              variant={user.subscription.status === "active" ? "default" : "secondary"}
                              className={
                                user.subscription.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                                  : ""
                              }
                            >
                              {user.subscription.status}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Free</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.credits ? (
                            <div className="space-y-1">
                              <div>Mãos: {user.credits.handsImported}/{user.credits.handsLimit}</div>
                              <div>Análises: {user.credits.analysisUsed}/{user.credits.analysisLimit}</div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Alterar Role
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Alterar Role do Usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Deseja alterar o role de <strong>{user.name || user.email}</strong> para{" "}
                                  <strong>{user.role === "admin" ? "user" : "admin"}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")
                                  }
                                  className="btn-neon"
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {data?.totalPages || 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= (data?.totalPages || 1)}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
