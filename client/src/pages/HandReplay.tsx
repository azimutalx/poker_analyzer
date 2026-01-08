import { PokerLayout } from "@/components/PokerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

interface Player {
  name: string;
  position: string;
  stack: number;
  cards?: string;
  isHero?: boolean;
  isFolded?: boolean;
  bet?: number;
}

interface Action {
  player: string;
  action: string;
  amount?: number;
  street: string;
}

// Mock hand data
const mockHandData = {
  id: 1,
  handNumber: "234567890",
  site: "PokerStars",
  stakes: "$0.50/$1.00",
  tableName: "Andromeda",
  playedAt: "2024-01-08T10:30:00Z",
  heroCards: "AhKs",
  boardCards: ["Ah", "7c", "2d", "5s", "Kd"],
  potSize: 250.0,
  heroWon: 125.5,
  players: [
    { name: "Hero", position: "BTN", stack: 100, cards: "AhKs", isHero: true },
    { name: "Villain1", position: "SB", stack: 98.5, isFolded: false },
    { name: "Villain2", position: "BB", stack: 95, isFolded: true },
    { name: "Villain3", position: "UTG", stack: 120, isFolded: true },
    { name: "Villain4", position: "MP", stack: 85, isFolded: true },
    { name: "Villain5", position: "CO", stack: 110, isFolded: true },
  ],
  actions: [
    { player: "Villain3", action: "fold", street: "preflop" },
    { player: "Villain4", action: "fold", street: "preflop" },
    { player: "Villain5", action: "fold", street: "preflop" },
    { player: "Hero", action: "raise", amount: 3, street: "preflop" },
    { player: "Villain1", action: "call", amount: 2.5, street: "preflop" },
    { player: "Villain2", action: "fold", street: "preflop" },
    { player: "Villain1", action: "check", street: "flop" },
    { player: "Hero", action: "bet", amount: 4.5, street: "flop" },
    { player: "Villain1", action: "call", amount: 4.5, street: "flop" },
    { player: "Villain1", action: "check", street: "turn" },
    { player: "Hero", action: "bet", amount: 12, street: "turn" },
    { player: "Villain1", action: "call", amount: 12, street: "turn" },
    { player: "Villain1", action: "check", street: "river" },
    { player: "Hero", action: "bet", amount: 35, street: "river" },
    { player: "Villain1", action: "call", amount: 35, street: "river" },
  ],
};

function formatCard(card: string) {
  const rank = card[0];
  const suit = card[1];
  const suitSymbol = { h: "♥", d: "♦", c: "♣", s: "♠" }[suit.toLowerCase()] || suit;
  const suitClass = ["h", "d"].includes(suit.toLowerCase()) ? "text-red-500" : "text-white";

  return (
    <span className={`${suitClass} font-bold`}>
      {rank}
      {suitSymbol}
    </span>
  );
}

function PokerTable({
  players,
  pot,
  board,
  currentAction,
}: {
  players: Player[];
  pot: number;
  board: string[];
  currentAction?: number;
}) {
  const positions = [
    { top: "85%", left: "50%", transform: "translate(-50%, -50%)" }, // BTN (bottom center)
    { top: "70%", left: "15%", transform: "translate(-50%, -50%)" }, // SB
    { top: "30%", left: "15%", transform: "translate(-50%, -50%)" }, // BB
    { top: "15%", left: "50%", transform: "translate(-50%, -50%)" }, // UTG (top center)
    { top: "30%", left: "85%", transform: "translate(-50%, -50%)" }, // MP
    { top: "70%", left: "85%", transform: "translate(-50%, -50%)" }, // CO
  ];

  return (
    <div className="relative w-full aspect-[16/10] max-w-4xl mx-auto">
      {/* Table */}
      <div className="absolute inset-[10%] rounded-[50%] bg-gradient-to-b from-green-900 to-green-950 border-8 border-amber-900 shadow-2xl">
        {/* Inner felt */}
        <div className="absolute inset-4 rounded-[50%] border-2 border-green-700/50" />

        {/* Pot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-sm text-green-300 uppercase tracking-wide">Pot</div>
          <div className="text-2xl font-bold text-neon-cyan">${pot.toFixed(2)}</div>
        </div>

        {/* Board Cards */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-2">
          {board.map((card, i) => (
            <div
              key={i}
              className="w-12 h-16 bg-white rounded-lg flex items-center justify-center text-xl font-bold shadow-lg"
            >
              {formatCard(card)}
            </div>
          ))}
          {[...Array(5 - board.length)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-16 bg-gray-800/50 rounded-lg border border-gray-700"
            />
          ))}
        </div>
      </div>

      {/* Players */}
      {players.map((player, i) => (
        <div
          key={player.name}
          className="absolute"
          style={positions[i]}
        >
          <div
            className={`p-3 rounded-lg border-2 transition-all ${
              player.isHero
                ? "bg-primary/20 border-neon-pink"
                : player.isFolded
                ? "bg-gray-900/50 border-gray-700 opacity-50"
                : "bg-card border-border"
            }`}
          >
            <div className="text-center">
              <Badge
                variant="outline"
                className={`mb-1 ${player.isHero ? "border-neon-pink text-neon-pink" : ""}`}
              >
                {player.position}
              </Badge>
              <div className="text-sm font-medium truncate max-w-[80px]">
                {player.name}
              </div>
              <div className="text-xs text-muted-foreground">
                ${player.stack.toFixed(2)}
              </div>
              {player.cards && (
                <div className="flex gap-1 justify-center mt-2">
                  {player.cards.match(/.{2}/g)?.map((card, j) => (
                    <div
                      key={j}
                      className="w-8 h-10 bg-white rounded text-sm flex items-center justify-center font-bold"
                    >
                      {formatCard(card)}
                    </div>
                  ))}
                </div>
              )}
              {player.bet && player.bet > 0 && (
                <div className="mt-1 text-xs text-neon-cyan font-bold">
                  ${player.bet.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HandReplay() {
  const params = useParams();
  const handId = params.id;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // In real app, fetch hand data
  // const { data: handData } = trpc.hands.getById.useQuery({ id: Number(handId) });
  const handData = mockHandData;

  const totalSteps = handData.actions.length;

  // Get current game state based on step
  const getCurrentState = () => {
    const actionsToApply = handData.actions.slice(0, currentStep);
    let pot = 1.5; // blinds
    let board: string[] = [];
    const players = handData.players.map((p) => ({ ...p, bet: 0, isFolded: false }));

    let currentStreet = "preflop";

    actionsToApply.forEach((action) => {
      if (action.street !== currentStreet) {
        currentStreet = action.street;
        players.forEach((p) => (p.bet = 0));

        if (action.street === "flop") {
          board = handData.boardCards.slice(0, 3);
        } else if (action.street === "turn") {
          board = handData.boardCards.slice(0, 4);
        } else if (action.street === "river") {
          board = handData.boardCards.slice(0, 5);
        }
      }

      const player = players.find((p) => p.name === action.player);
      if (player) {
        if (action.action === "fold") {
          player.isFolded = true;
        } else if (action.amount) {
          pot += action.amount;
          player.bet = (player.bet || 0) + action.amount;
          player.stack -= action.amount;
        }
      }
    });

    return { pot, board, players };
  };

  const { pot, board, players } = getCurrentState();

  // Auto-play
  useEffect(() => {
    if (isPlaying && currentStep < totalSteps) {
      const timer = setTimeout(() => {
        setCurrentStep((s) => s + 1);
      }, 1500 / playbackSpeed);
      return () => clearTimeout(timer);
    } else if (currentStep >= totalSteps) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, totalSteps, playbackSpeed]);

  const currentAction = handData.actions[currentStep - 1];

  return (
    <PokerLayout title="Replay de Mão">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/hands">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {handData.site} - {handData.stakes}
            </div>
            <div className="text-xs text-muted-foreground">
              Mão #{handData.handNumber}
            </div>
          </div>
        </div>

        {/* Table Visualization */}
        <Card className="glass-card border-border/50 overflow-hidden">
          <CardContent className="p-6">
            <PokerTable
              players={players}
              pot={pot}
              board={board}
              currentAction={currentStep}
            />
          </CardContent>
        </Card>

        {/* Current Action Display */}
        {currentAction && (
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 text-lg">
                <span className="font-bold text-neon-cyan">{currentAction.player}</span>
                <span className="text-muted-foreground">{currentAction.action}</span>
                {currentAction.amount && (
                  <span className="text-neon-pink font-bold">
                    ${currentAction.amount.toFixed(2)}
                  </span>
                )}
                <Badge variant="outline" className="ml-2">
                  {currentAction.street}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Playback Controls */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Progress Slider */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">
                  {currentStep}/{totalSteps}
                </span>
                <Slider
                  value={[currentStep]}
                  max={totalSteps}
                  step={1}
                  onValueChange={([value]) => setCurrentStep(value)}
                  className="flex-1"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep(0)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-neon h-12 w-12"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentStep(totalSteps)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Velocidade:</span>
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <Button
                    key={speed}
                    variant={playbackSpeed === speed ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPlaybackSpeed(speed)}
                    className={playbackSpeed === speed ? "btn-neon-cyan" : ""}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action History */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {handData.actions.map((action, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    i < currentStep
                      ? "bg-muted/30"
                      : i === currentStep
                      ? "bg-primary/20 border border-primary/50"
                      : "opacity-50"
                  }`}
                >
                  <Badge variant="outline" className="w-16 justify-center">
                    {action.street}
                  </Badge>
                  <span className="font-medium w-24">{action.player}</span>
                  <span className="text-muted-foreground">{action.action}</span>
                  {action.amount && (
                    <span className="text-neon-pink font-bold ml-auto">
                      ${action.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PokerLayout>
  );
}
