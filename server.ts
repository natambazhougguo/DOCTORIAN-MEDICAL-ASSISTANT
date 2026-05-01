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
      
      res.json({ user: { id, email, displayName, role: "user", createdAt } });
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

  app.get("/api/auth/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, createdAt FROM users WHERE id = ?").get(decoded.id);
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

      const user: any = db.prepare("SELECT id, email, displayName, photoURL, role, createdAt FROM users WHERE id = ?").get(userId);
      console.log(`[PROFILE] Update successful for user ${userId}`);
      res.json({ user });
    } catch (err: any) {
      console.error(`[PROFILE ERROR] Update failed for user ${userId}:`, err.message);
      res.status(500).json({ error: "Failed to update profile", details: err.message });
    }
  });

  // WebAuthn Registration
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
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.MTN_API_KEY;
    const senderId = process.env.MTN_SENDER_ID || "DOCTORIAN";
    const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
    const doctorNumber = normalizePhoneNumber(process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(process.env.MENTOR_PHONE_NUMBER);

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
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const apiKey = process.env.MTN_API_KEY;
    const baseUrl = process.env.MTN_BASE_URL || "https://api.mtn.com/v1";
    const doctorNumber = normalizePhoneNumber(process.env.DOCTOR_PHONE_NUMBER);
    const mentorNumber = normalizePhoneNumber(process.env.MENTOR_PHONE_NUMBER);

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
