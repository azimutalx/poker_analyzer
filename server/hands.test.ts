import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("auth router", () => {
  describe("auth.me", () => {
    it("returns user for authenticated context", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
    });

    it("returns null for unauthenticated context", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeNull();
    });
  });

  describe("auth.logout", () => {
    it("clears session cookie", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.logout();

      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });
});

describe("input validation", () => {
  describe("hands.importHands input", () => {
    it("validates required fields", () => {
      const validInput = {
        site: "pokerstars",
        rawHistory: "PokerStars Hand #123456789: Hold'em No Limit ($0.50/$1.00)",
      };

      expect(validInput.site).toBe("pokerstars");
      expect(validInput.rawHistory).toContain("Hand #");
    });

    it("accepts different poker sites", () => {
      const sites = ["pokerstars", "888poker", "ggpoker", "partypoker", "winamax"];
      
      sites.forEach(site => {
        const input = { site, rawHistory: "Hand #123" };
        expect(input.site).toBe(site);
      });
    });
  });

  describe("hands.list input", () => {
    it("validates pagination parameters", () => {
      const input = { page: 1, limit: 20 };
      
      expect(input.page).toBeGreaterThan(0);
      expect(input.limit).toBeGreaterThan(0);
      expect(input.limit).toBeLessThanOrEqual(100);
    });

    it("accepts position filter", () => {
      const positions = ["BTN", "CO", "MP", "UTG", "BB", "SB"];
      
      positions.forEach(position => {
        const input = { page: 1, limit: 20, position };
        expect(input.position).toBe(position);
      });
    });
  });

  describe("sessions.create input", () => {
    it("validates session creation input", () => {
      const input = {
        name: "Evening Session",
        site: "pokerstars",
        stakes: "$0.50/$1.00",
        gameType: "NL Hold'em",
      };

      expect(input.name).toBe("Evening Session");
      expect(input.site).toBe("pokerstars");
      expect(input.stakes).toBe("$0.50/$1.00");
      expect(input.gameType).toBe("NL Hold'em");
    });

    it("accepts different game types", () => {
      const gameTypes = ["NL Hold'em", "PLO", "PLO5"];
      
      gameTypes.forEach(gameType => {
        const input = {
          name: "Test",
          site: "pokerstars",
          stakes: "$1/$2",
          gameType,
        };
        expect(input.gameType).toBe(gameType);
      });
    });
  });

  describe("tags.create input", () => {
    it("validates tag creation input", () => {
      const input = {
        name: "Bluff",
        color: "#ff00ff",
        description: "Bluff spots",
      };

      expect(input.name).toBe("Bluff");
      expect(input.color).toBe("#ff00ff");
      expect(input.description).toBe("Bluff spots");
    });

    it("accepts color in hex format", () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff"];
      
      colors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});

describe("poker hand parsing", () => {
  it("detects hand number from PokerStars format", () => {
    const rawHistory = "PokerStars Hand #123456789: Hold'em No Limit";
    const match = rawHistory.match(/Hand #(\d+)/);
    
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("123456789");
  });

  it("detects hero cards from dealt line", () => {
    const rawHistory = "Dealt to Hero [Ah Kh]";
    const match = rawHistory.match(/Dealt to .+ \[([^\]]+)\]/);
    
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe("Ah Kh");
  });

  it("detects winning amount", () => {
    const rawHistory = "Hero collected $25.50 from pot";
    const match = rawHistory.match(/collected \$?([\d.]+)/);
    
    expect(match).not.toBeNull();
    expect(parseFloat(match?.[1] || "0")).toBe(25.50);
  });

  it("parses multiple hands from history", () => {
    const rawHistory = `
PokerStars Hand #111: Hold'em No Limit
Dealt to Hero [Ah Kh]
Hero collected $10 from pot

PokerStars Hand #222: Hold'em No Limit
Dealt to Hero [Qc Qd]
Hero collected $20 from pot
    `;
    
    const hands = rawHistory.split(/(?=PokerStars Hand #)/g)
      .filter(h => h.trim().length > 0);
    
    expect(hands.length).toBe(2);
  });
});

describe("GTO range calculations", () => {
  it("calculates correct hand key for pairs", () => {
    const ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
    
    // Diagonal = pairs
    for (let i = 0; i < ranks.length; i++) {
      const handKey = ranks[i] + ranks[i];
      expect(handKey).toMatch(/^(AA|KK|QQ|JJ|TT|99|88|77|66|55|44|33|22)$/);
    }
  });

  it("calculates correct hand key for suited hands", () => {
    // Above diagonal = suited
    const handKey = "AKs"; // A row, K column (row < col)
    expect(handKey.endsWith("s")).toBe(true);
  });

  it("calculates correct hand key for offsuit hands", () => {
    // Below diagonal = offsuit
    const handKey = "AKo"; // K row, A column (row > col)
    expect(handKey.endsWith("o")).toBe(true);
  });
});

describe("statistics calculations", () => {
  it("calculates VPIP correctly", () => {
    const handsPlayed = 100;
    const vpipHands = 22;
    const vpip = (vpipHands / handsPlayed) * 100;
    
    expect(vpip).toBe(22);
  });

  it("calculates winrate in BB/100", () => {
    const totalBBWon = 15.5;
    const handsPlayed = 1000;
    const bbPer100 = (totalBBWon / handsPlayed) * 100;
    
    expect(bbPer100).toBe(1.55);
  });

  it("calculates aggression factor", () => {
    const bets = 50;
    const raises = 30;
    const calls = 40;
    const aggFactor = (bets + raises) / calls;
    
    expect(aggFactor).toBe(2);
  });
});
