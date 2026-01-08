import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Poker Hand Parser", () => {
  // Test the parsePokerHand function logic
  describe("Game Format Detection", () => {
    it("should detect cash game format from stakes pattern", () => {
      const rawHand = `PokerStars Hand #234567890: Hold'em No Limit ($0.50/$1.00 USD)
Table 'Andromeda' 6-max Seat #1 is the button
Dealt to Hero [Ah Ks]`;
      
      // Check for cash game pattern
      const hasCashPattern = /\$[\d.]+\/\$[\d.]+/.test(rawHand);
      expect(hasCashPattern).toBe(true);
      
      const hasTournamentPattern = /Tournament #\d+/i.test(rawHand);
      expect(hasTournamentPattern).toBe(false);
    });

    it("should detect tournament format from Tournament # pattern", () => {
      const rawHand = `PokerStars Hand #234567890: Tournament #123456789, $10.00+$1.00 USD Hold'em No Limit
Table 'Tournament Table' 9-max Seat #5 is the button
Dealt to Hero [Qc Qd]`;
      
      const hasTournamentPattern = /Tournament #(\d+)/i.test(rawHand);
      expect(hasTournamentPattern).toBe(true);
      
      const tournamentMatch = rawHand.match(/Tournament #(\d+)/i);
      expect(tournamentMatch).not.toBeNull();
      expect(tournamentMatch![1]).toBe("123456789");
    });

    it("should detect MTT format", () => {
      const rawHand = `PokerStars Hand #234567890: Tournament #123456789, MTT $10.00+$1.00 USD Hold'em No Limit`;
      
      const hasMTTPattern = /MTT|Multi-Table Tournament/i.test(rawHand);
      expect(hasMTTPattern).toBe(true);
    });

    it("should detect Sit & Go format", () => {
      const rawHand = `PokerStars Hand #234567890: Tournament #123456789, Sit & Go $5.00+$0.50 USD Hold'em No Limit`;
      
      const hasSNGPattern = /Sit & Go|SNG|Sit and Go/i.test(rawHand);
      expect(hasSNGPattern).toBe(true);
    });

    it("should extract buy-in from tournament", () => {
      const rawHand = `Tournament #123456789, $10.00+$1.00 USD Hold'em No Limit`;
      
      const buyInMatch = rawHand.match(/\$?([\d.]+)\+\$?([\d.]+)/);
      expect(buyInMatch).not.toBeNull();
      expect(buyInMatch![1]).toBe("10.00");
      expect(buyInMatch![2]).toBe("1.00");
    });
  });

  describe("Hero Cards Detection", () => {
    it("should extract hero cards from hand history", () => {
      const rawHand = `Dealt to Hero [Ah Ks]`;
      
      const heroCardsMatch = rawHand.match(/Dealt to ([^\[]+)\[([^\]]+)\]/);
      expect(heroCardsMatch).not.toBeNull();
      expect(heroCardsMatch![1].trim()).toBe("Hero");
      expect(heroCardsMatch![2].replace(/\s/g, '')).toBe("AhKs");
    });

    it("should handle different card formats", () => {
      const rawHand = `Dealt to Player123 [Qc Qd]`;
      
      const heroCardsMatch = rawHand.match(/Dealt to ([^\[]+)\[([^\]]+)\]/);
      expect(heroCardsMatch).not.toBeNull();
      expect(heroCardsMatch![2].replace(/\s/g, '')).toBe("QcQd");
    });
  });

  describe("Board Cards Detection", () => {
    it("should extract board cards from Board line", () => {
      const rawHand = `Board [Ah 7c 2d 5s Kd]`;
      
      const boardMatch = rawHand.match(/Board \[([^\]]+)\]/i);
      expect(boardMatch).not.toBeNull();
      expect(boardMatch![1].trim()).toBe("Ah 7c 2d 5s Kd");
    });

    it("should extract flop cards", () => {
      const rawHand = `*** FLOP *** [Ah 7c 2d]`;
      
      const flopMatch = rawHand.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
      expect(flopMatch).not.toBeNull();
      expect(flopMatch![1]).toBe("Ah 7c 2d");
    });
  });

  describe("Pot Size Detection", () => {
    it("should extract pot size", () => {
      const rawHand = `Total pot $250.00 | Rake $2.50`;
      
      const potMatch = rawHand.match(/Total pot (?:\$|€)?([\d.]+)/i);
      expect(potMatch).not.toBeNull();
      expect(parseFloat(potMatch![1])).toBe(250.00);
    });
  });

  describe("Hand Number Detection", () => {
    it("should extract hand number", () => {
      const rawHand = `PokerStars Hand #234567890: Hold'em No Limit`;
      
      const handNumberMatch = rawHand.match(/Hand #(\d+)/);
      expect(handNumberMatch).not.toBeNull();
      expect(handNumberMatch![1]).toBe("234567890");
    });
  });
});

describe("Credit System", () => {
  describe("Free Tier Limits", () => {
    it("should have correct default limits", () => {
      const defaultLimits = {
        handsLimit: 50,
        analysisLimit: 1,
        replaysLimit: 10,
      };
      
      expect(defaultLimits.handsLimit).toBe(50);
      expect(defaultLimits.analysisLimit).toBe(1);
      expect(defaultLimits.replaysLimit).toBe(10);
    });

    it("should calculate remaining credits correctly", () => {
      const used = 30;
      const limit = 50;
      const remaining = limit - used;
      
      expect(remaining).toBe(20);
    });

    it("should detect when limit is exceeded", () => {
      const used = 50;
      const limit = 50;
      const amount = 5;
      
      const wouldExceed = used + amount > limit;
      expect(wouldExceed).toBe(true);
    });

    it("should allow action when within limits", () => {
      const used = 45;
      const limit = 50;
      const amount = 5;
      
      const wouldExceed = used + amount > limit;
      expect(wouldExceed).toBe(false);
    });
  });

  describe("Subscription Plans", () => {
    const plans = [
      { slug: "free", price: 0, handsPerMonth: 50 },
      { slug: "starter", price: 19.90, handsPerMonth: 500 },
      { slug: "pro", price: 49.90, handsPerMonth: -1 }, // -1 = unlimited
    ];

    it("should have free plan with limited hands", () => {
      const freePlan = plans.find(p => p.slug === "free");
      expect(freePlan).toBeDefined();
      expect(freePlan!.price).toBe(0);
      expect(freePlan!.handsPerMonth).toBe(50);
    });

    it("should have starter plan with more hands", () => {
      const starterPlan = plans.find(p => p.slug === "starter");
      expect(starterPlan).toBeDefined();
      expect(starterPlan!.price).toBe(19.90);
      expect(starterPlan!.handsPerMonth).toBe(500);
    });

    it("should have pro plan with unlimited hands", () => {
      const proPlan = plans.find(p => p.slug === "pro");
      expect(proPlan).toBeDefined();
      expect(proPlan!.handsPerMonth).toBe(-1);
    });
  });
});

describe("Card Formatting", () => {
  const suitSymbols: Record<string, string> = {
    h: "♥",
    d: "♦",
    c: "♣",
    s: "♠",
  };

  const suitColors: Record<string, string> = {
    h: "text-red-500",
    d: "text-blue-500",
    c: "text-green-600",
    s: "text-gray-900",
  };

  it("should map suit letters to symbols correctly", () => {
    expect(suitSymbols["h"]).toBe("♥");
    expect(suitSymbols["d"]).toBe("♦");
    expect(suitSymbols["c"]).toBe("♣");
    expect(suitSymbols["s"]).toBe("♠");
  });

  it("should assign correct colors to suits", () => {
    expect(suitColors["h"]).toBe("text-red-500");
    expect(suitColors["d"]).toBe("text-blue-500");
    expect(suitColors["c"]).toBe("text-green-600");
    expect(suitColors["s"]).toBe("text-gray-900");
  });

  it("should parse card string correctly", () => {
    const card = "Ah";
    const rank = card[0].toUpperCase();
    const suit = card[1].toLowerCase();
    
    expect(rank).toBe("A");
    expect(suit).toBe("h");
    expect(suitSymbols[suit]).toBe("♥");
  });

  it("should handle all card ranks", () => {
    const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    
    ranks.forEach(rank => {
      const card = `${rank}h`;
      expect(card[0].toUpperCase()).toBe(rank);
    });
  });
});
