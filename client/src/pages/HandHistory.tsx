import { PokerLayout } from "@/components/PokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Filter, Play, Search, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface HandCardProps {
  hand: {
    id: number;
    handNumber: string;
    heroCards: string;
    heroPosition: string;
    netResult: string;
    potSize: string;
    playedAt: string;
    boardCards?: string;
    tags?: string[];
  };
}

function formatCards(cards: string) {
  if (!cards) return null;
  
  const cardPairs = cards.match(/.{2}/g) || [];
  return cardPairs.map((card, i) => {
    const rank = card[0];
    const suit = card[1];
    const suitSymbol = { h: "♥", d: "♦", c: "♣", s: "♠" }[suit.toLowerCase()] || suit;
    const suitClass = ["h", "d"].includes(suit.toLowerCase()) ? "suit-hearts" : "suit-spades";
    
    return (
      <span key={i} className={`${suitClass} font-bold`}>
        {rank}{suitSymbol}
      </span>
    );
  });
}

function HandCard({ hand }: HandCardProps) {
  const isWin = parseFloat(hand.netResult) > 0;
  const isLoss = parseFloat(hand.netResult) < 0;

  return (
    <Card className="glass-card border-border/50 hover:border-primary/50 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Cards */}
            <div className="flex items-center gap-1 text-2xl font-mono bg-muted/30 px-3 py-2 rounded-lg">
              {formatCards(hand.heroCards)}
            </div>
            
            {/* Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-neon-cyan border-neon-cyan/50">
                  {hand.heroPosition}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  #{hand.handNumber}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Pot: ${hand.potSize}
              </div>
              {hand.boardCards && (
                <div className="flex items-center gap-1 text-sm">
                  Board: {formatCards(hand.boardCards)}
                </div>
              )}
            </div>
          </div>

          {/* Result & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div
                className={`text-xl font-bold ${
                  isWin ? "text-green-400" : isLoss ? "text-red-400" : "text-muted-foreground"
                }`}
              >
                {isWin ? "+" : ""}${hand.netResult}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(hand.playedAt).toLocaleDateString("pt-BR")}
              </div>
            </div>
            
            <Link href={`/hands/${hand.id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-neon-pink hover:text-neon-pink hover:bg-primary/10"
              >
                <Play className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Tags */}
        {hand.tags && hand.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {hand.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HandHistory() {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<string>("all");
  const [result, setResult] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: handsData, isLoading } = trpc.hands.list.useQuery({
    page,
    limit: 20,
    search,
    position: position !== "all" ? position : undefined,
    result: result !== "all" ? result : undefined,
  });

  // Mock data for display
  const mockHands = [
    {
      id: 1,
      handNumber: "234567890",
      heroCards: "AhKs",
      heroPosition: "BTN",
      netResult: "125.50",
      potSize: "250.00",
      playedAt: "2024-01-08T10:30:00Z",
      boardCards: "Ah7c2d5sKd",
      tags: ["Value Bet", "Top Pair"],
    },
    {
      id: 2,
      handNumber: "234567891",
      heroCards: "QsQh",
      heroPosition: "CO",
      netResult: "-85.00",
      potSize: "170.00",
      playedAt: "2024-01-08T10:25:00Z",
      boardCards: "Kh9c4d",
      tags: ["Overpair", "Lost to Set"],
    },
    {
      id: 3,
      handNumber: "234567892",
      heroCards: "JdTd",
      heroPosition: "BB",
      netResult: "45.00",
      potSize: "90.00",
      playedAt: "2024-01-08T10:20:00Z",
      boardCards: "9d8d2c7h",
      tags: ["Flush Draw", "Semi-Bluff"],
    },
  ];

  const hands = handsData?.hands || mockHands;
  const totalPages = handsData?.totalPages || 1;

  return (
    <PokerLayout title="Histórico de Mãos">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-neon-cyan" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por mão, cartas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>

              {/* Position Filter */}
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="BTN">Button</SelectItem>
                  <SelectItem value="CO">Cutoff</SelectItem>
                  <SelectItem value="MP">Middle</SelectItem>
                  <SelectItem value="UTG">UTG</SelectItem>
                  <SelectItem value="BB">Big Blind</SelectItem>
                  <SelectItem value="SB">Small Blind</SelectItem>
                </SelectContent>
              </Select>

              {/* Result Filter */}
              <Select value={result} onValueChange={setResult}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="won">Ganhou</SelectItem>
                  <SelectItem value="lost">Perdeu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Hands List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando mãos...
            </div>
          ) : hands.length === 0 ? (
            <Card className="glass-card border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhuma mão encontrada. Importe suas mãos para começar!
                </p>
                <Link href="/import">
                  <Button className="mt-4 btn-neon">Importar Mãos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            hands.map((hand) => <HandCard key={hand.id} hand={hand} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-border"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-border"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </PokerLayout>
  );
}
