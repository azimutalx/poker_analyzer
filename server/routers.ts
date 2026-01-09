import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { hands, sessions, userStats, positionStats, handTags, analysisReports, notifications, userCredits, subscriptionPlans, userSubscriptions } from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

// Helper function to parse poker hand history
function parsePokerHand(rawHand: string, site: string) {
  const result: any = {
    handNumber: null,
    heroCards: null,
    heroPosition: null,
    heroWon: 0,
    gameFormat: "cash" as "cash" | "tournament" | "sng" | "mtt",
    gameType: "NL Hold'em",
    tournamentId: null,
    tournamentName: null,
    tournamentBuyIn: null,
    stakes: null,
    tableName: null,
    boardCards: null,
    potSize: 0,
    preflopAction: null,
    players: [],
    actions: [],
  };

  // Extract hand number
  const handNumberMatch = rawHand.match(/Hand #(\d+)/);
  result.handNumber = handNumberMatch ? handNumberMatch[1] : `${Date.now()}-${Math.random()}`;

  // Detect game format (Tournament vs Cash)
  const tournamentMatch = rawHand.match(/Tournament #(\d+)/i);
  const sitAndGoMatch = rawHand.match(/Sit & Go|SNG|Sit and Go/i);
  const mttMatch = rawHand.match(/MTT|Multi-Table Tournament/i);
  
  if (tournamentMatch) {
    result.tournamentId = tournamentMatch[1];
    result.gameFormat = sitAndGoMatch ? "sng" : "mtt";
    
    // Extract tournament name
    const tournamentNameMatch = rawHand.match(/Tournament #\d+,\s*([^,\n]+)/i);
    if (tournamentNameMatch) {
      result.tournamentName = tournamentNameMatch[1].trim();
    }
    
    // Extract buy-in
    const buyInMatch = rawHand.match(/\$?([\d.]+)\+\$?([\d.]+)/);
    if (buyInMatch) {
      result.tournamentBuyIn = `$${buyInMatch[1]}+$${buyInMatch[2]}`;
    }
  } else if (rawHand.match(/\$[\d.]+\/\$[\d.]+/)) {
    result.gameFormat = "cash";
    const stakesMatch = rawHand.match(/\$([\d.]+)\/\$([\d.]+)/);
    if (stakesMatch) {
      result.stakes = `$${stakesMatch[1]}/$${stakesMatch[2]}`;
    }
  } else if (rawHand.match(/Tournament/i)) {
    result.gameFormat = "tournament";
    result.tournamentId = tournamentMatch ? tournamentMatch[1] : null;
  }

  // Extract game type
  if (rawHand.match(/Omaha/i)) {
    result.gameType = rawHand.match(/5 Card/i) ? "PLO5" : "PLO";
  } else if (rawHand.match(/Hold'em|Holdem/i)) {
    result.gameType = rawHand.match(/Pot Limit/i) ? "PL Hold'em" : "NL Hold'em";
  }

  // Extract table name
  const tableNameMatch = rawHand.match(/Table '([^']+)'/);
  if (tableNameMatch) {
    result.tableName = tableNameMatch[1];
  }

  // Extract hero cards
  const heroCardsMatch = rawHand.match(/Dealt to ([^\[]+)\[([^\]]+)\]/);
  if (heroCardsMatch) {
    const heroName = heroCardsMatch[1].trim();
    result.heroCards = heroCardsMatch[2].replace(/\s/g, '');
    
    // Determine hero position
    const positionPatterns = [
      { pattern: new RegExp(`${heroName}.*button`, 'i'), position: "BTN" },
      { pattern: new RegExp(`${heroName}.*small blind`, 'i'), position: "SB" },
      { pattern: new RegExp(`${heroName}.*big blind`, 'i'), position: "BB" },
      { pattern: new RegExp(`${heroName}.*cut.?off|${heroName}.*CO`, 'i'), position: "CO" },
      { pattern: new RegExp(`${heroName}.*middle|${heroName}.*MP`, 'i'), position: "MP" },
      { pattern: new RegExp(`${heroName}.*under|${heroName}.*UTG`, 'i'), position: "UTG" },
    ];

    for (const { pattern, position } of positionPatterns) {
      if (pattern.test(rawHand)) {
        result.heroPosition = position;
        break;
      }
    }
    
    // Fallback position detection based on seat order
    if (!result.heroPosition) {
      const buttonSeatMatch = rawHand.match(/Seat #?(\d+) is the button/i);
      const heroSeatMatch = rawHand.match(new RegExp(`Seat (\\d+): ${heroName}`, 'i'));
      
      if (buttonSeatMatch && heroSeatMatch) {
        const buttonSeat = parseInt(buttonSeatMatch[1]);
        const heroSeat = parseInt(heroSeatMatch[1]);
        
        if (heroSeat === buttonSeat) result.heroPosition = "BTN";
      }
    }
  }

  // Extract board cards
  const boardMatch = rawHand.match(/Board \[([^\]]+)\]/i);
  if (boardMatch) {
    result.boardCards = boardMatch[1].trim();
  } else {
    // Try to extract from FLOP/TURN/RIVER
    const flopMatch = rawHand.match(/\*\*\* FLOP \*\*\* \[([^\]]+)\]/);
    const turnMatch = rawHand.match(/\*\*\* TURN \*\*\* \[[^\]]+\] \[([^\]]+)\]/);
    const riverMatch = rawHand.match(/\*\*\* RIVER \*\*\* \[[^\]]+\] \[([^\]]+)\]/);
    
    let board = [];
    if (flopMatch) board.push(flopMatch[1]);
    if (turnMatch) board.push(turnMatch[1]);
    if (riverMatch) board.push(riverMatch[1]);
    
    if (board.length > 0) {
      result.boardCards = board.join(' ');
    }
  }

  // Extract pot size
  const potMatch = rawHand.match(/Total pot (?:\$|€)?([\d.]+)/i);
  if (potMatch) {
    result.potSize = parseFloat(potMatch[1]);
  }

  // Extract result
  const wonMatch = rawHand.match(/collected (?:\$|€)?([\d.]+)/i);
  if (wonMatch) {
    result.heroWon = parseFloat(wonMatch[1]);
  }

  // Extract preflop action
  if (rawHand.match(/raises|raised/i)) {
    result.preflopAction = rawHand.match(/3-bet|re-raise/i) ? "3bet" : "raise";
  } else if (rawHand.match(/calls|called/i)) {
    result.preflopAction = "call";
  } else if (rawHand.match(/folds|folded/i)) {
    result.preflopAction = "fold";
  }

  return result;
}

// Helper to check and update user credits
async function checkAndUpdateCredits(userId: number, creditType: 'hands' | 'analysis' | 'replays', amount: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get or create user credits
  let credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  
  if (credits.length === 0) {
    await db.insert(userCredits).values({ userId });
    credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  }

  const userCredit = credits[0];
  
  // Check subscription for unlimited access
  const subscription = await db.select()
    .from(userSubscriptions)
    .where(and(eq(userSubscriptions.userId, userId), eq(userSubscriptions.status, "active")))
    .limit(1);

  if (subscription.length > 0) {
    // User has active subscription, allow access
    return { allowed: true, remaining: -1, isSubscribed: true };
  }

  // Check free tier limits
  let used = 0;
  let limit = 0;

  switch (creditType) {
    case 'hands':
      used = userCredit.handsImported || 0;
      limit = userCredit.handsLimit || 50;
      break;
    case 'analysis':
      used = userCredit.analysisUsed || 0;
      limit = userCredit.analysisLimit || 1;
      break;
    case 'replays':
      used = userCredit.replaysUsed || 0;
      limit = userCredit.replaysLimit || 10;
      break;
  }

  if (used + amount > limit) {
    return { allowed: false, remaining: limit - used, isSubscribed: false };
  }

  // Update credits
  const updateField = creditType === 'hands' ? { handsImported: used + amount }
    : creditType === 'analysis' ? { analysisUsed: used + amount }
    : { replaysUsed: used + amount };

  await db.update(userCredits).set(updateField).where(eq(userCredits.userId, userId));

  return { allowed: true, remaining: limit - used - amount, isSubscribed: false };
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Credits router
  credits: router({
    getMyCredits: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      let credits = await db.select().from(userCredits).where(eq(userCredits.userId, ctx.user.id)).limit(1);
      
      if (credits.length === 0) {
        await db.insert(userCredits).values({ userId: ctx.user.id });
        credits = await db.select().from(userCredits).where(eq(userCredits.userId, ctx.user.id)).limit(1);
      }

      // Check subscription
      const subscription = await db.select()
        .from(userSubscriptions)
        .where(and(eq(userSubscriptions.userId, ctx.user.id), eq(userSubscriptions.status, "active")))
        .limit(1);

      return {
        ...credits[0],
        isSubscribed: subscription.length > 0,
        subscription: subscription[0] || null,
      };
    }),
  }),

  // Subscription router
  subscription: router({
    getPlans: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
      return plans;
    }),

    getMySubscription: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const subscription = await db.select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.user.id))
        .orderBy(desc(userSubscriptions.createdAt))
        .limit(1);

      return subscription[0] || null;
    }),
  }),

  // Hands router
  hands: router({
    // Import hands from raw history
    importHands: protectedProcedure
      .input(z.object({
        site: z.string(),
        rawHistory: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const userId = ctx.user.id;
        const { site, rawHistory } = input;

        // Parse hands from raw history
        const handMatches = rawHistory.split(/(?=PokerStars Hand #|888poker Hand #|Hand #|Winamax Poker)/g)
          .filter(h => h.trim().length > 0);

        // Check credits
        const creditCheck = await checkAndUpdateCredits(userId, 'hands', handMatches.length);
        if (!creditCheck.allowed) {
          throw new Error(`Limite de mãos atingido. Você pode importar mais ${creditCheck.remaining} mãos. Faça upgrade para continuar.`);
        }

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const rawHand of handMatches) {
          try {
            const parsed = parsePokerHand(rawHand, site);

            await db.insert(hands).values({
              odlId: `${site}-${parsed.handNumber}`,
              userId,
              site,
              gameType: parsed.gameType,
              gameFormat: parsed.gameFormat,
              tournamentId: parsed.tournamentId,
              tournamentName: parsed.tournamentName,
              tournamentBuyIn: parsed.tournamentBuyIn,
              stakes: parsed.stakes,
              tableName: parsed.tableName,
              handNumber: parsed.handNumber,
              heroCards: parsed.heroCards,
              heroPosition: parsed.heroPosition,
              boardCards: parsed.boardCards,
              potSize: parsed.potSize.toString(),
              heroWon: parsed.heroWon.toString(),
              preflopAction: parsed.preflopAction,
              rawHistory: rawHand,
              parsedData: JSON.stringify(parsed),
              playedAt: new Date(),
            });

            success++;
          } catch (err) {
            failed++;
            errors.push(`Erro ao processar mão: ${err}`);
          }
        }

        // Update user stats
        await updateUserStats(userId);

        return { 
          success, 
          failed, 
          errors,
          creditsRemaining: creditCheck.remaining,
          isSubscribed: creditCheck.isSubscribed,
        };
      }),

    // List hands with pagination and filters
    list: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        position: z.string().optional(),
        result: z.string().optional(),
        gameFormat: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { hands: [], totalPages: 0 };

        const userId = ctx.user.id;
        const { page, limit, position, gameFormat } = input;
        const offset = (page - 1) * limit;

        const conditions = [eq(hands.userId, userId)];
        
        if (position) {
          conditions.push(eq(hands.heroPosition, position as any));
        }
        
        if (gameFormat) {
          conditions.push(eq(hands.gameFormat, gameFormat as any));
        }

        const handsList = await db.select().from(hands).where(and(...conditions))
          .orderBy(desc(hands.playedAt))
          .limit(limit)
          .offset(offset);

        const countResult = await db.select({ count: sql<number>`count(*)` })
          .from(hands)
          .where(eq(hands.userId, userId));

        const totalCount = countResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
          hands: handsList.map(h => ({
            id: h.id,
            handNumber: h.handNumber || '',
            heroCards: h.heroCards || '',
            heroPosition: h.heroPosition || '',
            netResult: h.netResult || '0',
            potSize: h.potSize || '0',
            playedAt: h.playedAt?.toISOString() || '',
            boardCards: h.boardCards || '',
            gameFormat: h.gameFormat || 'cash',
            gameType: h.gameType || '',
            tournamentName: h.tournamentName || '',
            stakes: h.stakes || '',
            tags: [],
          })),
          totalPages,
        };
      }),

    // Get single hand by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;

        // Check replay credits
        const creditCheck = await checkAndUpdateCredits(ctx.user.id, 'replays');
        if (!creditCheck.allowed) {
          throw new Error(`Limite de replays atingido. Faça upgrade para continuar.`);
        }

        const result = await db.select()
          .from(hands)
          .where(and(eq(hands.id, input.id), eq(hands.userId, ctx.user.id)))
          .limit(1);

        return result[0] || null;
      }),
  }),

  // Stats router
  stats: router({
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select()
        .from(userStats)
        .where(eq(userStats.userId, ctx.user.id))
        .limit(1);

      if (result[0]) {
        return {
          totalHands: result[0].totalHands,
          totalSessions: result[0].totalSessions,
          totalProfit: result[0].totalProfit,
          vpip: result[0].vpip,
          pfr: result[0].pfr,
          threeBet: result[0].threeBet,
          foldToThreeBet: result[0].foldToThreeBet,
          wtsd: result[0].wtsd,
          wsd: result[0].wsd,
          aggFreq: result[0].aggFreq,
          bbPer100: result[0].bbPer100,
        };
      }

      return {
        totalHands: 0,
        totalSessions: 0,
        totalProfit: "0.00",
        vpip: "0.00",
        pfr: "0.00",
        threeBet: "0.00",
        foldToThreeBet: "0.00",
        wtsd: "0.00",
        wsd: "0.00",
        aggFreq: "0.00",
        bbPer100: "0.00",
      };
    }),

    getPositionStats: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select()
        .from(positionStats)
        .where(eq(positionStats.userId, ctx.user.id));

      return result;
    }),
  }),

  // Sessions router
  sessions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select()
        .from(sessions)
        .where(eq(sessions.userId, ctx.user.id))
        .orderBy(desc(sessions.startTime));

      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        site: z.string(),
        stakes: z.string(),
        gameType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(sessions).values({
          userId: ctx.user.id,
          name: input.name,
          site: input.site,
          stakes: input.stakes,
          gameType: input.gameType,
          startTime: new Date(),
        });

        return { success: true, id: result[0].insertId };
      }),
  }),

  // Analysis router
  analysis: router({
    generateReport: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Check analysis credits
      const creditCheck = await checkAndUpdateCredits(userId, 'analysis');
      if (!creditCheck.allowed) {
        throw new Error(`Limite de análises atingido. Faça upgrade para continuar.`);
      }

      // Get user's hands for analysis
      const userHands = await db.select()
        .from(hands)
        .where(eq(hands.userId, userId))
        .limit(1000);

      if (userHands.length < 10) {
        throw new Error("Você precisa de pelo menos 10 mãos para gerar uma análise");
      }

      // Prepare data for LLM analysis
      const handsSummary = userHands.map(h => ({
        position: h.heroPosition,
        cards: h.heroCards,
        result: h.netResult,
        preflopAction: h.preflopAction,
        wentToShowdown: h.wentToShowdown,
        gameFormat: h.gameFormat,
      }));

      // Call LLM for analysis
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um coach profissional de poker. Analise os dados de mãos do jogador e forneça:
1. Um resumo do estilo de jogo
2. Pontos fortes identificados
3. Leaks (vazamentos) e áreas de melhoria
4. Recomendações específicas de estudo
5. Um score GTO de 0-100

Responda em JSON com a estrutura:
{
  "summary": "texto do resumo",
  "strengths": [{"title": "", "score": 0-100, "description": ""}],
  "weaknesses": [{"title": "", "score": 0-100, "description": "", "priority": "high|medium|low"}],
  "recommendations": [{"title": "", "description": "", "priority": "high|medium|low", "resources": []}],
  "gtoScore": 0-100
}`
          },
          {
            role: "user",
            content: `Analise estas ${userHands.length} mãos de poker: ${JSON.stringify(handsSummary.slice(0, 100))}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "poker_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                strengths: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      score: { type: "number" },
                      description: { type: "string" }
                    },
                    required: ["title", "score", "description"],
                    additionalProperties: false
                  }
                },
                weaknesses: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      score: { type: "number" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["title", "score", "description", "priority"],
                    additionalProperties: false
                  }
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      resources: { type: "array", items: { type: "string" } }
                    },
                    required: ["title", "description", "priority", "resources"],
                    additionalProperties: false
                  }
                },
                gtoScore: { type: "number" }
              },
              required: ["summary", "strengths", "weaknesses", "recommendations", "gtoScore"],
              additionalProperties: false
            }
          }
        }
      });

      const analysisContent = response.choices[0]?.message?.content as string | undefined;
      if (!analysisContent) throw new Error("Failed to generate analysis");

      const analysis = JSON.parse(analysisContent);

      // Save report to database
      await db.insert(analysisReports).values({
        userId,
        reportType: "custom",
        handsAnalyzed: userHands.length,
        summary: analysis.summary,
        strengths: JSON.stringify(analysis.strengths),
        weaknesses: JSON.stringify(analysis.weaknesses),
        recommendations: JSON.stringify(analysis.recommendations),
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
      });

      return {
        ...analysis,
        creditsRemaining: creditCheck.remaining,
        isSubscribed: creditCheck.isSubscribed,
      };
    }),

    getLatestReport: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db.select()
        .from(analysisReports)
        .where(eq(analysisReports.userId, ctx.user.id))
        .orderBy(desc(analysisReports.createdAt))
        .limit(1);

      return result[0] || null;
    }),
  }),

  // Notifications router
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      return result;
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(notifications)
          .set({ isRead: true })
          .where(and(
            eq(notifications.id, input.id),
            eq(notifications.userId, ctx.user.id)
          ));

        return { success: true };
      }),
  }),

  // Data management router
  data: router({
    deleteAllData: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Delete all user data in correct order (respecting foreign keys)
      await db.delete(handTags).where(eq(handTags.userId, userId));
      await db.delete(analysisReports).where(eq(analysisReports.userId, userId));
      await db.delete(notifications).where(eq(notifications.userId, userId));
      await db.delete(positionStats).where(eq(positionStats.userId, userId));
      await db.delete(hands).where(eq(hands.userId, userId));
      await db.delete(sessions).where(eq(sessions.userId, userId));
      await db.delete(userStats).where(eq(userStats.userId, userId));
      
      // Reset user credits
      await db.update(userCredits)
        .set({ 
          handsImported: 0, 
          analysisUsed: 0, 
          replaysUsed: 0 
        })
        .where(eq(userCredits.userId, userId));

      return { success: true };
    }),
  }),

  // Tags router
  tags: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const result = await db.select()
        .from(handTags)
        .where(eq(handTags.userId, ctx.user.id));

      return result;
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        color: z.string().default("#ff00ff"),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(handTags).values({
          userId: ctx.user.id,
          name: input.name,
          color: input.color,
          description: input.description,
        });

        return { success: true };
      }),
  }),
});

// Helper function to update user stats
async function updateUserStats(userId: number) {
  const db = await getDb();
  if (!db) return;

  // Count total hands
  const handsCount = await db.select({ count: sql<number>`count(*)` })
    .from(hands)
    .where(eq(hands.userId, userId));

  const totalHands = handsCount[0]?.count || 0;

  // Count sessions
  const sessionsCount = await db.select({ count: sql<number>`count(*)` })
    .from(sessions)
    .where(eq(sessions.userId, userId));

  const totalSessions = sessionsCount[0]?.count || 0;

  // Calculate total profit
  const profitResult = await db.select({ total: sql<number>`COALESCE(SUM(netResult), 0)` })
    .from(hands)
    .where(eq(hands.userId, userId));

  const totalProfit = profitResult[0]?.total || 0;

  // Upsert user stats
  const existingStats = await db.select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (existingStats.length > 0) {
    await db.update(userStats)
      .set({
        totalHands,
        totalSessions,
        totalProfit: totalProfit.toString(),
      })
      .where(eq(userStats.userId, userId));
  } else {
    await db.insert(userStats).values({
      userId,
      totalHands,
      totalSessions,
      totalProfit: totalProfit.toString(),
    });
  }
}

export type AppRouter = typeof appRouter;
