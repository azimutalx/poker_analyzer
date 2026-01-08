import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { hands, sessions, userStats, positionStats, handTags, analysisReports, notifications } from "../drizzle/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

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

        // Parse hands from raw history (simplified parser)
        const handMatches = rawHistory.split(/(?=PokerStars Hand #|888poker Hand #|Hand #)/g)
          .filter(h => h.trim().length > 0);

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const rawHand of handMatches) {
          try {
            // Extract basic info (simplified parsing)
            const handNumberMatch = rawHand.match(/Hand #(\d+)/);
            const handNumber = handNumberMatch ? handNumberMatch[1] : `${Date.now()}-${Math.random()}`;

            // Extract hero cards
            const heroCardsMatch = rawHand.match(/Dealt to .+ \[([^\]]+)\]/);
            const heroCards = heroCardsMatch ? heroCardsMatch[1].replace(/\s/g, '') : null;

            // Determine position (simplified)
            let heroPosition: "BTN" | "CO" | "MP" | "UTG" | "BB" | "SB" | null = null;
            if (rawHand.includes("button")) heroPosition = "BTN";
            else if (rawHand.includes("small blind")) heroPosition = "SB";
            else if (rawHand.includes("big blind")) heroPosition = "BB";

            // Extract result
            const wonMatch = rawHand.match(/collected \$?([\d.]+)/);
            const heroWon = wonMatch ? parseFloat(wonMatch[1]) : 0;

            await db.insert(hands).values({
              odlId: `${site}-${handNumber}`,
              userId,
              site,
              gameType: "NL Hold'em",
              handNumber,
              heroCards,
              heroPosition,
              heroWon: heroWon.toString(),
              rawHistory: rawHand,
              parsedData: JSON.stringify({ raw: true }),
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

        return { success, failed, errors };
      }),

    // List hands with pagination and filters
    list: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
        position: z.string().optional(),
        result: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { hands: [], totalPages: 0 };

        const userId = ctx.user.id;
        const { page, limit, search, position, result } = input;
        const offset = (page - 1) * limit;

        const conditions = [eq(hands.userId, userId)];
        
        // Apply filters
        if (position) {
          conditions.push(eq(hands.heroPosition, position as any));
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

      return analysis;
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
