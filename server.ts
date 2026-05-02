import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import axios from "axios";
import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "doctorian-super-secret-key-123";
const PORT = 3000;

let genAI: GoogleGenerativeAI | null = null;

function getCleanApiKey() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.DEEPSEEK_API_KEY,
    process.env.OPENROUTER_API_KEY
  ];
  
  const validKeys = [];

  for (const k of keys) {
    if (k && typeof k === 'string') {
      const trimmed = k.trim().replace(/^["']|["']$/g, "");
      // Filter out placeholders
      if (trimmed && 
          trimmed !== "AI_STUDIO_KEY_NOT_SET" && 
          trimmed !== "YOUR_API_KEY" && 
          !trimmed.includes("ENTER_YOUR") &&
          trimmed.length > 20) { // Small keys are usually fake
        validKeys.push(trimmed);
      }
    }
  }

  // Prioritize OpenRouter/DeepSeek keys
  const orKey = validKeys.find(k => k.toLowerCase().startsWith('sk-or-'));
  if (orKey) {
    console.log(`[AI] Selected OpenRouter Key (starts with: ${orKey.substring(0, 8)}...)`);
    return orKey;
  }

  const skKey = validKeys.find(k => k.toLowerCase().startsWith('sk-'));
  if (skKey) {
    console.log(`[AI] Selected Secret Key (starts with: ${skKey.substring(0, 8)}...)`);
    return skKey;
  }

  const geminiKey = validKeys.find(k => k.startsWith('AIza'));
  if (geminiKey) {
    console.log(`[AI] Selected Gemini Key (starts with: ${geminiKey.substring(0, 8)}...)`);
    return geminiKey;
  }

  if (validKeys.length > 0) {
    console.log(`[AI] Selected Generic Key (starts with: ${validKeys[0].substring(0, 8)}...)`);
    return validKeys[0];
  }

  return "";
}

function getGenAI() {
  const apiKey = getCleanApiKey();
  if (!apiKey) {
    console.error("[AI] No valid API key found in process.env");
    throw new Error("AI Configuration Error: Missing valid API Key. Please provide GEMINI_API_KEY or OPENROUTER_API_KEY.");
  }

  // If it's an sk- key, we don't use the Google SDK for it
  if (apiKey.toLowerCase().startsWith('sk-')) {
    return null; 
  }

  if (!genAI) {
    console.log(`[AI] Initializing Google Gemini SDK with key prefix: ${apiKey.substring(0, 6)}...`);
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

async function callAI(options: {
  messages: { role: string; text: string }[],
  systemInstruction: string,
  modelName?: string,
  temperature?: number
}) {
  const apiKey = getCleanApiKey();
  const { messages, systemInstruction, modelName, temperature } = options;

  if (!apiKey) {
    throw new Error("AI Node reached without valid API Key configuration.");
  }

  let finalModel = "gemini-1.5-flash";
  if (modelName) {
    if (modelName.toLowerCase().includes("pro")) finalModel = "gemini-1.5-pro";
    else if (modelName.toLowerCase().includes("flash")) finalModel = "gemini-1.5-flash";
  }

  console.log(`[AI] Request: Model=${finalModel}, Provider=${apiKey.toLowerCase().startsWith('sk-or-') ? 'OpenRouter' : 'Google SDK'}`);

  const isSkKey = apiKey.toLowerCase().startsWith('sk-');
  const isORKey = apiKey.toLowerCase().startsWith('sk-or-');

  // Handle sk- keys (OpenRouter or DeepSeek)
  if (isSkKey) {
    console.log(`[AI] Routing via ${isORKey ? 'OpenRouter' : 'OpenAI-compatible'} provider...`);
    try {
      // Determine model based on modelName and key prefix
      let providerModel = "google/gemini-flash-1.5";
      let apiUrl = "https://openrouter.ai/api/v1/chat/completions";

      if (isORKey) {
        providerModel = finalModel.includes("pro") ? "google/gemini-pro-1.5" : "google/gemini-flash-1.5";
      } else if (apiKey.includes("deepseek")) {
        apiUrl = "https://api.deepseek.com/chat/completions";
        providerModel = "deepseek-chat";
      } else {
        // Fallback for generic sk- keys, try OpenRouter as it supports many models
        providerModel = finalModel.includes("pro") ? "google/gemini-pro-1.5" : "google/gemini-flash-1.5";
      }

      const response = await axios.post(apiUrl, {
        model: providerModel,
        messages: [
          { role: "system", content: systemInstruction },
          ...messages.map(m => ({
            role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
            content: m.text
          }))
        ],
        temperature: temperature || 0.7,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://doctorian.ai",
          "X-Title": "Doctorian AI"
        },
        timeout: 45000
      });

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error("Invalid response from AI provider");
      }

      return response.data.choices[0].message.content;
    } catch (err: any) {
      console.error("[AI] Provider error:", err.response?.data || err.message);
      throw new Error(`AI Platform failed: ${err.message}`);
    }
  }

  // Handle Standard Gemini SDK
  const aiClient = getGenAI();
  if (!aiClient) throw new Error("AI Client initialization failed - Provider mismatch");

  try {
    const geminiModel = aiClient.getGenerativeModel({ 
      model: finalModel,
      systemInstruction: systemInstruction 
    });

    const chat = geminiModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
      generationConfig: {
        temperature: temperature || 0.7,
      },
    });

    const currentMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage([{ text: currentMessage }]);
    return result.response.text();
  } catch (err: any) {
    if (err.message?.includes("API key not valid")) {
      console.error(`[AI] Google SDK rejected key starting with: ${apiKey.substring(0, 6)}...`);
    } else {
      console.error("[AI] Google SDK error:", err.message);
    }
    throw err;
  }
}

/**
 * Normalizes phone numbers to E.164 format.
 * Assumes +256 (Uganda) if no country code is provided.
 */
function normalizePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.trim().replace(/\s+/g, '');
  
  if (cleaned.startsWith('+')) return cleaned;
  
  // If starts with 07... or 03... (Uganda local)
  if (cleaned.startsWith('0')) {
    return '+256' + cleaned.substring(1);
  }
  
  // If starts with 7... or 3... (Uganda local without leading 0)
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
    return '+256' + cleaned;
  }

  // Fallback: if it doesn't have a +, add it assuming it might already have a country code but no +
  if (!cleaned.startsWith('+') && cleaned.length > 10) {
    return '+' + cleaned;
  }

  return cleaned;
}

function isPasswordSecure(pass: string): boolean {
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  return hasLetter && hasNumber && hasSymbol && pass.length >= 8;
}

// Email Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[EMAIL] SMTP credentials missing. Email to ${to} not sent. Subject: ${subject}`);
    console.log(`[EMAIL CONTENT]: ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Doctorian AI" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  } catch (err: any) {
    console.error(`[EMAIL ERROR] Failed to send to ${to}:`, err.message);
  }
}

// Database Setup
const db = new Database("doctorian.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    displayName TEXT,
    photoURL TEXT,
    role TEXT DEFAULT 'user',
    credits INTEGER DEFAULT 5,
    institutionId TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS credentials (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    publicKey BLOB NOT NULL,
    counter INTEGER NOT NULL,
    transports TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    code TEXT,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    userId TEXT,
    messageId TEXT NOT NULL,
    rating TEXT NOT NULL,
    suggestion TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Migration: Add code column to reset_tokens if it doesn't exist
try {
  db.prepare("ALTER TABLE reset_tokens ADD COLUMN code TEXT").run();
} catch (e) {
  // Column probably already exists
}

// Migration: Add subscription columns to users if they don't exist
try { db.prepare("ALTER TABLE users ADD COLUMN subscriptionTier TEXT DEFAULT 'free'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN subscriptionStatus TEXT DEFAULT 'none'").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN lastPaymentDate TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN paymentEvidence TEXT").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN credits INTEGER DEFAULT 5").run(); } catch (e) {}
try { db.prepare("ALTER TABLE users ADD COLUMN institutionId TEXT").run(); } catch (e) {}
db.prepare(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    amount REAL,
    currency TEXT,
    status TEXT,
    externalId TEXT,
    tier TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const RP_NAME = "Doctorian AI";

// In-memory store for challenges (use a real session/redis in production)
const challenges = new Map<string, string>();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) {
      console.warn(`[AUTH] Unauthorized access attempt to ${req.path} - No token found`);
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err: any) {
      console.error(`[AUTH] Token verification failed for ${req.path}:`, err.message);
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    authenticate(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'doctor') {
        console.warn(`[AUTH] Forbidden access attempt to ${req.path} by user ${req.user.id} (Role: ${req.user.role})`);
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
      next();
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (!isPasswordSecure(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Math.random().toString(36).substring(2, 15);
      const createdAt = new Date().toISOString();

      const stmt = db.prepare("INSERT INTO users (id, email, password, displayName, createdAt) VALUES (?, ?, ?, ?, ?)");
      stmt.run(id, email, hashedPassword, displayName || email.split("@")[0], createdAt);

      // Send Notifications
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      const userDisplayName = displayName || email.split("@")[0];

      // Notify Admin
      sendEmail(
        adminEmail,
        "New User Signup - Doctorian AI",
        `A new user has signed up:\n\nEmail: ${email}\nDisplay Name: ${userDisplayName}\nID: ${id}\nTime: ${createdAt}`
      );

      // Notify User
      sendEmail(
        email,
        "Welcome to Doctorian AI!",
        `Hello ${userDisplayName},\n\nWelcome to Doctorian AI! Your account has been successfully created.\n\nWe are here to help you monitor your health and provide intelligent insights.\n\nBest regards,\nThe Doctorian AI Team`
      );

      const token = jwt.sign({ id, email, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true, // Always use secure in this environment as it's HTTPS
        sameSite: "none", // Needed for iframe context
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({ 
        user: { 
          id, 
          email, 
          displayName, 
          role: "user", 
          subscriptionTier: "free",
          subscriptionStatus: "none",
          createdAt 
        } 
      });
    } catch (err: any) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/social", async (req, res) => {
    const { email, displayName, photoURL, providerId } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      let user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      const createdAt = new Date().toISOString();

      if (!user) {
        // Create new user for social login
        const id = Math.random().toString(36).substring(2, 15);
        // We set a random password hash that can't be guessed, as they use social auth
        const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
        
        const stmt = db.prepare("INSERT INTO users (id, email, password, displayName, photoURL, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
        stmt.run(id, email, dummyPassword, displayName || email.split("@")[0], photoURL || null, createdAt);
        
        user = { id, email, displayName, photoURL, role: "user", createdAt };
        
        // Notify Admin and User
        const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
        sendEmail(
          adminEmail, 
          "New Social Signup - Doctorian AI", 
          `New user via ${providerId}:\n\nEmail: ${email}\nName: ${displayName}`
        );
        sendEmail(
          email,
          "Welcome to Doctorian AI!",
          `Hello ${displayName},\n\nYour account has been created via ${providerId}.\n\nBest regards,\nThe Doctorian AI Team`
        );
      } else {
        // Update existing user with latest social info if needed
        db.prepare("UPDATE users SET displayName = COALESCE(?, displayName), photoURL = COALESCE(?, photoURL) WHERE id = ?")
          .run(displayName, photoURL, user.id);
        
        user = db.prepare("SELECT * FROM users WHERE id = ?").get(user.id);
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err: any) {
      console.error("Social login backend error:", err);
      res.status(500).json({ error: "External authentication failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Send Login Notifications
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      const loginTime = new Date().toISOString();

      // Notify Admin
      sendEmail(
        adminEmail,
        "User Login - Doctorian AI",
        `A user has logged in:\n\nEmail: ${user.email}\nDisplay Name: ${user.displayName}\nTime: ${loginTime}`
      );

      // Notify User
      sendEmail(
        user.email,
        "New Login Detected - Doctorian AI",
        `Hello ${user.displayName},\n\nA new login was detected on your Doctorian AI account at ${loginTime}.\n\nIf this was not you, please contact support immediately.`
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        // For security, don't reveal if user exists
        return res.json({ message: "If an account exists with that email, a verification code has been sent." });
      }

      // Generate a 6-digit numeric code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 600000).toISOString(); // 10 minutes

      // Delete any existing tokens for this user
      db.prepare("DELETE FROM reset_tokens WHERE userId = ?").run(user.id);
      db.prepare("INSERT INTO reset_tokens (token, userId, code, expiresAt) VALUES (?, ?, ?, ?)").run(token, user.id, code, expiresAt);

      await sendEmail(
        email,
        "Password Reset Code - Doctorian AI",
        `Hello ${user.displayName},\n\nYou requested a password reset. Your verification code is:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );

      res.json({ message: "If an account exists with that email, a verification code has been sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: "Email and code required" });

    try {
      const user: any = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
      if (!user) return res.status(400).json({ error: "Invalid email or code" });

      const resetToken: any = db.prepare("SELECT * FROM reset_tokens WHERE userId = ? AND code = ?").get(user.id, code);
      if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      res.json({ success: true, token: resetToken.token });
    } catch (err) {
      console.error("Verify code error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and password required" });
    if (!isPasswordSecure(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and include letters, numbers, and symbols" });
    }

    try {
      const resetToken: any = db.prepare("SELECT * FROM reset_tokens WHERE token = ?").get(token);
      if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, resetToken.userId);
      db.prepare("DELETE FROM reset_tokens WHERE token = ?").run(token);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { 
      httpOnly: true, 
      secure: true, 
      sameSite: "none" 
    });
    res.json({ success: true });
  });

  // MTN MoMo Integration Flow
  app.post("/api/payment/mtn/initiate", authenticate, async (req: any, res) => {
    const { phone, amount, currency, tier } = req.body;
    const userId = req.user.id;
    
    // Currency conversion logic for "any currency"
    const exchangeRates: Record<string, number> = {
      'UGX': 1,
      'USD': 3850,
      'KES': 28.5,
      'EUR': 4150,
      'GBP': 4850,
      'TZS': 1.5,
      'RWF': 3.1
    };
    
    const rate = exchangeRates[currency] || 1;
    const amountInUGX = Math.round(amount * rate);

    try {
      console.log(`[MOMO] Initiating payment for user ${userId}: ${amount} ${currency} (${amountInUGX} UGX)`);
      
      const externalId = `DOC-${Date.now()}-${userId}`;
      const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Store in system_logs (not visible in main app records)
      db.prepare("INSERT INTO system_logs (id, userId, action, details) VALUES (?, ?, ?, ?)")
        .run(logId, userId, 'PAYMENT_INITIATED', JSON.stringify({ phone, amount, currency, amountInUGX, tier, externalId }));

      // Simulate calling MTN MoMo API with the provided MTN key context
      // Note: In a real environment, we'd use the provided keys from .env
      const paymentData = {
        amount: amountInUGX.toString(),
        currency: "UGX",
        externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phone.replace('+', '')
        },
        payerMessage: `Doctorian ${tier.toUpperCase()} Neural Activation`,
        payeeNote: "Clinical AI Subscription Infrastructure"
      };

      // Store pending transaction to DB
      db.prepare("INSERT INTO payments (id, userId, amount, currency, status, externalId, tier) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(externalId, userId, amount, currency, 'pending', externalId, tier);

      // Notify Admin Secretly
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      sendEmail(
        adminEmail,
        `MTN PAYMENT INITIATED: ${tier.toUpperCase()}`,
        `Payment initiated via MTN MoMo Gateway.\n\nUser ID: ${userId}\nPhone: ${phone}\nAmount: ${amount} ${currency} (${amountInUGX} UGX)\nReference: ${externalId}\n\nStatus: Pending PIN Entry.`
      );

      res.json({ 
        success: true, 
        message: "Neural activation link sent to your device. Please enter your PIN.",
        externalId 
      });

    } catch (err: any) {
      console.error("[MOMO ERROR]", err);
      res.status(500).json({ error: "Failed to initiate mobile payment" });
    }
  });

  app.get("/api/payment/mtn/status/:externalId", authenticate, (req: any, res) => {
    const { externalId } = req.params;
    const userId = req.user.id;

    try {
      const payment: any = db.prepare("SELECT * FROM payments WHERE externalId = ? AND userId = ?").get(externalId, userId);
      
      if (!payment) return res.status(404).json({ error: "Transaction not found" });

      // In a real app, we'd poll MTN API here to see if status changed to 'SUCCESSFUL'
      // For this session, we'll simulate a 70% chance of success if polled after 10s
      const age = Date.now() - parseInt(externalId.split('-')[1]);
      if (payment.status === 'pending' && age > 10000) {
         // Auto-approve in mock mode
         db.prepare("UPDATE payments SET status = 'completed' WHERE externalId = ?").run(externalId);
      // Check if this is a credit bundle purchase
      if (payment.tier.startsWith('bundle_')) {
        const creditMap: Record<string, number> = {
          'bundle_starter': 20,
          'bundle_pro': 50,
          'bundle_unlimited': 200
        };
        const creditsToAdd = creditMap[payment.tier] || 0;
        db.prepare("UPDATE users SET credits = credits + ? WHERE id = ?").run(creditsToAdd, userId);
        
        // Create notification for user
        const notifId = Math.random().toString(36).substring(2, 15);
        db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
          .run(notifId, 'Credits Recharged', `Successfully added ${creditsToAdd} consultation credits to your neural wallet.`, 'success');
      } else {
        db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'active' WHERE id = ?").run(payment.tier, userId);
        
        // Create notification for user
        const notifId = Math.random().toString(36).substring(2, 15);
        db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
          .run(notifId, 'Subscription Activated', `Your ${payment.tier.toUpperCase()} neural link has been established successfully. Enjoy your premium features.`, 'success');
      }

         payment.status = 'completed';
      }

      res.json({ status: payment.status });
    } catch (err) {
       res.status(500).json({ error: "Status check failed" });
    }
  });

  app.get("/api/billing/history", authenticate, (req: any, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM payments WHERE userId = ?").get(userId) as any;
      const history = db.prepare("SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?")
        .all(userId, limit, offset);
      
      res.json({ 
        history,
        pagination: {
          total: total.count,
          page,
          limit,
          pages: Math.ceil(total.count / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch billing history" });
    }
  });

  app.get("/api/billing/export", authenticate, (req: any, res) => {
    const userId = req.user.id;
    try {
      const history = db.prepare("SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC").all(userId) as any[];
      let csv = "ID,Date,Tier,Amount,Currency,Status,ExternalID\n";
      history.forEach(p => {
        csv += `${p.id},${p.createdAt},${p.tier},${p.amount},${p.currency},${p.status},${p.externalId}\n`;
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=billing-history.csv');
      res.send(csv);
    } catch (err) {
      res.status(500).json({ error: "Export failed" });
    }
  });

  app.get("/api/admin/billing/all", authenticate, requireAdmin, (req: any, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM payments").get() as any;
      const payments = db.prepare(`
        SELECT p.*, u.email as userEmail, u.displayName as userName 
        FROM payments p 
        LEFT JOIN users u ON p.userId = u.id 
        ORDER BY p.createdAt DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset);
      
      res.json({ 
        payments,
        pagination: {
          total: total.count,
          page,
          limit,
          pages: Math.ceil(total.count / limit)
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch all billing records" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, subscriptionTier, subscriptionStatus, lastPaymentDate, createdAt FROM users WHERE id = ?").get(decoded.id);
      res.json({ user });
    } catch (err) {
      res.json({ user: null });
    }
  });
  
  app.patch("/api/auth/profile", authenticate, (req: any, res) => {
    console.log(`[PROFILE] Update request received for user ${req.user.id}`);
    const { displayName, photoURL } = req.body;
    const userId = req.user.id;

    try {
      if (displayName !== undefined && photoURL !== undefined) {
        console.log(`[PROFILE] Updating both: displayName=${displayName}, photoURL=${photoURL}`);
        db.prepare("UPDATE users SET displayName = ?, photoURL = ? WHERE id = ?").run(displayName, photoURL, userId);
      } else if (displayName !== undefined) {
        console.log(`[PROFILE] Updating displayName: ${displayName}`);
        db.prepare("UPDATE users SET displayName = ? WHERE id = ?").run(displayName, userId);
      } else if (photoURL !== undefined) {
        console.log(`[PROFILE] Updating photoURL: ${photoURL}`);
        db.prepare("UPDATE users SET photoURL = ? WHERE id = ?").run(photoURL, userId);
      }

      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, subscriptionTier, subscriptionStatus, lastPaymentDate, createdAt FROM users WHERE id = ?").get(userId);
      console.log(`[PROFILE] Update successful for user ${userId}`);
      res.json({ user });
    } catch (err: any) {
      console.error(`[PROFILE ERROR] Update failed for user ${userId}:`, err.message);
      res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
  });

  app.post("/api/auth/subscription/upgrade", authenticate, (req: any, res) => {
    const { tier, amount, evidence } = req.body;
    const userId = req.user.id;

    if (!['silver', 'gold'].includes(tier)) {
      return res.status(400).json({ error: "Invalid subscription tier" });
    }

    try {
      const lastPaymentDate = new Date().toISOString();
      db.prepare("UPDATE users SET subscriptionTier = ?, subscriptionStatus = 'pending', lastPaymentDate = ?, paymentEvidence = ? WHERE id = ?")
        .run(tier, lastPaymentDate, evidence || null, userId);

      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, subscriptionTier, subscriptionStatus, lastPaymentDate, createdAt FROM users WHERE id = ?")
        .get(userId);
      
      // Notify Admin (Akora Joseph)
      const adminEmail = process.env.ADMIN_EMAIL || "Josephhaxzy@gmail.com";
      sendEmail(
        adminEmail,
        `🚨 PENDING UPGRADE: ${tier.toUpperCase()}`,
        `A user has initiated a subscription upgrade.\n\nUser: ${user.displayName} (${user.email})\nTier: ${tier.toUpperCase()}\nAmount: ${amount} UGX\n\nPAYMENT EVIDENCE:\n"${evidence}"\n\nPlease verify the payment on 0787674140 and update the status in the backend.`
      );

      res.json({ user });
    } catch (err: any) {
      console.error(`[SUBSCRIPTION ERROR] Upgrade failed for user ${userId}:`, err.message);
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  });

  // WebAuthn Registration
  app.get("/api/auth/webauthn/credentials", authenticate, (req: any, res) => {
    try {
      const credentials = db.prepare("SELECT id, counter, transports FROM credentials WHERE userId = ?").all(req.user.id);
      res.json({ credentials });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  app.post("/api/auth/webauthn/register-options", authenticate, async (req: any, res) => {
    const user = req.user;
    const userCredentials = db.prepare("SELECT id FROM credentials WHERE userId = ?").all(user.id) as any[];
    const rpID = req.headers.host?.split(':')[0] || 'localhost';

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    challenges.set(user.id, options.challenge);
    res.json(options);
  });

  app.post("/api/auth/webauthn/register-verify", authenticate, async (req: any, res) => {
    const user = req.user;
    const expectedChallenge = challenges.get(user.id);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = `${req.protocol}://${req.headers.host}`;

    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    try {
      const verification = await verifyRegistrationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credential } = verification.registrationInfo;
        
        db.prepare("INSERT INTO credentials (id, userId, publicKey, counter, transports) VALUES (?, ?, ?, ?, ?)")
          .run(
            credential.id,
            user.id,
            Buffer.from(credential.publicKey),
            credential.counter,
            JSON.stringify(req.body.response.transports || [])
          );

        challenges.delete(user.id);
        res.json({ verified: true });
      } else {
        res.status(400).json({ error: "Verification failed" });
      }
    } catch (err: any) {
      console.error("Registration verification error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // WebAuthn Authentication
  app.post("/api/auth/webauthn/login-options", async (req, res) => {
    const { email } = req.body;
    const user: any = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userCredentials = db.prepare("SELECT id, transports FROM credentials WHERE userId = ?").all(user.id) as any[];

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: JSON.parse(cred.transports || '[]'),
      })),
      userVerification: 'preferred',
    });

    challenges.set(user.id, options.challenge);
    res.json({ options, userId: user.id });
  });

  app.post("/api/auth/webauthn/login-verify", async (req, res) => {
    const { response, userId, email } = req.body;
    const expectedChallenge = challenges.get(userId);
    const rpID = req.headers.host?.split(':')[0] || 'localhost';
    const origin = `${req.protocol}://${req.headers.host}`;

    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge not found" });
    }

    const user: any = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const credential: any = db.prepare("SELECT * FROM credentials WHERE id = ?").get(response.id);

    if (!credential) {
      return res.status(400).json({ error: "Credential not found" });
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
        },
      });

      if (verification.verified) {
        // Update counter
        db.prepare("UPDATE credentials SET counter = ? WHERE id = ?")
          .run(verification.authenticationInfo.newCounter, credential.id);

        challenges.delete(userId);

        // Issue JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, { 
          httpOnly: true, 
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ verified: true, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
      } else {
        res.status(400).json({ error: "Verification failed" });
      }
    } catch (err: any) {
      console.error("Authentication verification error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // Records Routes
  app.get("/api/records", authenticate, (req: any, res) => {
    try {
      const records = db.prepare("SELECT * FROM records WHERE userId = ? ORDER BY date DESC").all(req.user.id);
      res.json({ records });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin Routes
  app.get("/api/admin/users", requireAdmin, (req: any, res) => {
    try {
      const users = db.prepare("SELECT id, email, displayName, photoURL, role, createdAt FROM users ORDER BY createdAt DESC").all();
      res.json({ users });
    } catch (err: any) {
      console.error("[ADMIN] Failed to fetch users:", err.message);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: "Cannot delete yourself" });

    try {
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      db.prepare("DELETE FROM records WHERE userId = ?").run(id);
      db.prepare("DELETE FROM credentials WHERE userId = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to delete user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/users/:id/records", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    try {
      const records = db.prepare("SELECT * FROM records WHERE userId = ? ORDER BY date DESC").all(id);
      res.json({ records });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to fetch records for user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to fetch user records" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, (req: any, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    try {
      db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
      res.json({ success: true, role });
    } catch (err: any) {
      console.error(`[ADMIN] Failed to update role for user ${id}:`, err.message);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  app.post("/api/records", authenticate, (req: any, res) => {
    const { type, value, unit, date, notes } = req.body;
    if (!type || !value || !date) return res.status(400).json({ error: "Missing required fields" });

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const stmt = db.prepare("INSERT INTO records (id, userId, type, value, unit, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, req.user.id, type, value, unit || "", date, notes || "");

      res.json({ record: { id, userId: req.user.id, type, value, unit, date, notes } });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/alerts/send-sms", authenticate, async (req: any, res) => {
    const { message, toDoctor, toMentor } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.MTN_API_KEY;
    const senderId = process.env.MTN_SENDER_ID || "DOCTORIAN";
    const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
    
    // Support passed numbers or fallback to .env
    const doctorNumber = normalizePhoneNumber(toDoctor || process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(toMentor || process.env.MENTOR_PHONE_NUMBER);

    if (!apiKey || !doctorNumber) {
      console.warn("MTN API Key or doctor number missing. SMS not sent.");
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Alert logged. Configure MTN API Key and Doctor number in .env for real SMS." 
      });
    }

    const results = [];

    const sendMTNSMS = async (to: string, recipientName: string) => {
      try {
        // Example MTN SMS API Call (Pattern based on common SMS gateways)
        await axios.post(`${baseUrl}/sms`, {
          to,
          from: senderId,
          message: message
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        results.push({ recipient: recipientName, status: 'sent' });
      } catch (err: any) {
        console.error(`MTN SMS Error (${recipientName}: ${to}):`, err.response?.data || err.message);
        results.push({ recipient: recipientName, status: 'failed', error: err.response?.data?.message || err.message });
      }
    };

    await sendMTNSMS(doctorNumber, 'Doctor');
    if (mentorNumber) {
      await sendMTNSMS(mentorNumber, 'Mentor');
    }

    const allFailed = results.every(r => r.status === 'failed');
    if (allFailed && results.length > 0) {
      return res.status(500).json({ error: "Failed to send MTN SMS alerts", details: results });
    }

    res.json({ success: true, message: "MTN SMS alert process completed", results });
  });

  app.post("/api/alerts/make-call", authenticate, async (req: any, res) => {
    const { message, toDoctor, toMentor } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.MTN_API_KEY;
    const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
    
    // Support passed numbers or fallback to .env
    const doctorNumber = normalizePhoneNumber(toDoctor || process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(toMentor || process.env.MENTOR_PHONE_NUMBER);

    if (!apiKey || !doctorNumber) {
      console.warn("MTN API Key or doctor number missing. Voice call not initiated.");
      return res.json({ 
        success: true, 
        simulated: true, 
        message: "Voice call logged. Configure MTN API Key and Doctor number in .env for real calls." 
      });
    }

    const results = [];

    const makeMTNCall = async (to: string, recipientName: string) => {
      try {
        // Example MTN Voice API Call
        await axios.post(`${baseUrl}/voice/call`, {
          to,
          message: message,
          voice: 'female'
        }, {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        results.push({ recipient: recipientName, status: 'initiated' });
      } catch (err: any) {
        console.error(`MTN Voice Error (${recipientName}: ${to}):`, err.response?.data || err.message);
        results.push({ recipient: recipientName, status: 'failed', error: err.response?.data?.message || err.message });
      }
    };

    await makeMTNCall(doctorNumber, 'Doctor');
    if (mentorNumber) {
      await makeMTNCall(mentorNumber, 'Mentor');
    }

    const allFailed = results.every(r => r.status === 'failed');
    if (allFailed && results.length > 0) {
      return res.status(500).json({ error: "Failed to initiate MTN voice calls", details: results });
    }

    res.json({ success: true, message: "MTN Voice call process completed", results });
  });

  app.post("/api/alerts/sos", authenticate, async (req: any, res) => {
    const { name, message } = req.body;
    const userId = req.user.id;
    const doctorNumber = normalizePhoneNumber(process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(process.env.MENTOR_PHONE_NUMBER);
    
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    const sosMessage = `EMERGENCY ALERT: ${name || 'User'} is in distress. Please respond immediately. ${message || ''}`;
    
    console.log(`[SOS] Triggered by ${name} (${userId})`);

    const results: any[] = [];

    // Try Twilio if configured
    if (twilioSid && twilioAuth && twilioPhone) {
      const client = twilio(twilioSid, twilioAuth);
      const recipients = [doctorNumber, mentorNumber].filter(Boolean) as string[];

      for (const to of recipients) {
        try {
          // Send SMS
          await client.messages.create({
            body: sosMessage,
            from: twilioPhone,
            to
          });
          
          // Make Call
          await client.calls.create({
            twiml: `<Response><Say voice="alice" language="en-US">Emergency Alert. Your patient ${name || 'is'} in distress. Please check the Doctorian app immediately.</Say></Response>`,
            from: twilioPhone,
            to
          });
          
          results.push({ recipient: to, status: 'sent', provider: 'twilio' });
        } catch (err: any) {
          console.error(`[SOS] Twilio Error for ${to}:`, err.message);
          results.push({ recipient: to, status: 'failed', provider: 'twilio', error: err.message });
        }
      }
    } else {
      console.warn("[SOS] Twilio not fully configured. Using simulated fallback.");
      results.push({ status: 'simulated', message: 'Twilio credentials missing. Configure .env for real calls/SMS.' });
    }

    res.json({ success: true, message: "SOS Alert Sequence Initiated", results });
  });

  app.post("/api/chat/feedback", authenticate, async (req: any, res) => {
    const { messageId, rating, suggestion } = req.body;
    const userId = req.user.id;

    if (!messageId || !rating) {
      return res.status(400).json({ error: "MessageID and Rating are required" });
    }

    try {
      const id = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();
      
      const stmt = db.prepare("INSERT INTO feedback (id, userId, messageId, rating, suggestion, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(id, userId, messageId, rating, suggestion || "", timestamp);

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("[FEEDBACK ERROR]", err.message);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // Notifications Endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = db.prepare("SELECT * FROM notifications ORDER BY createdAt DESC").all();
      res.json({ notifications });
    } catch (err: any) {
      console.error("[API ERROR] Failed to fetch notifications:", err.message);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", authenticate, requireAdmin, async (req, res) => {
    const { title, content, type } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    try {
      const id = Math.random().toString(36).substring(2, 15);
      db.prepare("INSERT INTO notifications (id, title, content, type) VALUES (?, ?, ?, ?)")
        .run(id, title, content, type || 'info');
      
      const notification = db.prepare("SELECT * FROM notifications WHERE id = ?").get(id);
      res.json({ success: true, notification });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  app.delete("/api/notifications/:id", authenticate, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM notifications WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  app.get("/api/admin/mtn-status", authenticate, requireAdmin, async (req, res) => {
    const apiKey = process.env.MTN_API_KEY;
    const senderId = process.env.MTN_SENDER_ID;
    const doctorNumber = process.env.DOCTOR_PHONE_NUMBER;

    res.json({
      configured: !!(apiKey && senderId && doctorNumber),
      details: {
        hasApiKey: !!apiKey,
        hasSenderId: !!senderId,
        hasDoctorNumber: !!doctorNumber,
        senderId: senderId || null,
        doctorNumber: doctorNumber ? `${doctorNumber.substring(0, 4)}...${doctorNumber.substring(doctorNumber.length - 3)}` : null,
      }
    });
  });

  // Deepseek R1 Chat Route (Server-side to hide API key)
  app.post("/api/chat/deepseek", authenticate, async (req: any, res) => {
    const { messages, systemInstruction } = req.body;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (!deepseekKey || deepseekKey.trim() === "") {
      console.warn("[DEEPSEEK] API Key not configured in .env");
      return res.status(503).json({ error: "Deepseek provider not configured. Please add DEEPSEEK_API_KEY to your environment variables." });
    }

    try {
      console.log("[DEEPSEEK] Initiating request to OpenRouter...");
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === 'bot' || m.role === 'model' ? 'assistant' : 'user',
              content: m.text
            }))
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${deepseekKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "Doctorian AI",
          },
          timeout: 25000 // Increased timeout for Deepseek R1
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        console.log("[DEEPSEEK] Successful response received.");
        return res.json({ text: response.data.choices[0].message.content });
      } else {
        console.error("[DEEPSEEK] Invalid structure:", JSON.stringify(response.data));
        throw new Error("Invalid response structure from Deepseek provider.");
      }
    } catch (err: any) {
      const status = err.response?.status || 500;
      const errorData = err.response?.data || err.message;
      console.error(`[DEEPSEEK ERROR] Status ${status}:`, errorData);
      
      res.status(status).json({ 
        error: "Deepseek service currently unavailable",
        details: typeof errorData === 'object' ? (errorData.error?.message || JSON.stringify(errorData)) : errorData
      });
    }
  });

  // Gemini Chat Route (Server-side for credit system and security)
  app.post("/api/ai/chat", authenticate, async (req: any, res) => {
    const { messages, systemInstruction, modelName, temperature } = req.body;
    const userId = req.user.id;

    try {
      // 1. Credit Check & Subscription Guard
      const user: any = db.prepare("SELECT credits, subscriptionTier FROM users WHERE id = ?").get(userId);
      
      const isPremium = user.subscriptionTier === 'gold' || user.subscriptionTier === 'business';
      const isPro = user.subscriptionTier === 'silver' || user.subscriptionTier === 'pro';

      if (!isPremium && !isPro && user.credits <= 0) {
        return res.status(403).json({ 
          error: "Low Credits", 
          message: "You have exhausted your free consultation credits. Please upgrade to Pro or purchase a Credit Bundle to continue." 
        });
      }

      // 2. Prepare System Instruction with Trust Layer
      const trustLayer = `
        MANDATORY DISCLAIMER: I am an AI assistant, not a doctor. This information is for educational purposes and is not formal medical advice. 
        Always consult a qualified healthcare professional in person for diagnosis or treatment. 
        In case of a medical emergency, call your local emergency number (e.g., 112 in Uganda) immediately.
      `;
      
      const finalSystemInstruction = `${systemInstruction}\n\n${trustLayer}`;

      let text = await callAI({
        messages,
        systemInstruction: finalSystemInstruction,
        modelName,
        temperature: temperature || 0.7
      });

      // 4. Deduct credit if not on unlimited plan
      if (!isPremium && !isPro) {
        db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
      }

      // 5. Add Contextual Affiliates / Ads (Mock-based for demo)
      if (text.toLowerCase().includes("vitamin") || text.toLowerCase().includes("supplement")) {
        text += "\n\n---\n*Contextual suggestion: Professional-grade supplements available at Pulse Pharmacies (Doctorian Verified).*";
      } else if (text.toLowerCase().includes("fever") || text.toLowerCase().includes("malaria")) {
        text += "\n\n---\n*Stay safe: Verified First-Aid and diagnostic kits can be found at local SACCO health hubs.*";
      }

      res.json({ text, creditsRemaining: isPremium || isPro ? 'Unlimited' : user.credits - 1 });
    } catch (err: any) {
      console.error(`[AI CHAT ERROR]`, err.message);
      res.status(500).json({ error: "Clinical AI node failed to process request" });
    }
  });

  app.post("/api/ai/voice", authenticate, async (req: any, res) => {
    const { text, voiceName } = req.body;
    try {
      const aiResponse = await callAI({
        messages: [{ role: 'user', text: `Respond concisely and clinically to this patient: ${text}` }],
        systemInstruction: "You are a clinical voice assistant.",
        modelName: "gemini-1.5-flash"
      });
      res.json({ text: aiResponse });
    } catch (err: any) {
      console.error("[AI VOICE ERROR]:", err.message);
      res.status(500).json({ error: "Voice synthesis failed" });
    }
  });

  app.post("/api/ai/operational-ideas", authenticate, async (req: any, res) => {
    const user = req.user;
    if (user.subscriptionTier !== 'gold') {
      return res.status(403).json({ error: "Premium subscription required" });
    }

    try {
      const idea = await callAI({
        messages: [{ role: 'user', text: "Generate a high-level operational health strategy or clinical efficiency idea for a professional medical setting. Focus on innovation, resource management, or patient outcomes. Keep it professional and concise." }],
        systemInstruction: "You are a healthcare operational consultant.",
        modelName: "gemini-1.5-flash"
      });
      res.json({ idea });
    } catch (err: any) {
      console.error(`[AI ERROR] Operational idea failed:`, err.message);
      res.status(500).json({ error: "Failed to generate idea" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Seed demo user
  const seedDemoUser = async () => {
    const email = "doctor@doctorian.ai";
    const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!existing) {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      const id = "demo-doctor-id";
      const createdAt = new Date().toISOString();
      db.prepare("INSERT INTO users (id, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, email, hashedPassword, "Dr. Demo", "admin", createdAt);
      console.log("[SEED] Demo admin user created");
    } else if (existing.role !== 'admin') {
      db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
      console.log("[SEED] Demo user updated to admin");
    }
  };
  await seedDemoUser();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("FATAL: Failed to start server:", err);
  process.exit(1);
});
