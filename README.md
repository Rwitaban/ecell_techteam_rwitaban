# E-Cell APEX Summit '26: High-Profile Concurrency Portal

Welcome to the official developer management console and participant engagement platform of the **E-Cell APEX Summit '26**. This application is structured as a full-stack Web Application built using React (Vite) + Tailwind CSS on the frontend, and Express + Node.js (with automatic TypeScript execution) on the backend. This architecture features a durable file-persisted JSON database engine, secure Role-Based Access Control (RBAC), automatic scheduling collision checks, full financial telemetry data, and Live Server-Sent Events (SSE) broadcasting modules.

---

##  Visual Identity & Design System

The application features a modern **Frosted Glass (Glassmorphism)** theme. Key aesthetic pillars include:
*   **Aesthetic Backgrounds:** Mesh indigo, cyan, and purple radial gradients blurred over a deep slate space.
*   **Glassmorphism Surfaces:** Translucent panels using high opacity drop-shadows combined with intense backdrop-blur effects (`backdrop-blur-md` and `-webkit-backdrop-blur`).
*   **Intentional Contrast & Typography:** Paired high-end sans-serif fonts with JetBrains Mono code tags, and highlighted interactive actions with high-contrast cyan-neon glow overlays.

---

##  Project Directory & File Work Structure

The codebase is engineered with strict separation of concerns, decoupling frontend views, client API bridges, server routes, and the active database persistence layer.

```
├── .env                  # Port, environment settings, and API credentials
├── .env.example          # Generic template file for workspace settings
├── .gitignore            # Excluded build outputs and node_modules
├── db.json               # Active file-based JSON storage (persistence layer)
├── index.html            # Primary single-page HTML entry template
├── metadata.json         # Platform permissions and capabilities definitions
├── package.json          # Dependency specifications, build scripts, and commands
├── server.ts             # Primary full-stack server setup & entry point
├── tsconfig.json         # Strict TypeScript compiler options
├── vite.config.ts        # Vite, Tailwind CSS, and dev-server configuration
└── src/                  # Unified source code repository
    ├── types.ts          # Centralized domain-model typescript interfaces
    ├── main.tsx          # Frontend React DOM mounter
    ├── index.css         # Tailwind directives and Frosted Glass custom utilities
    ├── App.tsx           # Global high-level hub component & tab router
    │
    ├── lib/              # Client Helpers
    │   └── api.ts        # Modular fetch helper targeting backend /api endpoints
    │
    ├── server/           # Pure Server-Side Logic
    │   ├── api.ts        # Standard Express API Router with security middlewares
    │   └── db.ts         # JSON file persistence schema engine & transaction logger
    │
    └── components/       # Interface Sub-Components (Modular design layers)
        ├── BroadcastAnnouncementPanel.tsx  # Admin announcements composer
        ├── CreateEditModals.tsx            # Session & Merchandise CRUD Modal forms
        ├── FinanceDashboard.tsx            # Superadmin telemetry, metrics & charts
        ├── ItineraryPreview.tsx            # PDF/printable personal itinerary passes
        ├── MerchandiseStore.tsx            # Sells, products grid, & checkout gates
        ├── NotificationCenter.tsx          # Real-time SSE alert banner drawer
        ├── PaymentGateway.tsx              # Interactive sandboxed payment gateway
        └── ScheduleBuilder.tsx             # Interactive slot timelines scheduler
```

---

##  Deep Dive: Component & Script Responsibilities

### ⚙️ Server Configuration & Backend Services
*   **`server.ts`**: The system's central nervous system. Configures request logging, loads JSON data engines, exposes API routes at `/api`, and mounts Vite's HMR middleware for smooth local development. In production, it servers the static `dist/` bundle directly.
*   **`src/server/db.ts`**: Custom transactional filesystem database manager. Parses, locks, updates, and writes structure maps atomic state transactions down to `/db.json`. Orchestrates user account passwords, budget charts, and session constraints (e.g. seat capacities).
*   **`src/server/api.ts`**: Features fully modular Express route paths. It handles:
    1.  *Authentication & Session*: Signup, sign-in, and RBAC token authentication.
    2.  *Timeline (CRUD)*: Create, read, update, and schedule events.
    3.  *Store Catalog*: Inventory controls and purchasing pipelines.
    4.  *Transactions & Checkout*: Secure processing and balance sheets audit validation.
    5.  *SSE Stream Endpoint*: Establishes persistent Server-Sent Events pipe back up to clients, immediately flashing broadcasts and updates.

###  Client Applications
*   **`src/App.tsx`**: Governs global portal transitions. Configures high-performance evaluation portals (e.g., student, admin, and superadmin accounts) so developers can cycle roles with ease.
*   **`src/lib/api.ts`**: Exposes simple named asynchronous functions (`login()`, `getEvents()`, `register()`, `postNotification()`, etc.) supporting JSON serialization and custom session headers.
*   **`src/components/NotificationCenter.tsx`**: Securely binds long-running client HTTP connections directly to backend SSE ports. Fired events are immediately serialized to visible notification counters and active toaster panels.
*   **`src/components/FinanceDashboard.tsx`**: Feeds statistics directly into a custom dashboard showing total cash flows, user registries, and capacity metrics.
*   **`src/components/ScheduleBuilder.tsx`**: Compiles visual representations of event timelines split systematically by Summit Day. Offers quick register actions ensuring students never double-book themselves.
*   **`src/components/ItineraryPreview.tsx`**: Formats the student's personal itinerary into a high-visibility, clean passport card with built-in printing styles (`@media print`).

---

##  Execution & Command Reference

Dependencies are pre-compiled and set up for prompt starting. Execute these standard commands from your project root:

```bash
# Install package dependencies
npm install

# Boot development environment (Express + Vite server on Port 3000)
npm run dev

# Run strict TypeScript compiler verification
npm run lint

# Compile and package both backend and frontend code to production bundles
npm run build

# Start production server using compiled files (dist/server.cjs)
npm run start
```

---

##  Security & RBAC Configuration

Role-Based Access Control is enforced on the server. The three supported roles grant the following access:

1.  **Student (Standard User)**: Register a profile, purchase souvenirs, register sessions in personal portfolios, and inspect customized itinerary passes.
2.  **Admin (Intermediate User)**: Unlocks administrative menus. Authorizes session CRUD (creating and editing agenda timelines) and broadcasts global realtime notifications to client terminals.
3.  **Superadmin (Supreme Privilege)**: Full system command. Evaluates all incoming transaction metrics, and audits registered customer ledgers and financial summaries.

##  Some Sneekpeeks into the App
<img width="1469" height="661" alt="Screenshot 2026-06-06 at 10 08 58 PM" src="https://github.com/user-attachments/assets/beff5923-c5a1-4584-b737-4f2a66c98a53" />
<img width="1470" height="662" alt="Screenshot 2026-06-06 at 10 09 12 PM" src="https://github.com/user-attachments/assets/56290a8b-4dd2-4b8e-a2fa-4397487d87f7" />
<img width="1468" height="656" alt="Screenshot 2026-06-06 at 10 09 34 PM" src="https://github.com/user-attachments/assets/4be2d3af-453f-4167-bbb8-c6b9b48f3966" />
<img width="1464" height="655" alt="Screenshot 2026-06-06 at 10 09 45 PM" src="https://github.com/user-attachments/assets/bdc721a0-e20d-419e-90aa-5982d0c6b2dc" />
<img width="1470" height="657" alt="Screenshot 2026-06-06 at 10 10 00 PM" src="https://github.com/user-attachments/assets/830be957-69e7-4667-9f9c-797a30545ff9" />
<img width="1470" height="657" alt="Screenshot 2026-06-06 at 10 10 00 PM 1" src="https://github.com/user-attachments/assets/a2363ae6-4d74-426d-8ae2-5cc2547a5b20" />
<img width="1470" height="665" alt="Screenshot 2026-06-06 at 10 10 11 PM" src="https://github.com/user-attachments/assets/70a1a58c-99fc-4c7a-bd49-197a6ef2cbe4" />

