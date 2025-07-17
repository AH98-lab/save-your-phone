import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSecurityScanSchema, insertThreatSchema, insertSecuritySettingsSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Security scan endpoints
  app.post("/api/security-scan", async (req, res) => {
    try {
      const validatedData = insertSecurityScanSchema.parse(req.body);
      const scan = await storage.createSecurityScan(validatedData);
      res.json(scan);
    } catch (error) {
      res.status(400).json({ error: "Invalid scan data" });
    }
  });

  app.get("/api/security-scan/latest", async (req, res) => {
    try {
      const scan = await storage.getLatestSecurityScan();
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest scan" });
    }
  });

  app.get("/api/security-scan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scan = await storage.getSecurityScan(id);
      if (!scan) {
        return res.status(404).json({ error: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan" });
    }
  });

  // Threats endpoints
  app.post("/api/threats", async (req, res) => {
    try {
      const validatedData = insertThreatSchema.parse(req.body);
      const threat = await storage.createThreat(validatedData);
      res.json(threat);
    } catch (error) {
      res.status(400).json({ error: "Invalid threat data" });
    }
  });

  app.get("/api/threats", async (req, res) => {
    try {
      const threats = await storage.getActiveThreats();
      res.json(threats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threats" });
    }
  });

  app.patch("/api/threats/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const threat = await storage.resolveThreat(id);
      if (!threat) {
        return res.status(404).json({ error: "Threat not found" });
      }
      res.json(threat);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve threat" });
    }
  });

  // Security settings endpoints
  app.get("/api/security-settings", async (req, res) => {
    try {
      const settings = await storage.getSecuritySettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/security-settings", async (req, res) => {
    try {
      const validatedData = insertSecuritySettingsSchema.parse(req.body);
      const settings = await storage.updateSecuritySettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Check if user can perform free scan
  app.get("/api/check-free-scan/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const canScan = await storage.canPerformFreeScan(userId);
      const user = await storage.getUser(userId);
      
      res.json({ 
        canPerformFreeScan: canScan,
        freeScansUsed: user?.freeScansUsed || 0,
        freeScansLimit: user?.freeScansLimit || 2,
        subscriptionStatus: user?.subscriptionStatus
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking scan eligibility: " + error.message });
    }
  });

  // Security actions endpoints with free trial logic
  app.post("/api/security-actions/scan", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (userId) {
        const canScan = await storage.canPerformFreeScan(userId);
        if (!canScan) {
          return res.status(403).json({ 
            message: "تم استنفاد التجارب المجانية. يرجى الاشتراك للمتابعة",
            requiresSubscription: true 
          });
        }
        
        // Increment free scans used
        await storage.incrementFreeScansUsed(userId);
      }
      
      const scanResult = await storage.performSecurityScan();
      res.json(scanResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to perform scan" });
    }
  });

  app.post("/api/security-actions/fix-settings", async (req, res) => {
    try {
      const result = await storage.fixSecuritySettings();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fix settings" });
    }
  });

  // User suggestions endpoints
  app.post("/api/suggestions", async (req, res) => {
    try {
      const suggestion = await storage.createUserSuggestion(req.body);
      res.json(suggestion);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating suggestion: " + error.message });
    }
  });

  app.get("/api/suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getUserSuggestions();
      res.json(suggestions);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching suggestions: " + error.message });
    }
  });

  // Create Stripe payment intent for one-time payments
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe not configured. Please add STRIPE_SECRET_KEY environment variable." 
      });
    }

    try {
      const amount = 7; // $7 monthly subscription (reduced from $20)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          app: "احفظ هاتفك",
          type: "subscription"
        }
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create Stripe subscription
  app.post("/api/create-subscription", async (req, res) => {
    if (!stripe) {
      return res.status(400).json({ 
        error: "Stripe not configured. Please add STRIPE_SECRET_KEY environment variable." 
      });
    }

    try {
      const { email, userId } = req.body;
      
      // Create or retrieve customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId?.toString() || "1",
          app: "احفظ هاتفك"
        }
      });

      // Create subscription with support for multiple currencies
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd', // Primary currency for international payments
            product_data: {
              name: 'احفظ هاتفك - Premium Plan',
              description: 'Advanced security protection with real-time monitoring'
            },
            unit_amount: 1999, // $19.99
            recurring: {
              interval: 'month'
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          region: 'international',
          supported_countries: 'worldwide_except_restricted'
        }
      });

      // Update user in database
      const subscriptionData = {
        subscriptionType: "premium",
        subscriptionStatus: "active",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
      };

      const updatedUser = await storage.updateUserSubscription(userId || 1, subscriptionData);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        customer: customer.id,
        user: updatedUser
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription: " + error.message });
    }
  });

  // Legacy subscription route for demo compatibility
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { userId, subscriptionType, email } = req.body;
      
      if (stripe) {
        // If Stripe is configured, redirect to real subscription
        return res.json({
          redirectToStripe: true,
          message: "Use /api/create-subscription for real Stripe integration"
        });
      }
      
      // Demo mode fallback
      const subscriptionData = {
        subscriptionType: subscriptionType || "premium",
        subscriptionStatus: "active",
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: `demo_cus_${Math.random().toString(36).substring(7)}`,
        stripeSubscriptionId: `demo_sub_${Math.random().toString(36).substring(7)}`,
      };

      const updatedUser = await storage.updateUserSubscription(userId || 1, subscriptionData);
      
      res.json({
        success: true,
        user: updatedUser,
        message: "Demo subscription created (Stripe not configured)",
        isDemo: true
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get("/api/subscription-status/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isActive: user.subscriptionStatus === "active" && 
                 user.subscriptionExpiresAt && 
                 new Date(user.subscriptionExpiresAt) > new Date()
      });
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
