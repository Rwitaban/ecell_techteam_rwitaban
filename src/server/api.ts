/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { Database, hashPassword } from "./db";
import { BroadcastNotification, ScheduleItem } from "../types";
import { broadcastWS } from "./ws";

export function createApiRouter(db: Database) {
  const router = Router();

  // Active SSE clients for real-time broadcasts
  let activeClients: Response[] = [];

  // Middleware to authorize user roles
  function requireAuth(allowedRoles?: ("student" | "admin" | "superadmin")[]) {
    return (req: Request, res: Response, next: any) => {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "No authorization token provided" });
      }

      // In our simple secure session engine, the token is simply the userId or a string format.
      // E.g. "Bearer usr-student"
      const userId = authHeader.replace("Bearer ", "").trim();
      const user = db.findUserById(userId);

      if (!user) {
        return res.status(401).json({ error: "Invalid session token" });
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Forbidden: Inherited privileges insufficient" });
      }

      // Attach user to request
      (req as any).user = user;
      next();
    };
  }

  // --- Real-time Notifications SSE Endpoint ---
  router.get("/notifications/stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Add to active broadcast clients
    activeClients.push(res);

    // Keepalive ping to prevent connection teardown
    const keepLiveInterval = setInterval(() => {
      res.write("event: keepalive\ndata: {}\n\n");
    }, 15000);

    req.on("close", () => {
      clearInterval(keepLiveInterval);
      activeClients = activeClients.filter((client) => client !== res);
    });
  });

  // Helper to broadcast announcements
  function broadcast(event: string, payload: any) {
    // 1. Broadcast to SSE clients
    const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    activeClients.forEach((client) => {
      try {
        client.write(dataString);
      } catch (err) {
        // Ignored, dead client. Will be removed on close event.
      }
    });

    // 2. Broadcast to WebSocket clients
    broadcastWS(event, payload);
  }

  // --- Auth Endpoints ---
  router.post("/auth/register", (req: Request, res: Response) => {
    const { email, name, password, phone, college } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: "Email, name, and password are required" });
    }

    try {
      const user = db.createUser(email, name, password, "student");
      // Add optional bio info
      if (phone || college) {
        db.updateUser(user.id, { phone, college });
      }
      const updatedUser = db.findUserById(user.id);
      return res.status(201).json({ token: user.id, user: updatedUser });
    } catch (err: any) {
      return res.status(409).json({ error: err.message });
    }
  });

  router.post("/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = db.findFullUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.json({
      token: user.id,
      user: db.findUserById(user.id),
    });
  });

  router.get("/auth/me", requireAuth(), (req: Request, res: Response) => {
    return res.json({ user: (req as any).user });
  });

  // Profile update
  router.put("/auth/profile", requireAuth(), (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name, phone, college } = req.body;

    try {
      const updated = db.updateUser(user.id, { name, phone , college });
      return res.json({ user: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Superadmin exclusive RBAC control: promote/demote users
  router.post("/auth/assign-role", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: "userId and role are required" });
    }

    if (!["student", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    try {
      const updated = db.updateUserRole(userId, role);
      
      // Notify client that role has updated (real-time notification structure match!)
      broadcast("role-update", { userId, role });
      
      return res.json({ user: updated });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  // Fetch list of users for role management (Admin/Superadmin only)
  router.get("/users", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    return res.json({ users: db.getUsers() });
  });

  // --- Events & Workshops CRUD ---
  router.get("/events", (req: Request, res: Response) => {
    return res.json({ events: db.getEvents() });
  });

  router.post("/events", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    const { title, description, type, speaker, speakerTitle, speakerCompany, timeSlot, day, startHour, endHour, venue, price, capacity, allocatedBudget } = req.body;

    if (!title || !type || !timeSlot || day === undefined || startHour === undefined || endHour === undefined || !venue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const newEvent = db.createEvent({
        title,
        description: description || "",
        type,
        speaker: speaker || "TBA",
        speakerTitle: speakerTitle || "",
        speakerCompany: speakerCompany || "",
        timeSlot,
        day,
        startHour: Number(startHour),
        endHour: Number(endHour),
        venue,
        price: Number(price || 0),
        capacity: Number(capacity || 100),
        allocatedBudget: Number(allocatedBudget || 0),
      });

      broadcast("events-updated", newEvent);
      return res.status(201).json({ event: newEvent });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.put("/events/:id", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const updated = db.updateEvent(id, updates);
      broadcast("events-updated", updated);
      return res.json({ event: updated });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  router.delete("/events/:id", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      db.deleteEvent(id);
      broadcast("events-updated", { id, deleted: true });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  // --- Itinerary / Schedule Registrations Builder ---
  router.post("/events/:id/register", requireAuth(), (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    const event = db.findEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Event or Workshop not found" });
    }

    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ error: "Event has reached maximum target capacity" });
    }

    const fullUser = db.findFullUserByEmail(user.email)!;
    
    // Check if user is already registered for this event
    const isRegistered = event.type === "event" 
      ? fullUser.registeredEvents.includes(id)
      : fullUser.registeredWorkshops.includes(id);

    if (isRegistered) {
      return res.status(400).json({ error: `Already registered for this ${event.type}` });
    }

    // Checking scheduling conflict against user's current timeline
    const currentSchedule = fullUser.itinerary.map(itemId => db.findEventById(itemId)).filter(Boolean) as ScheduleItem[];
    const hasConflict = currentSchedule.some(item => {
      if (item.day !== event.day) return false;
      // Overlap checking: startA < endB && startB < endA
      return event.startHour < item.endHour && item.startHour < event.endHour;
    });

    if (hasConflict) {
      return res.status(400).json({ 
        error: "Scheduling Conflict: This time slot overlaps with another event in your current itinerary." 
      });
    }

    // Registration Process
    try {
      if (event.price > 0) {
        // Requires payment gateway transaction workflow first!
        // Direct registration blocked: client is routed to checkout payments
        return res.status(402).json({ 
          error: "Fee required. Redirecting to Sandbox payment gateway.",
          price: event.price,
          eventId: event.id
        });
      }

      // Free events are registered immediately
      const updatedUser = db.updateUser(user.id, {
        registeredEvents: event.type === "event" ? [...fullUser.registeredEvents, id] : fullUser.registeredEvents,
        registeredWorkshops: event.type === "workshop" ? [...fullUser.registeredWorkshops, id] : fullUser.registeredWorkshops,
        itinerary: [...fullUser.itinerary, id],
      });

      // Update event registered list
      db.updateEvent(event.id, { registeredCount: event.registeredCount + 1 });
      
      broadcast("events-updated", db.findEventById(event.id));

      return res.json({ success: true, user: updatedUser });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // Cancel Event/Workshop registration
  router.post("/events/:id/cancel", requireAuth(), (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (req as any).user;

    const event = db.findEventById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const fullUser = db.findFullUserByEmail(user.email)!;

    try {
      const updatedUser = db.updateUser(user.id, {
        registeredEvents: fullUser.registeredEvents.filter(eId => eId !== id),
        registeredWorkshops: fullUser.registeredWorkshops.filter(wId => wId !== id),
        itinerary: fullUser.itinerary.filter(itemId => itemId !== id),
      });

      db.updateEvent(event.id, { registeredCount: Math.max(0, event.registeredCount - 1) });
      
      broadcast("events-updated", db.findEventById(event.id));

      return res.json({ success: true, user: updatedUser });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // --- Merchandise CRUD ---
  router.get("/merchandise", (req: Request, res: Response) => {
    return res.json({ merchandise: db.getMerchandise() });
  });

  router.post("/merchandise", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    const { name, description, price, imageUrl, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing name, price or stock specifiers" });
    }

    try {
      const newItem = db.createMerchandise({
        name,
        description: description || "",
        price: Number(price),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
        stock: Number(stock),
      });

      broadcast("merchandise-updated", newItem);
      return res.status(201).json({ item: newItem });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.put("/merchandise/:id", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const updated = db.updateMerchandise(id, updates);
      broadcast("merchandise-updated", updated);
      return res.json({ item: updated });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  router.delete("/merchandise/:id", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      db.deleteMerchandise(id);
      broadcast("merchandise-updated", { id, deleted: true });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  // --- Broadcast Messaging Endpoints ---
  router.get("/notifications", (req: Request, res: Response) => {
    return res.json({ notifications: db.getNotifications() });
  });

  router.post("/notifications", requireAuth(["admin", "superadmin"]), (req: Request, res: Response) => {
    const { title, message } = req.body;
    const user = (req as any).user;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required fields" });
    }

    try {
      const notif = db.createNotification(title, message, `${user.name} (${user.role === 'superadmin' ? 'Superadmin' : 'Admin'})`);
      
      // Deliver the announcement to all active Server-Sent Events SSE clients in real-time
      broadcast("notification", notif);

      return res.status(201).json({ notification: notif });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // --- Financial Controls & Budget Override (Superadmin only) ---
  router.get("/finance/summary", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    const summary = db.getFinancialSummary();
    const budgetPool = db.getBudgetPool();
    return res.json({ summary, budgetPool });
  });

  router.post("/finance/pool", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    const { amount } = req.body;
    if (amount === undefined || isNaN(amount)) {
      return res.status(400).json({ error: "Valid budget pool total is required" });
    }

    try {
      const resultPool = db.adjustBudgetPool(Number(amount));
      const summary = db.getFinancialSummary();
      broadcast("finance-updated", { budgetPool: resultPool, summary });
      return res.json({ budgetPool: resultPool, summary });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.get("/transactions", requireAuth(["superadmin"]), (req: Request, res: Response) => {
    return res.json({ transactions: db.getTransactions() });
  });

  router.get("/transactions/my", requireAuth(), (req: Request, res: Response) => {
    const user = (req as any).user;
    const txList = db.getTransactions().filter(t => t.userId === user.id);
    return res.json({ transactions: txList });
  });

  // --- Sandbox Payment Initiation Checkout Flow ---
  router.post("/payments/checkout", requireAuth(), (req: Request, res: Response) => {
    const user = (req as any).user;
    const { type, itemId, amount, itemName } = req.body;

    if (!type || !itemId || amount === undefined || isNaN(amount) || !itemName) {
      return res.status(400).json({ error: "Missing required request parameters" });
    }

    try {
      // Validate inventory if purchasing merchandise
      if (type === "merchandise") {
        const item = db.getMerchandise().find((m) => m.id === itemId);
        if (!item) {
          return res.status(404).json({ error: "Merchandise item not found" });
        }
        if (item.stock < 1) {
          return res.status(400).json({ error: `Stock exhausted for ${item.name}. Overselling prevented.` });
        }
      } else {
        // Validate capacity if registering ticket
        const event = db.findEventById(itemId);
        if (!event) {
          return res.status(404).json({ error: "Event or Workshop not found" });
        }
        if (event.registeredCount >= event.capacity) {
          return res.status(400).json({ error: `Seats full for ${event.title}.` });
        }
      }

      // Create a pending transaction
      const tx = db.createPendingTransaction(user.id, type, itemId, Number(amount), itemName);

      return res.status(201).json({ transaction: tx });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // --- Sandbox Payment Webhook Listener ---
  // Webhooks are highly secure triggers simulating third-party payment delivery (Stripe/Razorpay)
  router.post("/payments/webhook", (req: Request, res: Response) => {
    const { transactionId, success } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: "transactionId is required" });
    }

    try {
      const completedTx = db.completeTransaction(transactionId, success === true);
      
      // Live announcements to active clients that payment has completed or failed!
      broadcast("payment-processed", { transaction: completedTx, userId: completedTx.userId });

      return res.json({ success: true, transaction: completedTx });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  return router;
}
