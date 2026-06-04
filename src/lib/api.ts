/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, ScheduleItem, MerchandiseItem, Transaction, BroadcastNotification, FinancialSummary } from "../types";

const API_BASE = "/api";

export function getSessionToken(): string | null {
  return localStorage.getItem("apex_token");
}

export function saveSession(token: string, user: User) {
  localStorage.setItem("apex_token", token);
  localStorage.setItem("apex_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("apex_token");
  localStorage.removeItem("apex_user");
}

export function getStoredUser(): User | null {
  const data = localStorage.getItem("apex_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function request(url: string, options: any = {}) {
  const token = getSessionToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(API_BASE + url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(data.token, data.user);
    return data;
  },

  register: async (registerData: any) => {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    });
    saveSession(data.token, data.user);
    return data;
  },

  getProfile: async () => {
    const data = await request("/auth/me");
    localStorage.setItem("apex_user", JSON.stringify(data.user));
    return data.user;
  },

  updateProfile: async (profileData: Partial<User>) => {
    const data = await request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    localStorage.setItem("apex_user", JSON.stringify(data.user));
    return data.user;
  },

  assignUserRole: async (userId: string, role: string) => {
    const data = await request("/auth/assign-role", {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    });
    return data.user;
  },

  getUsersList: async () => {
    const data = await request("/users");
    return data.users as User[];
  },

  // Events & Workshops Scheduler
  getEvents: async () => {
    const data = await request("/events");
    return data.events as ScheduleItem[];
  },

  createEvent: async (eventData: any) => {
    const data = await request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
    return data.event as ScheduleItem;
  },

  updateEvent: async (id: string, updates: any) => {
    const data = await request(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.event as ScheduleItem;
  },

  deleteEvent: async (id: string) => {
    return await request(`/events/${id}`, {
      method: "DELETE",
    });
  },

  registerForEvent: async (id: string) => {
    return await request(`/events/${id}/register`, {
      method: "POST",
    });
  },

  cancelRegistration: async (id: string) => {
    const data = await request(`/events/${id}/cancel`, {
      method: "POST",
    });
    return data.user as User;
  },

  // Merchandise Store
  getMerchandise: async () => {
    const data = await request("/merchandise");
    return data.merchandise as MerchandiseItem[];
  },

  createMerchandise: async (itemData: any) => {
    const data = await request("/merchandise", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
    return data.item as MerchandiseItem;
  },

  updateMerchandise: async (id: string, updates: any) => {
    const data = await request(`/merchandise/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return data.item as MerchandiseItem;
  },

  deleteMerchandise: async (id: string) => {
    return await request(`/merchandise/${id}`, {
      method: "DELETE",
    });
  },

  // Notifications / Announcements Feed
  getNotifications: async () => {
    const data = await request("/notifications");
    return data.notifications as BroadcastNotification[];
  },

  postNotification: async (title: string, message: string) => {
    const data = await request("/notifications", {
      method: "POST",
      body: JSON.stringify({ title, message }),
    });
    return data.notification as BroadcastNotification;
  },

  // Financial Summary & Transactions
  getFinancialSummary: async () => {
    return await request("/finance/summary") as { summary: FinancialSummary; budgetPool: number };
  },

  adjustBudgetPool: async (amount: number) => {
    return await request("/finance/pool", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }) as { summary: FinancialSummary; budgetPool: number };
  },

  getTransactionsList: async () => {
    const data = await request("/transactions");
    return data.transactions as Transaction[];
  },

  getTransactionsMy: async () => {
    const data = await request("/transactions/my");
    return data.transactions as Transaction[];
  },

  // Payments Pipeline
  initiateCheckout: async (type: "ticket" | "merchandise", itemId: string, amount: number, itemName: string) => {
    const data = await request("/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ type, itemId, amount, itemName }),
    });
    return data.transaction as Transaction;
  },

  triggerStripeWebhookSim: async (transactionId: string, success: boolean) => {
    const data = await request("/payments/webhook", {
      method: "POST",
      body: JSON.stringify({ transactionId, success }),
    });
    return data.transaction as Transaction;
  },
};
