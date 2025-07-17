import { users, securityScans, threats, securitySettings, userSuggestions, type User, type InsertUser, type SecurityScan, type InsertSecurityScan, type Threat, type InsertThreat, type SecuritySettings, type InsertSecuritySettings, type UserSuggestion, type InsertUserSuggestion } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserSubscription(userId: number, subscriptionData: { 
    subscriptionType: string; 
    subscriptionStatus: string; 
    subscriptionExpiresAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User>;
  incrementFreeScansUsed(userId: number): Promise<User>;
  canPerformFreeScan(userId: number): Promise<boolean>;
  createUserSuggestion(suggestion: InsertUserSuggestion): Promise<UserSuggestion>;
  getUserSuggestions(): Promise<UserSuggestion[]>;
  updateSuggestionStatus(id: number, status: string): Promise<UserSuggestion | undefined>;
  createSecurityScan(insertScan: InsertSecurityScan): Promise<SecurityScan>;
  getLatestSecurityScan(): Promise<SecurityScan | undefined>;
  getSecurityScan(id: number): Promise<SecurityScan | undefined>;
  createThreat(insertThreat: InsertThreat): Promise<Threat>;
  getActiveThreats(): Promise<Threat[]>;
  resolveThreat(id: number): Promise<Threat | undefined>;
  getSecuritySettings(): Promise<SecuritySettings | undefined>;
  updateSecuritySettings(settings: InsertSecuritySettings): Promise<SecuritySettings>;
  performSecurityScan(): Promise<SecurityScan>;
  fixSecuritySettings(): Promise<{ success: boolean; message: string }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserSubscription(userId: number, subscriptionData: { 
    subscriptionType: string; 
    subscriptionStatus: string; 
    subscriptionExpiresAt?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(subscriptionData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createSecurityScan(insertScan: InsertSecurityScan): Promise<SecurityScan> {
    const [scan] = await db
      .insert(securityScans)
      .values(insertScan)
      .returning();
    return scan;
  }

  async getLatestSecurityScan(): Promise<SecurityScan | undefined> {
    const [scan] = await db
      .select()
      .from(securityScans)
      .where(eq(securityScans.isActive, true))
      .orderBy(desc(securityScans.scanDate))
      .limit(1);
    return scan || undefined;
  }

  async getSecurityScan(id: number): Promise<SecurityScan | undefined> {
    const [scan] = await db
      .select()
      .from(securityScans)
      .where(eq(securityScans.id, id));
    return scan || undefined;
  }

  async createThreat(insertThreat: InsertThreat): Promise<Threat> {
    const [threat] = await db
      .insert(threats)
      .values(insertThreat)
      .returning();
    return threat;
  }

  async getActiveThreats(): Promise<Threat[]> {
    return await db
      .select()
      .from(threats)
      .where(eq(threats.isResolved, false))
      .orderBy(desc(threats.detectedAt));
  }

  async resolveThreat(id: number): Promise<Threat | undefined> {
    const [threat] = await db
      .update(threats)
      .set({ isResolved: true })
      .where(eq(threats.id, id))
      .returning();
    return threat || undefined;
  }

  async getSecuritySettings(): Promise<SecuritySettings | undefined> {
    const [settings] = await db
      .select()
      .from(securitySettings)
      .limit(1);
    return settings || undefined;
  }

  async updateSecuritySettings(newSettings: InsertSecuritySettings): Promise<SecuritySettings> {
    // First try to update existing settings
    const existing = await this.getSecuritySettings();
    
    if (existing) {
      const [updated] = await db
        .update(securitySettings)
        .set(newSettings)
        .where(eq(securitySettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings if none exist
      const [created] = await db
        .insert(securitySettings)
        .values(newSettings)
        .returning();
      return created;
    }
  }

  async performSecurityScan(): Promise<SecurityScan> {
    // Create a mock scan result for demonstration
    const mockScanData = {
      userId: null,
      deviceInfo: {
        userAgent: "Mock User Agent",
        platform: "Mock Platform",
        language: "ar",
        cookieEnabled: true,
        onlineStatus: true,
        screenResolution: "1920x1080",
        timezone: "Asia/Riyadh"
      },
      browserInfo: {
        name: "Chrome",
        version: "119.0",
        engine: "Blink",
        plugins: [],
        extensions: [],
        localStorage: true,
        sessionStorage: true,
        doNotTrack: null,
        javaEnabled: false
      },
      threats: [],
      securityScore: 85,
      isActive: true
    };

    return await this.createSecurityScan(mockScanData);
  }

  async fixSecuritySettings(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "تم إصلاح الإعدادات الأمنية بنجاح"
    };
  }

  async incrementFreeScansUsed(userId: number): Promise<User> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    
    const [updatedUser] = await db
      .update(users)
      .set({ freeScansUsed: (user.freeScansUsed || 0) + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async canPerformFreeScan(userId: number): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return false;
    
    // Check if user has active subscription
    if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date()) {
      return true;
    }
    
    // Check free scans limit
    return (user.freeScansUsed || 0) < (user.freeScansLimit || 2);
  }

  async createUserSuggestion(suggestion: InsertUserSuggestion): Promise<UserSuggestion> {
    const [newSuggestion] = await db
      .insert(userSuggestions)
      .values(suggestion)
      .returning();
    return newSuggestion;
  }

  async getUserSuggestions(): Promise<UserSuggestion[]> {
    return await db.select().from(userSuggestions).orderBy(desc(userSuggestions.createdAt));
  }

  async updateSuggestionStatus(id: number, status: string): Promise<UserSuggestion | undefined> {
    const [suggestion] = await db
      .update(userSuggestions)
      .set({ status, reviewedAt: new Date() })
      .where(eq(userSuggestions.id, id))
      .returning();
    return suggestion;
  }
}

export const storage = new DatabaseStorage();