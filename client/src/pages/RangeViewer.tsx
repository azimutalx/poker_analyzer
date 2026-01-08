import { PokerLayout } from "@/components/PokerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Grid3X3, Info } from "lucide-react";
import { useState } from "react";

// Hand ranks for the matrix
const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

// GTO Range data (simplified example)
const gtoRanges: Record<string, Record<string, Record<string, number>>> = {
  BTN: {
    RFI: {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 100, "33": 100, "22": 100,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 100, A8s: 100, A7s: 100, A6s: 100, A5s: 100, A4s: 100, A3s: 100, A2s: 100,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100, A9o: 100, A8o: 80, A7o: 60, A6o: 40, A5o: 60, A4o: 40, A3o: 30, A2o: 20,
      KQs: 100, KJs: 100, KTs: 100, K9s: 100, K8s: 80, K7s: 70, K6s: 60, K5s: 50, K4s: 40, K3s: 30, K2s: 20,
      KQo: 100, KJo: 100, KTo: 90, K9o: 70, K8o: 40, K7o: 20,
      QJs: 100, QTs: 100, Q9s: 100, Q8s: 80, Q7s: 60, Q6s: 50, Q5s: 40, Q4s: 30, Q3s: 20, Q2s: 10,
      QJo: 100, QTo: 90, Q9o: 60, Q8o: 30,
      JTs: 100, J9s: 100, J8s: 80, J7s: 60, J6s: 40, J5s: 30, J4s: 20,
      JTo: 100, J9o: 70, J8o: 40,
      T9s: 100, T8s: 100, T7s: 70, T6s: 50,
      T9o: 80, T8o: 50,
      "98s": 100, "97s": 80, "96s": 50, "95s": 30,
      "98o": 60, "97o": 30,
      "87s": 100, "86s": 70, "85s": 40,
      "87o": 50,
      "76s": 100, "75s": 60, "74s": 30,
      "76o": 40,
      "65s": 100, "64s": 50,
      "65o": 30,
      "54s": 100, "53s": 40,
      "54o": 20,
      "43s": 70, "42s": 20,
      "32s": 40,
    },
  },
  CO: {
    RFI: {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 80, "33": 60, "22": 40,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 100, A8s: 100, A7s: 80, A6s: 70, A5s: 100, A4s: 80, A3s: 60, A2s: 50,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100, A9o: 80, A8o: 50, A7o: 30, A6o: 20, A5o: 40, A4o: 20,
      KQs: 100, KJs: 100, KTs: 100, K9s: 100, K8s: 60, K7s: 40, K6s: 30, K5s: 20,
      KQo: 100, KJo: 100, KTo: 80, K9o: 50, K8o: 20,
      QJs: 100, QTs: 100, Q9s: 90, Q8s: 60, Q7s: 30,
      QJo: 100, QTo: 80, Q9o: 40,
      JTs: 100, J9s: 100, J8s: 60, J7s: 30,
      JTo: 90, J9o: 50,
      T9s: 100, T8s: 80, T7s: 40,
      T9o: 60,
      "98s": 100, "97s": 60, "96s": 30,
      "98o": 40,
      "87s": 100, "86s": 50,
      "87o": 30,
      "76s": 100, "75s": 40,
      "65s": 100, "64s": 30,
      "54s": 90,
      "43s": 50,
    },
  },
  MP: {
    RFI: {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 100, "88": 100, "77": 80, "66": 60, "55": 40, "44": 20,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 80, A8s: 60, A7s: 40, A6s: 30, A5s: 80, A4s: 50, A3s: 30, A2s: 20,
      AKo: 100, AQo: 100, AJo: 100, ATo: 80, A9o: 40,
      KQs: 100, KJs: 100, KTs: 100, K9s: 70, K8s: 30,
      KQo: 100, KJo: 90, KTo: 60,
      QJs: 100, QTs: 100, Q9s: 60,
      QJo: 80, QTo: 50,
      JTs: 100, J9s: 80,
      JTo: 60,
      T9s: 100, T8s: 50,
      "98s": 90, "97s": 30,
      "87s": 80,
      "76s": 70,
      "65s": 60,
      "54s": 50,
    },
  },
  UTG: {
    RFI: {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 80, "88": 60, "77": 40, "66": 20,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 50, A8s: 30, A5s: 50, A4s: 30,
      AKo: 100, AQo: 100, AJo: 80, ATo: 40,
      KQs: 100, KJs: 100, KTs: 80, K9s: 30,
      KQo: 100, KJo: 60,
      QJs: 100, QTs: 80,
      QJo: 50,
      JTs: 100, J9s: 40,
      T9s: 80,
      "98s": 60,
      "87s": 50,
      "76s": 40,
      "65s": 30,
    },
  },
  BB: {
    "vs BTN": {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 100, "33": 100, "22": 100,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 100, A8s: 100, A7s: 100, A6s: 100, A5s: 100, A4s: 100, A3s: 100, A2s: 100,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100, A9o: 100, A8o: 100, A7o: 100, A6o: 100, A5o: 100, A4o: 100, A3o: 100, A2o: 100,
      KQs: 100, KJs: 100, KTs: 100, K9s: 100, K8s: 100, K7s: 100, K6s: 100, K5s: 100, K4s: 100, K3s: 100, K2s: 100,
      KQo: 100, KJo: 100, KTo: 100, K9o: 100, K8o: 100, K7o: 100, K6o: 100, K5o: 100, K4o: 80, K3o: 60, K2o: 40,
      QJs: 100, QTs: 100, Q9s: 100, Q8s: 100, Q7s: 100, Q6s: 100, Q5s: 100, Q4s: 100, Q3s: 100, Q2s: 100,
      QJo: 100, QTo: 100, Q9o: 100, Q8o: 100, Q7o: 80, Q6o: 60, Q5o: 40, Q4o: 30, Q3o: 20,
      JTs: 100, J9s: 100, J8s: 100, J7s: 100, J6s: 100, J5s: 100, J4s: 100, J3s: 80, J2s: 60,
      JTo: 100, J9o: 100, J8o: 100, J7o: 80, J6o: 60, J5o: 40, J4o: 30,
      T9s: 100, T8s: 100, T7s: 100, T6s: 100, T5s: 80, T4s: 60, T3s: 40, T2s: 30,
      T9o: 100, T8o: 100, T7o: 80, T6o: 60, T5o: 40,
      "98s": 100, "97s": 100, "96s": 100, "95s": 80, "94s": 60, "93s": 40, "92s": 30,
      "98o": 100, "97o": 100, "96o": 80, "95o": 60,
      "87s": 100, "86s": 100, "85s": 100, "84s": 80, "83s": 60, "82s": 40,
      "87o": 100, "86o": 100, "85o": 80, "84o": 60,
      "76s": 100, "75s": 100, "74s": 100, "73s": 80, "72s": 60,
      "76o": 100, "75o": 100, "74o": 80, "73o": 60,
      "65s": 100, "64s": 100, "63s": 100, "62s": 80,
      "65o": 100, "64o": 100, "63o": 80,
      "54s": 100, "53s": 100, "52s": 100,
      "54o": 100, "53o": 100,
      "43s": 100, "42s": 100,
      "43o": 100,
      "32s": 100,
    },
  },
  SB: {
    RFI: {
      AA: 100, KK: 100, QQ: 100, JJ: 100, TT: 100, "99": 100, "88": 100, "77": 100, "66": 100, "55": 100, "44": 100, "33": 100, "22": 100,
      AKs: 100, AQs: 100, AJs: 100, ATs: 100, A9s: 100, A8s: 100, A7s: 100, A6s: 100, A5s: 100, A4s: 100, A3s: 100, A2s: 100,
      AKo: 100, AQo: 100, AJo: 100, ATo: 100, A9o: 100, A8o: 80, A7o: 60, A6o: 50, A5o: 70, A4o: 50, A3o: 40, A2o: 30,
      KQs: 100, KJs: 100, KTs: 100, K9s: 100, K8s: 100, K7s: 80, K6s: 70, K5s: 60, K4s: 50, K3s: 40, K2s: 30,
      KQo: 100, KJo: 100, KTo: 100, K9o: 80, K8o: 50, K7o: 30, K6o: 20,
      QJs: 100, QTs: 100, Q9s: 100, Q8s: 100, Q7s: 70, Q6s: 60, Q5s: 50, Q4s: 40, Q3s: 30, Q2s: 20,
      QJo: 100, QTo: 100, Q9o: 70, Q8o: 40, Q7o: 20,
      JTs: 100, J9s: 100, J8s: 100, J7s: 70, J6s: 50, J5s: 40, J4s: 30, J3s: 20,
      JTo: 100, J9o: 80, J8o: 50, J7o: 30,
      T9s: 100, T8s: 100, T7s: 80, T6s: 60, T5s: 40, T4s: 30,
      T9o: 90, T8o: 60, T7o: 30,
      "98s": 100, "97s": 100, "96s": 70, "95s": 50, "94s": 30,
      "98o": 70, "97o": 40,
      "87s": 100, "86s": 90, "85s": 60, "84s": 40,
      "87o": 60, "86o": 30,
      "76s": 100, "75s": 80, "74s": 50, "73s": 30,
      "76o": 50,
      "65s": 100, "64s": 70, "63s": 40,
      "65o": 40,
      "54s": 100, "53s": 60, "52s": 30,
      "43s": 80, "42s": 40,
      "32s": 60,
    },
  },
};

function getHandKey(row: number, col: number): string {
  const r1 = ranks[row];
  const r2 = ranks[col];

  if (row === col) {
    return r1 + r2; // Pair
  } else if (row < col) {
    return r1 + r2 + "s"; // Suited (above diagonal)
  } else {
    return r2 + r1 + "o"; // Offsuit (below diagonal)
  }
}

function getFrequencyColor(freq: number): string {
  if (freq === 0) return "bg-muted/30";
  if (freq < 25) return "bg-blue-900/60";
  if (freq < 50) return "bg-blue-700/60";
  if (freq < 75) return "bg-green-700/60";
  if (freq < 100) return "bg-yellow-600/60";
  return "bg-red-600/60";
}

interface RangeMatrixProps {
  rangeData: Record<string, number>;
  onCellClick?: (hand: string, freq: number) => void;
}

function RangeMatrix({ rangeData, onCellClick }: RangeMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Header row */}
        <div className="flex">
          <div className="w-10 h-10" />
          {ranks.map((rank) => (
            <div
              key={rank}
              className="w-10 h-10 flex items-center justify-center text-xs font-bold text-muted-foreground"
            >
              {rank}
            </div>
          ))}
        </div>

        {/* Matrix rows */}
        {ranks.map((_, rowIndex) => (
          <div key={rowIndex} className="flex">
            {/* Row header */}
            <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-muted-foreground">
              {ranks[rowIndex]}
            </div>

            {/* Cells */}
            {ranks.map((_, colIndex) => {
              const handKey = getHandKey(rowIndex, colIndex);
              const freq = rangeData[handKey] || 0;
              const isHovered = hoveredCell === handKey;

              return (
                <div
                  key={colIndex}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-[10px] font-medium border border-border/30 cursor-pointer transition-all",
                    getFrequencyColor(freq),
                    isHovered && "ring-2 ring-neon-pink scale-110 z-10",
                    rowIndex === colIndex && "font-bold" // Pairs
                  )}
                  onMouseEnter={() => setHoveredCell(handKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => onCellClick?.(handKey, freq)}
                >
                  <span className={freq > 0 ? "text-white" : "text-muted-foreground"}>
                    {handKey.replace("s", "").replace("o", "")}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hovered cell info */}
      {hoveredCell && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50 inline-block">
          <span className="font-bold text-neon-cyan">{hoveredCell}</span>
          <span className="text-muted-foreground ml-2">
            Frequência: {rangeData[hoveredCell] || 0}%
          </span>
        </div>
      )}
    </div>
  );
}

export default function RangeViewer() {
  const [position, setPosition] = useState<string>("BTN");
  const [situation, setSituation] = useState<string>("RFI");

  const availableSituations = Object.keys(gtoRanges[position] || {});
  const currentRange = gtoRanges[position]?.[situation] || {};

  // Calculate range stats
  const totalCombos = Object.values(currentRange).reduce((sum, freq) => {
    return sum + (freq / 100);
  }, 0);

  return (
    <PokerLayout title="Ranges GTO">
      <div className="space-y-6">
        {/* Controls */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-neon-pink" />
              Visualizador de Ranges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Posição</Label>
                <Select value={position} onValueChange={(v) => {
                  setPosition(v);
                  setSituation(Object.keys(gtoRanges[v] || {})[0] || "RFI");
                }}>
                  <SelectTrigger className="w-[140px] bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTN">Button</SelectItem>
                    <SelectItem value="CO">Cutoff</SelectItem>
                    <SelectItem value="MP">Middle</SelectItem>
                    <SelectItem value="UTG">UTG</SelectItem>
                    <SelectItem value="SB">Small Blind</SelectItem>
                    <SelectItem value="BB">Big Blind</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Situação</Label>
                <Select value={situation} onValueChange={setSituation}>
                  <SelectTrigger className="w-[160px] bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSituations.map((sit) => (
                      <SelectItem key={sit} value={sit}>
                        {sit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Range Matrix */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">
                {position} - {situation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RangeMatrix rangeData={currentRange} />
            </CardContent>
          </Card>

          {/* Legend & Stats */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-neon-cyan" />
                  Legenda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-red-600/60" />
                  <span className="text-sm">100% (Always)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-yellow-600/60" />
                  <span className="text-sm">75-99%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-green-700/60" />
                  <span className="text-sm">50-74%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-700/60" />
                  <span className="text-sm">25-49%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-900/60" />
                  <span className="text-sm">1-24%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-muted/30 border border-border/50" />
                  <span className="text-sm">0% (Fold)</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Estatísticas do Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Combos</span>
                  <span className="font-bold text-neon-pink">
                    {totalCombos.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">% do Range</span>
                  <span className="font-bold text-neon-cyan">
                    {((totalCombos / 169) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mãos Incluídas</span>
                  <span className="font-bold">
                    {Object.values(currentRange).filter((f) => f > 0).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Matrix Key */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Leitura da Matriz</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <span className="text-neon-pink font-bold">Diagonal:</span> Pares (AA, KK, etc.)
                </p>
                <p>
                  <span className="text-neon-cyan font-bold">Acima:</span> Suited (AKs, AQs, etc.)
                </p>
                <p>
                  <span className="text-foreground font-bold">Abaixo:</span> Offsuit (AKo, AQo, etc.)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Position Comparison Tabs */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Comparação por Posição</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="rfi" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-muted/30">
                <TabsTrigger value="btn">BTN</TabsTrigger>
                <TabsTrigger value="co">CO</TabsTrigger>
                <TabsTrigger value="mp">MP</TabsTrigger>
                <TabsTrigger value="utg">UTG</TabsTrigger>
                <TabsTrigger value="sb">SB</TabsTrigger>
                <TabsTrigger value="bb">BB</TabsTrigger>
              </TabsList>
              {Object.entries(gtoRanges).map(([pos, situations]) => (
                <TabsContent key={pos} value={pos.toLowerCase()} className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(situations).map(([sit, range]) => (
                      <div key={sit} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <h4 className="font-bold mb-2 text-neon-cyan">{sit}</h4>
                        <p className="text-sm text-muted-foreground">
                          {Object.values(range).filter((f) => f > 0).length} mãos no range
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
