import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  subscriptionType: text("subscription_type").default("free").notNull(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  subscriptionStatus: text("subscription_status").default("inactive").notNull(),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  freeScansUsed: integer("free_scans_used").default(0).notNull(),
  freeScansLimit: integer("free_scans_limit").default(2).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const securityScans = pgTable("security_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  deviceInfo: jsonb("device_info").notNull(),
  browserInfo: jsonb("browser_info").notNull(),
  threats: jsonb("threats").notNull(),
  securityScore: integer("security_score").notNull(),
  scanDate: timestamp("scan_date").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").notNull(),
  type: text("type").notNull(), // 'extension', 'setting', 'network', 'malware'
  severity: text("severity").notNull(), // 'high', 'medium', 'low'
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

export const securitySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  notifications: jsonb("notifications").notNull(),
  autoScan: boolean("auto_scan").default(true).notNull(),
  alertLevel: text("alert_level").default("medium").notNull(),
});

export const userSuggestions = pgTable("user_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  username: text("username").notNull(),
  email: text("email"),
  suggestionText: text("suggestion_text").notNull(),
  category: text("category").default("general").notNull(),
  status: text("status").default("pending").notNull(), // 'pending', 'reviewed', 'implemented'
  priority: text("priority").default("medium").notNull(), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({
  id: true,
  scanDate: true,
});

export const insertThreatSchema = createInsertSchema(threats).omit({
  id: true,
  detectedAt: true,
});

export const insertSecuritySettingsSchema = createInsertSchema(securitySettings).omit({
  id: true,
});

export const insertUserSuggestionSchema = createInsertSchema(userSuggestions).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;
export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;
export type SecuritySettings = typeof securitySettings.$inferSelect;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
export type UserSuggestion = typeof userSuggestions.$inferSelect;
export type InsertUserSuggestion = z.infer<typeof insertUserSuggestionSchema>;
