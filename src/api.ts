
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
  credits: number;
  institutionId?: string;
  subscriptionTier: 'free' | 'silver' | 'gold' | 'pro' | 'business' | 'enterprise';
  subscriptionStatus?: 'active' | 'expired' | 'none' | 'pending';
  lastPaymentDate?: string;
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
  attachmentURL?: string;
}

const API_BASE = "/api";

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
      async getCredentials() {
        const res = await fetch(`${API_BASE}/auth/webauthn/credentials`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch credentials");
        return data.credentials as any[];
      },
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
    },
    async upgradeSubscription(tier: string, amount: number, evidence?: string) {
      const res = await fetch(`${API_BASE}/auth/subscription/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, amount, evidence }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription upgrade failed");
      return data.user as User;
    },
    async generateOperationalIdea() {
      const res = await fetch(`${API_BASE}/ai/operational-ideas`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      return data.idea as string;
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
    },
    async listBilling(page: number = 1, limit: number = 10) {
      const res = await fetch(`${API_BASE}/admin/billing/all?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch billing records");
      return data as { payments: any[], pagination: any };
    }
  },
  billing: {
    async getHistory(page: number = 1, limit: number = 10) {
      const res = await fetch(`${API_BASE}/billing/history?page=${page}&limit=${limit}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch billing history");
      return data as { history: any[], pagination: any };
    },
    exportUrl() {
      return `${API_BASE}/billing/export`;
    },
    async subscribe(planId: string, transaction_id?: string) {
      const res = await fetch(`${API_BASE}/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, transaction_id }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process subscription");
      return data as { success: boolean, tier: string, creditsAdded: number };
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
  medications: {
    async list() {
      const res = await fetch(`${API_BASE}/medications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch medications");
      return data.medications as any[];
    },
    async create(med: any) {
      const res = await fetch(`${API_BASE}/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(med),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add medication");
      return data.medication;
    },
    async delete(id: string) {
      const res = await fetch(`${API_BASE}/medications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete medication");
      return data.success;
    },
    async take(id: string, undo: boolean = false) {
      const res = await fetch(`${API_BASE}/medications/${id}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undo }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log intake");
      return data.success;
    },
    async update(id: string, updates: any) {
      const res = await fetch(`${API_BASE}/medications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update medication");
      return data.success;
    }
  },
  alerts: {
    async sendSms(message: string, toDoctor?: string, toMentor?: string) {
      const res = await fetch(`${API_BASE}/alerts/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send alert");
      return data as { success: boolean; simulated?: boolean; message: string };
    },
    async makeCall(message: string, toDoctor?: string, toMentor?: string) {
      const res = await fetch(`${API_BASE}/alerts/make-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, toDoctor, toMentor }),
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
    async geminiChat(
      messages: { role: string; text: string }[] | string, 
      systemInstruction: string = "You are a helpful medical assistant.", 
      model: string = "gemini-1.5-flash", 
      temperature: number = 0.7
    ) {
      const payloadMessages = typeof messages === 'string' 
        ? [{ role: 'user', text: messages }] 
        : messages;

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: payloadMessages, 
          systemInstruction, 
          modelName: model, 
          temperature 
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");
      return data as { text: string; imageData?: string; creditsRemaining?: number | string };
    },
    async voiceChat(text: string, voiceName: string = 'Charon') {
      const res = await fetch(`${API_BASE}/ai/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceName }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Voice call failed");
      return data as { text: string };
    },
    async *geminiChatStream(messages: { role: string; text: string }[], systemInstruction: string, model: string, temperature: number, onMetadata?: (meta: any) => void) {
      const res = await fetch(`${API_BASE}/ai/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages, 
          systemInstruction, 
          modelName: model, 
          temperature 
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Stream connection failed" }));
        throw new Error(error.message || error.error || "Streaming failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") return;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) yield data.text;
              if (data.credits !== undefined && onMetadata) onMetadata(data);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
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
