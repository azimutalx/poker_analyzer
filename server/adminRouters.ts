import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { 
  users, 
  userSubscriptions, 
  subscriptionPlans,
  transactions,
  promotions,
  promotionUsage,
  announcements,
  adminLogs,
  platformMetrics,
  userCredits,
  hands,
  sessions as pokerSessions,
  analysisReports,
} from "../drizzle/schema";
import { eq, desc, and, sql, gte, lte, count } from "drizzle-orm";

// Middleware to check admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Helper to log admin actions
async function logAdminAction(
  adminId: number,
  action: string,
  targetType: string,
  targetId?: number,
  details?: any
) {
  const db = await getDb();
  if (!db) return;

  await db.insert(adminLogs).values({
    adminId,
    action,
    targetType,
    targetId,
    details: details ? JSON.stringify(details) : null,
  });
}

export const adminRouter = router({
  // Dashboard metrics
  getDashboardMetrics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

    // Total users
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Active subscriptions
    const activeSubsResult = await db.select({ count: sql<number>`count(*)` })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.status, "active"));
    const activeSubscriptions = activeSubsResult[0]?.count || 0;

    // Total revenue (completed transactions)
    const revenueResult = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(transactions)
      .where(eq(transactions.status, "completed"));
    const totalRevenue = revenueResult[0]?.total || 0;

    // MRR calculation (active subscriptions * plan price)
    const activeSubs = await db.select({
      planId: userSubscriptions.planId,
    }).from(userSubscriptions).where(eq(userSubscriptions.status, "active"));

    let mrr = 0;
    for (const sub of activeSubs) {
      const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub.planId)).limit(1);
      if (plan[0]) {
        mrr += parseFloat(plan[0].price);
      }
    }

    // New users this month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const newUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(gte(users.createdAt, firstDayOfMonth));
    const newUsersThisMonth = newUsersResult[0]?.count || 0;

    // Total hands imported
    const handsResult = await db.select({ count: sql<number>`count(*)` }).from(hands);
    const totalHands = handsResult[0]?.count || 0;

    // Churn rate (canceled this month / active at start of month)
    const canceledThisMonthResult = await db.select({ count: sql<number>`count(*)` })
      .from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.status, "canceled"),
        gte(userSubscriptions.updatedAt, firstDayOfMonth)
      ));
    const canceledThisMonth = canceledThisMonthResult[0]?.count || 0;
    const churnRate = activeSubscriptions > 0 ? (canceledThisMonth / activeSubscriptions * 100).toFixed(2) : "0.00";

    return {
      totalUsers,
      activeSubscriptions,
      totalRevenue: totalRevenue.toFixed(2),
      mrr: mrr.toFixed(2),
      newUsersThisMonth,
      totalHands,
      churnRate,
      conversionRate: totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(2) : "0.00",
    };
  }),

  // User management
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      role: z.enum(["all", "admin", "user"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { users: [], totalPages: 0 };

      const { page, limit, role } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (role !== "all") {
        conditions.push(eq(users.role, role));
      }

      const usersList = await db.select()
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get subscription info for each user
      const usersWithSubs = await Promise.all(usersList.map(async (user) => {
        const sub = await db.select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, user.id))
          .orderBy(desc(userSubscriptions.createdAt))
          .limit(1);

        const credits = await db.select()
          .from(userCredits)
          .where(eq(userCredits.userId, user.id))
          .limit(1);

        return {
          ...user,
          subscription: sub[0] || null,
          credits: credits[0] || null,
        };
      }));

      return {
        users: usersWithSubs,
        totalPages,
      };
    }),

  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await db.update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      await logAdminAction(ctx.user.id, "update_user_role", "user", input.userId, { newRole: input.role });

      return { success: true };
    }),

  // Subscription management
  getSubscriptions: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "active", "canceled", "expired"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { subscriptions: [], totalPages: 0 };

      const { page, limit, status } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (status !== "all") {
        conditions.push(eq(userSubscriptions.status, status));
      }

      const subsList = await db.select()
        .from(userSubscriptions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(userSubscriptions.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(userSubscriptions)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Enrich with user and plan data
      const enrichedSubs = await Promise.all(subsList.map(async (sub) => {
        const user = await db.select().from(users).where(eq(users.id, sub.userId)).limit(1);
        const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, sub.planId)).limit(1);

        return {
          ...sub,
          user: user[0] || null,
          plan: plan[0] || null,
        };
      }));

      return {
        subscriptions: enrichedSubs,
        totalPages,
      };
    }),

  cancelSubscription: adminProcedure
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await db.update(userSubscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(userSubscriptions.id, input.subscriptionId));

      await logAdminAction(ctx.user.id, "cancel_subscription", "subscription", input.subscriptionId);

      return { success: true };
    }),

  // Promotions management
  getPromotions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const promoList = await db.select().from(promotions).orderBy(desc(promotions.createdAt));
    return promoList;
  }),

  createPromotion: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(64),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      discountType: z.enum(["percentage", "fixed"]),
      discountValue: z.number(),
      maxUses: z.number().optional(),
      validFrom: z.date().optional(),
      validUntil: z.date().optional(),
      applicablePlans: z.array(z.number()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const result = await db.insert(promotions).values({
        code: input.code.toUpperCase(),
        name: input.name,
        description: input.description,
        discountType: input.discountType,
        discountValue: input.discountValue.toString(),
        maxUses: input.maxUses,
        validFrom: input.validFrom,
        validUntil: input.validUntil,
        applicablePlans: input.applicablePlans ? JSON.stringify(input.applicablePlans) : null,
        createdBy: ctx.user.id,
      });

      await logAdminAction(ctx.user.id, "create_promotion", "promotion", result[0].insertId, input);

      return { success: true, id: result[0].insertId };
    }),

  updatePromotion: adminProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      maxUses: z.number().optional(),
      validUntil: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const updateData: any = {};
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.maxUses !== undefined) updateData.maxUses = input.maxUses;
      if (input.validUntil !== undefined) updateData.validUntil = input.validUntil;

      await db.update(promotions)
        .set(updateData)
        .where(eq(promotions.id, input.id));

      await logAdminAction(ctx.user.id, "update_promotion", "promotion", input.id, updateData);

      return { success: true };
    }),

  deletePromotion: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await db.delete(promotions).where(eq(promotions.id, input.id));
      await logAdminAction(ctx.user.id, "delete_promotion", "promotion", input.id);

      return { success: true };
    }),

  // Announcements management
  getAnnouncements: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const announcementsList = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    return announcementsList;
  }),

  createAnnouncement: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      type: z.enum(["banner", "modal", "notification", "toast"]),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      targetAudience: z.enum(["all", "free", "subscribed", "admin"]).default("all"),
      displayLocation: z.string().optional(),
      imageUrl: z.string().optional(),
      ctaText: z.string().optional(),
      ctaUrl: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const result = await db.insert(announcements).values({
        ...input,
        createdBy: ctx.user.id,
      });

      await logAdminAction(ctx.user.id, "create_announcement", "announcement", result[0].insertId, input);

      return { success: true, id: result[0].insertId };
    }),

  updateAnnouncement: adminProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      title: z.string().optional(),
      content: z.string().optional(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const updateData: any = {};
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.title) updateData.title = input.title;
      if (input.content) updateData.content = input.content;
      if (input.endDate) updateData.endDate = input.endDate;

      await db.update(announcements)
        .set(updateData)
        .where(eq(announcements.id, input.id));

      await logAdminAction(ctx.user.id, "update_announcement", "announcement", input.id, updateData);

      return { success: true };
    }),

  deleteAnnouncement: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      await db.delete(announcements).where(eq(announcements.id, input.id));
      await logAdminAction(ctx.user.id, "delete_announcement", "announcement", input.id);

      return { success: true };
    }),

  // Transactions and payments
  getTransactions: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "completed", "failed", "refunded"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { transactions: [], totalPages: 0 };

      const { page, limit, status } = input;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (status !== "all") {
        conditions.push(eq(transactions.status, status));
      }

      const txList = await db.select()
        .from(transactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Enrich with user data
      const enrichedTx = await Promise.all(txList.map(async (tx) => {
        const user = await db.select().from(users).where(eq(users.id, tx.userId)).limit(1);
        return {
          ...tx,
          user: user[0] || null,
        };
      }));

      return {
        transactions: enrichedTx,
        totalPages,
      };
    }),

  // Admin activity logs
  getAdminLogs: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logs: [], totalPages: 0 };

      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const logsList = await db.select()
        .from(adminLogs)
        .orderBy(desc(adminLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` }).from(adminLogs);
      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Enrich with admin user data
      const enrichedLogs = await Promise.all(logsList.map(async (log) => {
        const admin = await db.select().from(users).where(eq(users.id, log.adminId)).limit(1);
        return {
          ...log,
          admin: admin[0] || null,
        };
      }));

      return {
        logs: enrichedLogs,
        totalPages,
      };
    }),
});
