export type UserRole = "student" | "admin" | "superadmin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  college?: string;
  registeredEvents: string[]; 
  registeredWorkshops: string[]; 
  itinerary: string[]; 
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
  timeSlot: string; 
  day: 1 | 2;
  startHour: number; 
  endHour: number;
  venue: string;
  price: number; 
  capacity: number;
  registeredCount: number;
  allocatedBudget: number; 
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
  itemId: string; 
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
