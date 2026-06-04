/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "student" | "admin" | "superadmin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  college?: string;
  registeredEvents: string[]; // List of eventIds
  registeredWorkshops: string[]; // List of workshopIds
  itinerary: string[]; // List of schedule slots/eventIds
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: "event" | "workshop";
  speaker: string;
  speakerTitle: string;
  speakerCompany: string;
  timeSlot: string; // "Day 1, 10:00 AM - 11:30 AM"
  day: 1 | 2;
  startHour: number; // For overlap/conflict checking, e.g., 10.0 (10:00 AM) or 13.5 (1:30 PM)
  endHour: number; // e.g., 11.5 (11:30 AM)
  venue: string;
  price: number; // Registration fee, 0 = free
  capacity: number;
  registeredCount: number;
  allocatedBudget: number; // Budget allocation for this item (Superadmin managed)
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  initialStock: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "ticket" | "merchandise";
  itemId: string; // Event/Workshop ID, or Merchandise ID
  itemName: string;
  amount: number;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  pinned: boolean;
  createdAt: string;
  senderName: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  ticketRevenue: number;
  merchRevenue: number;
  allocatedBudget: number;
  totalBudgetAllocated: number;
  remainingFreeBudget: number;
}
