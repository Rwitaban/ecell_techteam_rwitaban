import fs from "fs";
import path from "path";
import crypto from "crypto";
import { User, ScheduleItem, MerchandiseItem, Transaction, BroadcastNotification, FinancialSummary } from "../types";

// Database storage file
const DB_FILE = path.join(process.cwd(), "db.json");

interface DbSchema {
  users: Record<string, User & { passwordHash: string }>;
  events: Record<string, ScheduleItem>;
  merchandise: Record<string, MerchandiseItem>;
  transactions: Record<string, Transaction>;
  notifications: BroadcastNotification[];
  budgetPool: number; // Total budget available for superadmin
}

// SHA256 password hashing
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const INITIAL_DB: DbSchema = {
  users: {
    "usr-superadmin": {
      id: "usr-superadmin",
      email: "superadmin@apex.com",
      name: "Alex Mercer",
      role: "superadmin",
      phone: "+1 (555) 0199",
      college: "Stanford University",
      registeredEvents: [],
      registeredWorkshops: [],
      itinerary: [],
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword("superadmin123"),
    },
    "usr-admin": {
      id: "usr-admin",
      email: "admin@apex.com",
      name: "Elena Rostova",
      role: "admin",
      phone: "+1 (555) 0142",
      college: "MIT",
      registeredEvents: [],
      registeredWorkshops: [],
      itinerary: [],
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword("admin123"),
    },
    "usr-student": {
      id: "usr-student",
      email: "student@apex.com",
      name: "Siddharth Sharma",
      role: "student",
      phone: "+91 9876543210",
      college: "IIT Bombay",
      registeredEvents: [],
      registeredWorkshops: [],
      itinerary: [],
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword("student123"),
    },
  },
  events: {
    "evt-1": {
      id: "evt-1",
      title: "Opening Keynote: AI & The Future of Human Enterprise",
      description: "APEX '26 launch event. Discover how the convergence of generative intelligence and modular robotic software creates a multi-trillion startup frontier.",
      type: "event",
      speaker: "Dr. Arthur Mercer",
      speakerTitle: "Principal AI Scientist",
      speakerCompany: "Google DeepMind",
      timeSlot: "Day 1, 09:00 AM - 10:30 AM",
      day: 1,
      startHour: 9.0,
      endHour: 10.5,
      venue: "Grand Apex Arena (Hall A)",
      price: 0,
      capacity: 1500,
      registeredCount: 382,
      allocatedBudget: 15000,
    },
    "evt-2": {
      id: "evt-2",
      title: "AI Hackfest APEX: Launch & Problem Statements",
      description: "Official prompt unveiling and hacking setup for the 36-hour flagship hackathon. Stand a chance to pitch to elite silicon valley VCs.",
      type: "event",
      speaker: "Nisha Singhania",
      speakerTitle: "Managing Director",
      speakerCompany: "Apex Ventures",
      timeSlot: "Day 1, 11:30 AM - 01:00 PM",
      day: 1,
      startHour: 11.5,
      endHour: 13.0,
      venue: "Cyberia Incubator & Labs",
      price: 0,
      capacity: 500,
      registeredCount: 219,
      allocatedBudget: 5000,
    },
    "evt-3": {
      id: "evt-3",
      title: "Workshop: Building Scalable Production-Grade React 19 Apps",
      description: "Hands-on masterclass targeting React Server Components, Suspense borders, Server Actions, and state mechanics built over Vite 6.",
      type: "workshop",
      speaker: "Marcus Sterling",
      speakerTitle: "Lead Frontend Engineer",
      speakerCompany: "Vercel",
      timeSlot: "Day 1, 02:00 PM - 04:00 PM",
      day: 1,
      startHour: 14.0,
      endHour: 16.0,
      venue: "Tech Dome Lab (3rd Floor)",
      price: 15,
      capacity: 100,
      registeredCount: 45,
      allocatedBudget: 2500,
    },
    "evt-4": {
      id: "evt-4",
      title: "Panel Discussion: Web3, Tokenomics, & Sovereign Financialism",
      description: "An intensive round of arguments evaluating decentralization trends, real-world asset tokenization (RWA), & regulatory scaling protocols.",
      type: "event",
      speaker: "Vikram Nair & Panelists",
      speakerTitle: "Founding Partner",
      speakerCompany: "CryptoSovereign",
      timeSlot: "Day 2, 10:00 AM - 11:30 AM",
      day: 2,
      startHour: 10.0,
      endHour: 11.5,
      venue: "Executive Seminar Hall",
      price: 20,
      capacity: 350,
      registeredCount: 88,
      allocatedBudget: 4000,
    },
    "evt-5": {
      id: "evt-5",
      title: "Workshop: Designing Multi-Agent Systems using Gemini SDK",
      description: "Create intelligent, self-healing, cooperative AI workflows capable of tool calling, grounding, and real-time structured execution.",
      type: "workshop",
      speaker: "Sanjay Dev",
      speakerTitle: "Developer Advocate",
      speakerCompany: "Google AI",
      timeSlot: "Day 2, 01:00 PM - 03:00 PM",
      day: 2,
      startHour: 13.0,
      endHour: 15.0,
      venue: "Tech Dome Lab (3rd Floor)",
      price: 10,
      capacity: 80,
      registeredCount: 64,
      allocatedBudget: 3500,
    },
  },
  merchandise: {
    "merch-1": {
      id: "merch-1",
      name: "APEX '26 Obsidian Heavyweight Hoodie",
      description: "Sleek, drop-shoulder cyberpunk premium fit 450 GSM fleece hoodie. Styled with custom high-density neon embroidery.",
      price: 45,
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=256&auto=format&fit=crop",
      stock: 45,
      initialStock: 50,
    },
    "merch-2": {
      id: "merch-2",
      name: "Cybernetic E-Cell Silicon Tee",
      description: "Lightweight, ultra-breathable bio-washed technical organic cotton tee. Features grid matrix prints on rear.",
      price: 25,
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=256&auto=format&fit=crop",
      stock: 110,
      initialStock: 120,
    },
    "merch-3": {
      id: "merch-3",
      name: "APEX RGB Ambient Cyber Mat",
      description: "Large 900x400x4mm micro-woven surface with customizable edge-lit 14-mode addressable RGB luminescence.",
      price: 30,
      imageUrl: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?q=80&w=256&auto=format&fit=crop",
      stock: 22,
      initialStock: 35,
    },
    "merch-4": {
      id: "merch-4",
      name: "APEX NFC Smart Cyber Band",
      description: "Secures authentication, tracks event attendances, stores digital contacts, and glows dynamically in live concert stages.",
      price: 15,
      imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=256&auto=format&fit=crop",
      stock: 198,
      initialStock: 200,
    },
  },
  transactions: {
    "tx-1": {
      id: "tx-1",
      userId: "usr-student",
      userName: "Siddharth Sharma",
      userEmail: "student@apex.com",
      type: "merchandise",
      itemId: "merch-1",
      itemName: "APEX '26 Obsidian Heavyweight Hoodie",
      amount: 45,
      status: "success",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    "tx-2": {
      id: "tx-2",
      userId: "usr-student",
      userName: "Siddharth Sharma",
      userEmail: "student@apex.com",
      type: "ticket",
      itemId: "evt-3",
      itemName: "Workshop: Building Scalable Production-Grade React 19 Apps",
      amount: 15,
      status: "success",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    "tx-3": {
      id: "tx-3",
      userId: "usr-student",
      userName: "Siddharth Sharma",
      userEmail: "student@apex.com",
      type: "merchandise",
      itemId: "merch-3",
      itemName: "APEX RGB Ambient Cyber Mat",
      amount: 30,
      status: "success",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  },
  notifications: [
    {
      id: "notif-1",
      title: "APEX '26 Hackathon Problem Statements Unveiled!",
      message: "Check your dashboards! The core tracks focusing on Generative Agents, Modular Cryptography, and Edge Web Frameworks are now live on the Portal.",
      pinned: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      senderName: "Elena Rostova (Admin)",
    },
    {
      id: "notif-2",
      title: "Venue Update: Keynote Relocations",
      message: "Please note: Dr. Arthur Mercer's Keynote has been upgraded to the Grand Apex Arena due to massive pre-registrations. Arrive 15 minutes early.",
      pinned: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      senderName: "Elena Rostova (Admin)",
    }
  ],
  budgetPool: 100000,
};

export class Database {
  private data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        // Ensure standard structure is robust against schema updates
        return {
          users: parsed.users || INITIAL_DB.users,
          events: parsed.events || INITIAL_DB.events,
          merchandise: parsed.merchandise || INITIAL_DB.merchandise,
          transactions: parsed.transactions || INITIAL_DB.transactions,
          notifications: parsed.notifications || INITIAL_DB.notifications,
          budgetPool: typeof parsed.budgetPool === "number" ? parsed.budgetPool : INITIAL_DB.budgetPool,
        };
      }
    } catch (e) {
      console.error("Failed to load local DB, fallback to memory initialization", e);
    }
    this.save(INITIAL_DB);
    return INITIAL_DB;
  }

  private save(data: DbSchema): void {
    try {
      // Sync write with atomicity using temporary rename strategy
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error("Critical error saving JSON database", e);
    }
  }

  public getUsers(): User[] {
    return Object.values(this.data.users).map(({ passwordHash, ...user }) => user);
  }

  public findUserById(id: string): User | undefined {
    const fullUser = this.data.users[id];
    if (!fullUser) return undefined;
    const { passwordHash, ...user } = fullUser;
    return user;
  }

  public findFullUserByEmail(email: string) {
    return Object.values(this.data.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(email: string, name: string, plainPassword: string, role: "student" | "admin" = "student"): User {
    const existing = this.findFullUserByEmail(email);
    if (existing) {
      throw new Error("A user with this email already exists");
    }

    const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
    const newUser: User & { passwordHash: string } = {
      id,
      email: email.toLowerCase(),
      name,
      role,
      phone: "",
      college: "",
      registeredEvents: [],
      registeredWorkshops: [],
      itinerary: [],
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(plainPassword),
    };

    this.data.users[id] = newUser;
    this.save(this.data);

    const { passwordHash, ...userOnly } = newUser;
    return userOnly;
  }

  public updateUser(id: string, updates: Partial<Omit<User, "id" | "role" | "email">>): User {
    const fullUser = this.data.users[id];
    if (!fullUser) {
      throw new Error(`User not found: ${id}`);
    }

    const updatedUser = {
      ...fullUser,
      ...updates,
    };

    this.data.users[id] = updatedUser;
    this.save(this.data);

    const { passwordHash, ...userOnly } = updatedUser;
    return userOnly;
  }

  public updateUserRole(id: string, role: "student" | "admin" | "superadmin"): User {
    const fullUser = this.data.users[id];
    if (!fullUser) {
      throw new Error(`User not found: ${id}`);
    }

    fullUser.role = role;
    this.save(this.data);

    const { passwordHash, ...userOnly } = fullUser;
    return userOnly;
  }

  // Events CRUD
  public getEvents(): ScheduleItem[] {
    return Object.values(this.data.events);
  }

  public findEventById(id: string): ScheduleItem | undefined {
    return this.data.events[id];
  }

  public createEvent(eventData: Omit<ScheduleItem, "id" | "registeredCount">): ScheduleItem {
    const id = `evt-${crypto.randomUUID().slice(0, 8)}`;
    const newEvent: ScheduleItem = {
      ...eventData,
      id,
      registeredCount: 0,
    };
    this.data.events[id] = newEvent;
    this.save(this.data);
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<Omit<ScheduleItem, "id">>): ScheduleItem {
    const event = this.data.events[id];
    if (!event) {
      throw new Error(`Event not found: ${id}`);
    }

    const updatedEvent = {
      ...event,
      ...updates,
    };
    this.data.events[id] = updatedEvent;
    this.save(this.data);
    return updatedEvent;
  }

  public deleteEvent(id: string): void {
    if (!this.data.events[id]) {
      throw new Error(`Event not found: ${id}`);
    }
    delete this.data.events[id];
    this.save(this.data);
  }

  // Merchandise CRUD
  public getMerchandise(): MerchandiseItem[] {
    return Object.values(this.data.merchandise);
  }

  public updateMerchandiseStock(id: string, decreaseBy: number): MerchandiseItem {
    const item = this.data.merchandise[id];
    if (!item) {
      throw new Error(`Merchandise item not found: ${id}`);
    }
    if (item.stock < decreaseBy) {
      throw new Error(`Insufficient stock for ${item.name}. Available: ${item.stock}`);
    }
    item.stock -= decreaseBy;
    this.save(this.data);
    return item;
  }

  public createMerchandise(itemData: Omit<MerchandiseItem, "id" | "initialStock">): MerchandiseItem {
    const id = `merch-${crypto.randomUUID().slice(0, 8)}`;
    const newItem: MerchandiseItem = {
      ...itemData,
      id,
      initialStock: itemData.stock,
    };
    this.data.merchandise[id] = newItem;
    this.save(this.data);
    return newItem;
  }

  public updateMerchandise(id: string, updates: Partial<Omit<MerchandiseItem, "id" | "initialStock">>): MerchandiseItem {
    const item = this.data.merchandise[id];
    if (!item) {
      throw new Error(`Merchandise item not found: ${id}`);
    }
    
    const updated = {
      ...item,
      ...updates,
    };
    // Adjust initialStock to match new stock if target stock increases
    if (updates.stock !== undefined && updates.stock > item.initialStock) {
      updated.initialStock = updates.stock;
    }
    
    this.data.merchandise[id] = updated;
    this.save(this.data);
    return updated;
  }

  public deleteMerchandise(id: string): void {
    if (!this.data.merchandise[id]) {
      throw new Error(`Merchandise item not found: ${id}`);
    }
    delete this.data.merchandise[id];
    this.save(this.data);
  }

  // Transactions CRUD
  public getTransactions(): Transaction[] {
    return Object.values(this.data.transactions).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createPendingTransaction(userId: string, type: "ticket" | "merchandise", itemId: string, amount: number, itemName: string): Transaction {
    const user = this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const id = `tx-${crypto.randomUUID().slice(0, 8)}`;
    const tx: Transaction = {
      id,
      userId,
      userName: user.name,
      userEmail: user.email,
      type,
      itemId,
      itemName,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.data.transactions[id] = tx;
    this.save(this.data);
    return tx;
  }

  public completeTransaction(id: string, success: boolean): Transaction {
    const tx = this.data.transactions[id];
    if (!tx) {
      throw new Error(`Transaction not found: ${id}`);
    }

    tx.status = success ? "success" : "failed";

    if (success) {
      // Apply database impact depending on transaction types
      if (tx.type === "ticket") {
        const user = this.data.users[tx.userId];
        const event = this.data.events[tx.itemId];
        if (event && user) {
          event.registeredCount += 1;
          if (event.type === "event") {
            if (!user.registeredEvents.includes(event.id)) {
              user.registeredEvents.push(event.id);
            }
          } else {
            if (!user.registeredWorkshops.includes(event.id)) {
              user.registeredWorkshops.push(event.id);
            }
          }
          // Automatically append to user itinerary as well
          if (!user.itinerary.includes(event.id)) {
            user.itinerary.push(event.id);
          }
        }
      } else if (tx.type === "merchandise") {
        const item = this.data.merchandise[tx.itemId];
        if (item) {
          if (item.stock < 1) {
            tx.status = "failed"; // Overselling prevention fallback state!
            throw new Error(`Stock depleted for item: ${item.name}`);
          }
          item.stock -= 1;
        }
      }
    }

    this.save(this.data);
    return tx;
  }

  // Notifications CRUD
  public getNotifications(): BroadcastNotification[] {
    return this.data.notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createNotification(title: string, message: string, senderName: string): BroadcastNotification {
    const notif: BroadcastNotification = {
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      title,
      message,
      pinned: false,
      createdAt: new Date().toISOString(),
      senderName,
    };
    this.data.notifications.push(notif);
    this.save(this.data);
    return notif;
  }

  // Financial Stats
  public getFinancialSummary(): FinancialSummary {
    const txs = Object.values(this.data.transactions).filter((t) => t.status === "success");
    const ticketRevenue = txs
      .filter((t) => t.type === "ticket")
      .reduce((sum, t) => sum + t.amount, 0);
    const merchRevenue = txs
      .filter((t) => t.type === "merchandise")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const events = Object.values(this.data.events);
    const totalBudgetAllocated = events.reduce((sum, e) => sum + (e.allocatedBudget || 0), 0);

    return {
      totalRevenue: ticketRevenue + merchRevenue,
      ticketRevenue,
      merchRevenue,
      allocatedBudget: totalBudgetAllocated,
      totalBudgetAllocated,
      remainingFreeBudget: this.data.budgetPool - totalBudgetAllocated,
    };
  }

  public adjustBudgetPool(amount: number): number {
    this.data.budgetPool = amount;
    this.save(this.data);
    return this.data.budgetPool;
  }

  public getBudgetPool(): number {
    return this.data.budgetPool;
  }
}
