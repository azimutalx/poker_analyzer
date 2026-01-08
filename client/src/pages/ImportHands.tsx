import { PokerLayout } from "@/components/PokerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImportHands() {
  const [site, setSite] = useState<string>("pokerstars");
  const [handHistory, setHandHistory] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const importMutation = trpc.hands.importHands.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsProcessing(false);
      setProgress(100);
      if (data.success > 0) {
        toast.success(`${data.success} mãos importadas com sucesso!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} mãos falharam na importação`);
      }
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error("Erro ao importar mãos: " + error.message);
    },
  });

  const handleImport = () => {
    if (!handHistory.trim()) {
      toast.error("Cole o histórico de mãos antes de importar");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    importMutation.mutate({
      site,
      rawHistory: handHistory,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setHandHistory(text);
        toast.success(`Arquivo "${file.name}" carregado`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <PokerLayout title="Importar Mãos">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Instructions Card */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-cyan" />
              Como Importar
            </CardTitle>
            <CardDescription>
              Importe seu histórico de mãos para análise completa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-neon-pink font-bold mb-2">1. Selecione o Site</div>
                <p className="text-sm text-muted-foreground">
                  Escolha a sala de poker de onde vem o histórico
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-neon-cyan font-bold mb-2">2. Cole o Histórico</div>
                <p className="text-sm text-muted-foreground">
                  Cole o texto do histórico ou faça upload do arquivo
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="text-neon-purple font-bold mb-2">3. Importe</div>
                <p className="text-sm text-muted-foreground">
                  Clique em importar e aguarde o processamento
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Form */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-neon-pink" />
              Importar Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Site Selection */}
            <div className="space-y-2">
              <Label>Sala de Poker</Label>
              <Select value={site} onValueChange={setSite}>
                <SelectTrigger className="w-full md:w-64 bg-input border-border">
                  <SelectValue placeholder="Selecione a sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pokerstars">PokerStars</SelectItem>
                  <SelectItem value="888poker">888poker</SelectItem>
                  <SelectItem value="partypoker">PartyPoker</SelectItem>
                  <SelectItem value="ggpoker">GGPoker</SelectItem>
                  <SelectItem value="winamax">Winamax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".txt,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-neon-cyan px-4 py-2 rounded-lg cursor-pointer text-sm font-medium"
                >
                  Escolher Arquivo
                </label>
                <span className="text-sm text-muted-foreground">
                  Formatos aceitos: .txt, .log
                </span>
              </div>
            </div>

            {/* Text Area */}
            <div className="space-y-2">
              <Label>Histórico de Mãos</Label>
              <Textarea
                placeholder="Cole aqui o histórico de mãos do poker..."
                value={handHistory}
                onChange={(e) => setHandHistory(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                {handHistory.split("Hand #").length - 1} mãos detectadas
              </p>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processando...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{result.success} importadas</span>
                  </div>
                  {result.failed > 0 && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <span>{result.failed} falharam</span>
                    </div>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Erros:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {result.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>...e mais {result.errors.length - 5} erros</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleImport}
              disabled={isProcessing || !handHistory.trim()}
              className="w-full btn-neon font-semibold tracking-wide"
            >
              {isProcessing ? "Processando..." : "Importar Mãos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
