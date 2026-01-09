import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search, DollarSign, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminTransactions() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading, refetch } = trpc.admin.getTransactions.useQuery({
    page,
    limit: 20,
    status,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExportCSV = () => {
    if (!data || data.transactions.length === 0) {
      toast.error("Nenhuma transação para exportar");
      return;
    }

    const headers = ["ID", "Usuário", "Email", "Plano", "Valor", "Status", "Método", "Data"];
    const rows = data.transactions.map(tx => [
      tx.id,
      tx.user?.name || "N/A",
      tx.user?.email || "N/A",
      tx.plan?.name || "N/A",
      `R$ ${tx.amount}`,
      tx.status,
      tx.paymentMethod || "N/A",
      new Date(tx.createdAt).toLocaleString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Relatório exportado com sucesso!");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    
    const labels: Record<string, string> = {
      completed: "Concluído",
      pending: "Pendente",
      failed: "Falhou",
      refunded: "Reembolsado",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            Transações
          </h1>
          <p className="text-gray-400 mt-1">Histórico completo de pagamentos e transações</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-gradient-to-r from-pink-500 to-cyan-400">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-pink-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total</CardTitle>
              <DollarSign className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-500">
                R$ {data.summary.total.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-cyan-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Concluídas</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-500">
                R$ {data.summary.completed.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pendentes</CardTitle>
              <RefreshCw className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                R$ {data.summary.pending.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Falhas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                R$ {data.summary.failed.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-black/40 border-pink-500/20">
        <CardHeader>
          <CardTitle className="text-pink-500">Filtros</CardTitle>
          <CardDescription>Filtre transações por status e período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Status</label>
              <Select value={status} onValueChange={(value: any) => { setStatus(value); setPage(1); }}>
                <SelectTrigger className="bg-black/60 border-pink-500/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="bg-black/60 border-pink-500/30"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="bg-black/60 border-pink-500/30"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setStatus("all");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                variant="outline"
                className="w-full border-cyan-500/30"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-black/40 border-pink-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-500">Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Carregando transações...</div>
          ) : !data || data.transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Nenhuma transação encontrada</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-pink-500/20">
                    <TableHead className="text-pink-500">ID</TableHead>
                    <TableHead className="text-pink-500">Usuário</TableHead>
                    <TableHead className="text-pink-500">Plano</TableHead>
                    <TableHead className="text-pink-500">Valor</TableHead>
                    <TableHead className="text-pink-500">Status</TableHead>
                    <TableHead className="text-pink-500">Método</TableHead>
                    <TableHead className="text-pink-500">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((tx) => (
                    <TableRow key={tx.id} className="border-cyan-500/10">
                      <TableCell className="text-gray-300">#{tx.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-gray-300 font-medium">{tx.user?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{tx.user?.email || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{tx.plan?.name || "N/A"}</TableCell>
                      <TableCell className="text-cyan-400 font-bold">R$ {tx.amount}</TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell className="text-gray-400">{tx.paymentMethod || "N/A"}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(tx.createdAt).toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="border-pink-500/30"
                  >
                    Anterior
                  </Button>
                  <span className="text-gray-400">
                    Página {page} de {data.totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    variant="outline"
                    className="border-pink-500/30"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
