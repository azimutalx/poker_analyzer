import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, bigint, json, boolean } from "drizzle-orm/mysql-core";

// Core user table backing auth flow
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Poker sessions table
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }),
  site: varchar("site", { length: 64 }), // PokerStars, 888poker, etc.
  gameType: varchar("gameType", { length: 64 }), // NL Hold'em, PLO, etc.
  stakes: varchar("stakes", { length: 64 }), // $0.50/$1, $1/$2, etc.
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  handsPlayed: int("handsPlayed").default(0),
  netProfit: decimal("netProfit", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// Poker hands table
export const hands = mysqlTable("hands", {
  id: int("id").autoincrement().primaryKey(),
  odlId: varchar("odlId", { length: 64 }).unique(), // Original hand ID from poker site
  userId: int("userId").notNull(),
  sessionId: int("sessionId"),
  site: varchar("site", { length: 64 }).notNull(),
  gameType: varchar("gameType", { length: 64 }).notNull(),
  gameFormat: mysqlEnum("gameFormat", ["cash", "tournament", "sng", "mtt"]).default("cash"),
  tournamentId: varchar("tournamentId", { length: 64 }),
  tournamentName: varchar("tournamentName", { length: 255 }),
  tournamentBuyIn: varchar("tournamentBuyIn", { length: 64 }),
  stakes: varchar("stakes", { length: 64 }),
  tableName: varchar("tableName", { length: 255 }),
  
  // Hand details
  handNumber: varchar("handNumber", { length: 64 }),
  playedAt: timestamp("playedAt"),
  heroPosition: mysqlEnum("heroPosition", ["BTN", "CO", "MP", "UTG", "BB", "SB"]),
  heroCards: varchar("heroCards", { length: 10 }), // e.g., "AhKs"
  boardCards: varchar("boardCards", { length: 20 }), // e.g., "Ah Kd 7c 2s 9h"
  
  // Pot and results
  potSize: decimal("potSize", { precision: 12, scale: 2 }),
  heroWon: decimal("heroWon", { precision: 12, scale: 2 }),
  heroInvested: decimal("heroInvested", { precision: 12, scale: 2 }),
  netResult: decimal("netResult", { precision: 12, scale: 2 }),
  
  // Actions summary
  preflopAction: varchar("preflopAction", { length: 64 }), // fold, call, raise, 3bet, etc.
  flopAction: varchar("flopAction", { length: 64 }),
  turnAction: varchar("turnAction", { length: 64 }),
  riverAction: varchar("riverAction", { length: 64 }),
  wentToShowdown: boolean("wentToShowdown").default(false),
  wonAtShowdown: boolean("wonAtShowdown").default(false),
  
  // Full hand data
  rawHistory: text("rawHistory"), // Original hand history text
  parsedData: json("parsedData"), // Full parsed hand data as JSON
  
  // Analysis
  gtoScore: int("gtoScore"), // 0-100 adherence to GTO
  mistakes: json("mistakes"), // Array of identified mistakes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hand = typeof hands.$inferSelect;
export type InsertHand = typeof hands.$inferInsert;

// Hand tags table
export const handTags = mysqlTable("handTags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 7 }).default("#ff00ff"), // Hex color
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HandTag = typeof handTags.$inferSelect;
export type InsertHandTag = typeof handTags.$inferInsert;

// Hand-Tag relationship
export const handTagRelations = mysqlTable("handTagRelations", {
  id: int("id").autoincrement().primaryKey(),
  handId: int("handId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HandTagRelation = typeof handTagRelations.$inferSelect;
export type InsertHandTagRelation = typeof handTagRelations.$inferInsert;

// User statistics (aggregated)
export const userStats = mysqlTable("userStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Overall stats
  totalHands: int("totalHands").default(0),
  totalSessions: int("totalSessions").default(0),
  totalProfit: decimal("totalProfit", { precision: 12, scale: 2 }).default("0"),
  
  // Key metrics
  vpip: decimal("vpip", { precision: 5, scale: 2 }).default("0"), // Voluntarily Put In Pot %
  pfr: decimal("pfr", { precision: 5, scale: 2 }).default("0"), // Pre-Flop Raise %
  threeBet: decimal("threeBet", { precision: 5, scale: 2 }).default("0"), // 3-bet %
  foldToThreeBet: decimal("foldToThreeBet", { precision: 5, scale: 2 }).default("0"),
  cbet: decimal("cbet", { precision: 5, scale: 2 }).default("0"), // Continuation bet %
  foldToCbet: decimal("foldToCbet", { precision: 5, scale: 2 }).default("0"),
  wtsd: decimal("wtsd", { precision: 5, scale: 2 }).default("0"), // Went To Showdown %
  wsd: decimal("wsd", { precision: 5, scale: 2 }).default("0"), // Won $ at Showdown %
  aggFreq: decimal("aggFreq", { precision: 5, scale: 2 }).default("0"), // Aggression Frequency
  aggFactor: decimal("aggFactor", { precision: 5, scale: 2 }).default("0"), // Aggression Factor
  
  // Winrate
  bbPer100: decimal("bbPer100", { precision: 8, scale: 2 }).default("0"), // BB/100 hands
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

// Position-specific statistics
export const positionStats = mysqlTable("positionStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  position: mysqlEnum("position", ["BTN", "CO", "MP", "UTG", "BB", "SB"]).notNull(),
  
  handsPlayed: int("handsPlayed").default(0),
  vpip: decimal("vpip", { precision: 5, scale: 2 }).default("0"),
  pfr: decimal("pfr", { precision: 5, scale: 2 }).default("0"),
  threeBet: decimal("threeBet", { precision: 5, scale: 2 }).default("0"),
  foldToThreeBet: decimal("foldToThreeBet", { precision: 5, scale: 2 }).default("0"),
  winrate: decimal("winrate", { precision: 8, scale: 2 }).default("0"),
  netProfit: decimal("netProfit", { precision: 12, scale: 2 }).default("0"),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PositionStats = typeof positionStats.$inferSelect;
export type InsertPositionStats = typeof positionStats.$inferInsert;

// Opponent profiles
export const opponents = mysqlTable("opponents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  playerName: varchar("playerName", { length: 255 }).notNull(),
  site: varchar("site", { length: 64 }),
  
  handsPlayed: int("handsPlayed").default(0),
  vpip: decimal("vpip", { precision: 5, scale: 2 }).default("0"),
  pfr: decimal("pfr", { precision: 5, scale: 2 }).default("0"),
  threeBet: decimal("threeBet", { precision: 5, scale: 2 }).default("0"),
  aggFreq: decimal("aggFreq", { precision: 5, scale: 2 }).default("0"),
  
  playerType: varchar("playerType", { length: 64 }), // TAG, LAG, NIT, Fish, etc.
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opponent = typeof opponents.$inferSelect;
export type InsertOpponent = typeof opponents.$inferInsert;

// Analysis reports (LLM generated)
export const analysisReports = mysqlTable("analysisReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  reportType: varchar("reportType", { length: 64 }).notNull(), // weekly, monthly, custom
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  
  handsAnalyzed: int("handsAnalyzed").default(0),
  
  // LLM analysis
  summary: text("summary"),
  strengths: json("strengths"), // Array of identified strengths
  weaknesses: json("weaknesses"), // Array of identified weaknesses (leaks)
  recommendations: json("recommendations"), // Array of study recommendations
  
  // Backup info
  s3BackupUrl: varchar("s3BackupUrl", { length: 512 }),
  pdfReportUrl: varchar("pdfReportUrl", { length: 512 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisReport = typeof analysisReports.$inferSelect;
export type InsertAnalysisReport = typeof analysisReports.$inferInsert;

// User notifications
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: varchar("type", { length: 64 }).notNull(), // milestone, improvement, leak, achievement
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  
  isRead: boolean("isRead").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// GTO Ranges (preloaded reference data)
export const gtoRanges = mysqlTable("gtoRanges", {
  id: int("id").autoincrement().primaryKey(),
  
  position: mysqlEnum("position", ["BTN", "CO", "MP", "UTG", "BB", "SB"]).notNull(),
  situation: varchar("situation", { length: 64 }).notNull(), // RFI, vs3bet, 3bet, etc.
  
  // Range data as JSON matrix
  rangeData: json("rangeData").notNull(), // 13x13 matrix with frequencies
  
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GtoRange = typeof gtoRanges.$inferSelect;
export type InsertGtoRange = typeof gtoRanges.$inferInsert;


// Subscription plans
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  interval: mysqlEnum("interval", ["month", "year"]).default("month"),
  
  // Features
  handsPerMonth: int("handsPerMonth").default(100), // -1 for unlimited
  analysisPerMonth: int("analysisPerMonth").default(1), // AI analysis reports
  replayAccess: boolean("replayAccess").default(true),
  gtoRangesAccess: boolean("gtoRangesAccess").default(false),
  exportAccess: boolean("exportAccess").default(false),
  prioritySupport: boolean("prioritySupport").default(false),
  
  description: text("description"),
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

// User subscriptions
export const userSubscriptions = mysqlTable("userSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  
  status: mysqlEnum("status", ["active", "canceled", "expired", "trial"]).default("trial"),
  
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  
  // Stripe integration
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// User credits
export const userCredits = mysqlTable("userCredits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Current credits
  handsImported: int("handsImported").default(0),
  handsLimit: int("handsLimit").default(50), // Free tier limit
  analysisUsed: int("analysisUsed").default(0),
  analysisLimit: int("analysisLimit").default(1), // Free tier limit
  replaysUsed: int("replaysUsed").default(0),
  replaysLimit: int("replaysLimit").default(10), // Free tier limit
  
  // Reset tracking
  lastResetAt: timestamp("lastResetAt").defaultNow().notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = typeof userCredits.$inferInsert;

// Promotions and coupons table
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0),
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true),
  applicablePlans: json("applicablePlans"), // Array of plan IDs
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

// Promotion usage tracking
export const promotionUsage = mysqlTable("promotionUsage", {
  id: int("id").autoincrement().primaryKey(),
  promotionId: int("promotionId").notNull(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  discountApplied: decimal("discountApplied", { precision: 10, scale: 2 }),
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type PromotionUsage = typeof promotionUsage.$inferSelect;
export type InsertPromotionUsage = typeof promotionUsage.$inferInsert;

// Announcements and banners table
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["banner", "modal", "notification", "toast"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  targetAudience: mysqlEnum("targetAudience", ["all", "free", "subscribed", "admin"]).default("all"),
  displayLocation: varchar("displayLocation", { length: 64 }), // dashboard, pricing, etc.
  imageUrl: varchar("imageUrl", { length: 512 }),
  ctaText: varchar("ctaText", { length: 64 }),
  ctaUrl: varchar("ctaUrl", { length: 512 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

// Payment transactions table
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  paymentProvider: varchar("paymentProvider", { length: 64 }), // stripe, paypal, etc.
  transactionId: varchar("transactionId", { length: 255 }).unique(),
  metadata: json("metadata"),
  promotionId: int("promotionId"),
  discountApplied: decimal("discountApplied", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Admin activity logs
export const adminLogs = mysqlTable("adminLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("targetType", { length: 64 }), // user, subscription, promotion, etc.
  targetId: int("targetId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

// Platform metrics (for admin dashboard)
export const platformMetrics = mysqlTable("platformMetrics", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  totalUsers: int("totalUsers").default(0),
  activeUsers: int("activeUsers").default(0),
  newUsers: int("newUsers").default(0),
  totalSubscriptions: int("totalSubscriptions").default(0),
  activeSubscriptions: int("activeSubscriptions").default(0),
  newSubscriptions: int("newSubscriptions").default(0),
  canceledSubscriptions: int("canceledSubscriptions").default(0),
  mrr: decimal("mrr", { precision: 12, scale: 2 }).default("0"), // Monthly Recurring Revenue
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  handsImported: int("handsImported").default(0),
  analysisGenerated: int("analysisGenerated").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlatformMetric = typeof platformMetrics.$inferSelect;
export type InsertPlatformMetric = typeof platformMetrics.$inferInsert;
