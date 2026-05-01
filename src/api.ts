import { GoogleGenAI } from "@google/genai";

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  createdAt: string;
}

export interface HealthRecord {
  id: string;
  userId: string;
  type: string;
  value: string;
  unit?: string;
  date: string;
  notes?: string;
}

const API_BASE = "/api";

// Initialize Gemini directly in the client
// The platform injects process.env.GEMINI_API_KEY into the browser environment
const genAI = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || "") });

export const api = {
  auth: {
    async signup(email: string, password: string, displayName?: string) {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data.user as User;
    },
    async login(email: string, password: string) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data.user as User;
    },
    async logout() {
      await fetch(`${API_BASE}/auth/logout`, { 
        method: "POST",
        credentials: "include",
      });
    },
    async me() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      const data = await res.json();
      return data.user as User | null;
    },
    async updateProfile(updates: { displayName?: string; photoURL?: string }) {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      return data.user as User;
    },
    webauthn: {
      async registerOptions() {
        const res = await fetch(`${API_BASE}/auth/webauthn/register-options`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get registration options");
        return data;
      },
      async registerVerify(response: any) {
        const res = await fetch(`${API_BASE}/auth/webauthn/register-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration verification failed");
        return data.verified as boolean;
      },
      async loginOptions(email: string) {
        const res = await fetch(`${API_BASE}/auth/webauthn/login-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get login options");
        return data;
      },
      async loginVerify(response: any, userId: string, email: string) {
        const res = await fetch(`${API_BASE}/auth/webauthn/login-verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response, userId, email }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login verification failed");
        return data as { verified: boolean; user: User };
      }
    },
    async forgotPassword(email: string) {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request password reset");
      return data;
    },
    async verifyResetCode(email: string, code: string) {
      const res = await fetch(`${API_BASE}/auth/verify-reset-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired code");
      return data as { success: boolean; token: string };
    },
    async resetPassword(token: string, password: string) {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      return data;
    },
    async socialLogin(user: { email: string; displayName: string; photoURL?: string; providerId: string }) {
      const res = await fetch(`${API_BASE}/auth/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social login failed");
      return data.user as User;
    }
  },
  admin: {
    async listUsers() {
      const res = await fetch(`${API_BASE}/admin/users`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data.users as User[];
    },
    async deleteUser(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      return data.success as boolean;
    },
    async getUserRecords(id: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/records`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user records");
      return data.records as HealthRecord[];
    },
    async updateUserRole(id: string, role: string) {
      const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user role");
      return data.success as boolean;
    }
  },
  notifications: {
    async list() {
      const res = await fetch(`${API_BASE}/notifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
      return data.notifications as any[];
    },
    async create(notification: { title: string; content: string; type?: string }) {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create notification");
      return data.notification as any;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete notification");
      return data.success as boolean;
    }
  },
  records: {
    async list() {
      const res = await fetch(`${API_BASE}/records`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch records");
      return data.records as HealthRecord[];
    },
    async create(record: Omit<HealthRecord, "id" | "userId">) {
      const res = await fetch(`${API_BASE}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create record");
      return data.record as HealthRecord;
    }
  },
  alerts: {
    async sendSms(message: string) {
      const res = await fetch(`${API_BASE}/alerts/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send alert");
      return data as { success: boolean; simulated?: boolean; message: string };
    },
    async makeCall(message: string) {
      const res = await fetch(`${API_BASE}/alerts/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate call");
      return data as { success: boolean; simulated?: boolean; message: string };
    },
    async triggerSOS(name: string, message?: string) {
      const res = await fetch(`${API_BASE}/alerts/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger SOS");
      return data as { success: boolean; message: string; results?: any[] };
    }
  },
  ai: {
    async geminiChat(messages: { role: string; text: string }[], systemInstruction: string, model: string, temperature: number) {
      try {
        const result = await genAI.models.generateContent({
          model: model || "gemini-3-flash-preview",
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          config: {
            systemInstruction,
            temperature: temperature || 0.7,
          }
        });

        let imageData = null;
        if (result.candidates?.[0]?.content?.parts) {
          for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
              imageData = part.inlineData.data;
            }
          }
        }

        return { text: result.text || "", imageData };
      } catch (err: any) {
        console.error("[GEMINI CLIENT ERROR]", err);
        throw err; // Components will handle the error message
      }
    },
    async *geminiChatStream(messages: { role: string; text: string }[], systemInstruction: string, model: string, temperature: number) {
      try {
        const stream = await genAI.models.generateContentStream({
          model: model || "gemini-3-flash-preview",
          contents: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          })),
          config: {
            systemInstruction,
            temperature: temperature || 0.7,
          }
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
      } catch (err: any) {
        console.error("[GEMINI STREAM ERROR]", err);
        throw err;
      }
    },
    async deepseekChat(messages: { role: string; text: string }[], systemInstruction: string) {
      const res = await fetch(`${API_BASE}/chat/deepseek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, systemInstruction }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");
      return data as { text: string };
    },
    async submitFeedback(feedback: { messageId: string; rating: 'up' | 'down'; suggestion?: string }) {
      const res = await fetch(`${API_BASE}/chat/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
      return data as { success: boolean; id: string };
    }
  }
};
