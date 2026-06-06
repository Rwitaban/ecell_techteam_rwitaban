import React, { useState, useEffect } from "react";
import { User, ScheduleItem, MerchandiseItem, Transaction } from "./types";
import { api, clearSession, getStoredUser } from "./lib/api";
import NotificationCenter from "./components/NotificationCenter";
import PaymentGateway from "./components/PaymentGateway";
import ScheduleBuilder from "./components/ScheduleBuilder";
import ItineraryPreview from "./components/ItineraryPreview";
import MerchandiseStore from "./components/MerchandiseStore";
import FinanceDashboard from "./components/FinanceDashboard";
import BroadcastAnnouncementPanel from "./components/BroadcastAnnouncementPanel";
import { CreateEditEventModal, CreateMerchandiseModal } from "./components/CreateEditModals";
import { Terminal, Shield, LogOut, Code, User as UserIcon, BookOpen, Layers, DollarSign, Activity, FileText, Smartphone } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<ScheduleItem[]>([]);
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [activeTab, setActiveTab] = useState<"narrative" | "schedule" | "itinerary" | "souvenirs" | "admin" | "superadmin">("narrative");
  const [allUsers, setAllUsers] = useState<User[]>([]);

 
  const [isLogin, setIsLogin] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCollege, setAuthCollege] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);


  const [activeCheckoutTx, setActiveCheckoutTx] = useState<Transaction | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [isCreateMerchOpen, setIsCreateMerchOpen] = useState(false);


  const loadMainCatalogFeeds = async () => {
    try {
      const allEvents = await api.getEvents();
      setEvents(allEvents);

      const allMerch = await api.getMerchandise();
      setMerchandise(allMerch);
    } catch (err) {
      console.error("Failed to load timeline catalog feeds:", err);
    }
  };

  const loadProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  };

  const loadAllUsersList = async () => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    try {
      const list = await api.getUsersList();
      setAllUsers(list);
    } catch {
      
    }
  };

  
  useEffect(() => {
    loadMainCatalogFeeds();
    const loaded = getStoredUser();
    if (loaded) {
      loadProfile();
    }
  }, []);


  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "superadmin")) {
      loadAllUsersList();
    }
  }, [user]);

  const handleQuickLogin = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      setActiveTab("schedule");
    } catch (err: any) {
      setAuthError(err.message || "Invalid authentication credits.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      if (isLogin) {
        
        const data = await api.login(authEmail, authPassword);
        setUser(data.user);
        setActiveTab("schedule");
      } else {
  
        const data = await api.register({
          email: authEmail,
          password: authPassword,
          name: authName,
          college: authCollege,
          phone: authPhone,
        });
        setUser(data.user);
        setActiveTab("schedule");
      }
      
  
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthCollege("");
      setAuthPhone("");
    } catch (err: any) {
      setAuthError(err.message || "Failed to onboard profile card.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setActiveTab("narrative");
  };

  const triggerSandboxCheckout = async (type: "ticket" | "merchandise", itemId: string, amount: number, itemName: string) => {
    try {
      const pendingTx = await api.initiateCheckout(type, itemId, amount, itemName);
      setActiveCheckoutTx(pendingTx);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between cyber-grid py-4 relative selection:bg-cyan-500 selection:text-black" id="apex-portal-root">
      
   
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />


      <div className="w-full max-w-7xl mx-auto px-4 xl:px-6 flex-1 flex flex-col gap-6 z-15 relative">
        

        <header className="flex flex-col sm:flex-row justify-between items-center bg-cyber-dark/80 backdrop-blur-md rounded-2xl border border-cyber-border/80 px-6 py-4 gap-4" id="global-navbar">
          
  
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyber-purple rounded-xl flex items-center justify-center font-bold text-lg text-cyber-black shadow-lg">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold font-display tracking-widest text-slate-100 uppercase">APEX SUMMIT '26</h1>
                <span className="text-[9px] font-mono font-semibold uppercase px-1.5 py-0.2 rounded border border-cyan-500/20 text-cyan-400 bg-cyan-950/15">
                  FLAGSHIP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">E-Cell High-Profile Developer Gateways</p>
            </div>
          </div>

          
          <div className="flex flex-wrap gap-1.5 bg-cyber-black p-1 rounded-xl border border-cyber-border/60" id="navbar-links">
            <button
              onClick={() => setActiveTab("narrative")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                activeTab === "narrative" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                activeTab === "schedule" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Timelines
            </button>
            <button
              onClick={() => setActiveTab("souvenirs")}
              className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                activeTab === "souvenirs" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
              }`}
            >
              Souvenirs Stock
            </button>
            
            {user && (
              <button
                onClick={() => setActiveTab("itinerary")}
                className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                  activeTab === "itinerary" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Itinerary slip
              </button>
            )}

            {user && (user.role === "admin" || user.role === "superadmin") && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                  activeTab === "admin" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Admin
              </button>
            )}

            {user && (user.role === "superadmin") && (
              <button
                onClick={() => setActiveTab("superadmin")}
                className={`px-3 py-2 rounded-lg text-[10px] font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                  activeTab === "superadmin" ? "text-cyan-400 bg-cyber-card" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                Financials
              </button>
            )}
          </div>

          {/* Connected state & Notifications and Logouts */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0" id="user-onboarding-panel">
            
            {/* Realtime channel widget */}
            <NotificationCenter
              onRefreshEvents={loadMainCatalogFeeds}
              onRefreshFinance={loadProfile}
              onRefreshUser={loadProfile}
            />

            {user ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-cyber-border font-mono text-[10px]">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold font-display text-slate-200">{user.name}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">{user.role} badge</div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-lg border border-rose-500/20 bg-rose-950/15 text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Logout Session"
                  id="btn-logout-session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("narrative")}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-cyber-black text-[10px] font-extrabold uppercase tracking-wider font-display hover:bg-cyan-400 cursor-pointer shadow-md"
              >
                AUTHENTICATE
              </button>
            )}
          </div>
        </header>

        {/* Primary Page Layouts */}
        <main className="flex-1 flex flex-col gap-6" id="apex-main-view">
          
          {/* View 1: Narrative & Onboarding Landing Page */}
          {activeTab === "narrative" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="narrative-onboarding-view">
              
              {/* Left Column: Visual branding message (Column 7) */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-6 p-5">
                <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2 animate-pulse">
                  <Activity className="w-4 h-4 text-cyan-400" /> APEX-26 CONCURRENCY TERMINAL
                </span>
                
                <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight text-slate-100 uppercase" id="summit-headline">
                  The Premier Global <span className="cyber-gradient-text">AI-Tech and VC Summit</span> of E-Cell
                </h2>
                
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  Enter the gateway for high-profile business incubators. APEX '26 unites 5,000+ engineers, creators, and angel investors to structure, build, fund, and launch sovereignty systems. Explore chronology timelines, secure seat registrations, collect memories from E-Cell souvenir catalogs and compile printed biometric slips.
                </p>

                {/* Cyber parameters stats tracking list */}
                <div className="grid grid-cols-3 gap-4 text-center border-t border-cyber-border/60 pt-5 mt-2 font-mono">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">5,000+</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-0.5">Live Registrants</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">30+</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-0.5">Venture Funds</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">20+</span>
                    <span className="text-[9px] text-slate-500 uppercase mt-0.5">Incubation Tracks</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Portal Onboarding form with instant evaluation shortcuts (Column 5) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {user ? (
                  <div className="rounded-2xl border border-cyan-500/20 bg-cyber-dark p-6 text-center shadow-2xl flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 flex items-center justify-center font-bold text-lg text-cyan-400">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 font-display">WELCOME BACK, {user.name.toUpperCase()}!</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Status: Secured Authentication - Rank: {user.role.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                      <button
                        onClick={() => setActiveTab("schedule")}
                        className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-cyber-black font-bold uppercase tracking-wider text-xs rounded-xl font-display cursor-pointer"
                      >
                        EXPLORE SCHEDULER
                      </button>
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        className="flex-1 py-3 border border-cyber-border text-slate-300 hover:bg-slate-800 uppercase tracking-wider text-xs rounded-xl font-display cursor-pointer"
                      >
                        MY ACCESS BADGE
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-cyber-border bg-cyber-dark/95 p-6 shadow-2xl" id="auth-portal-card">
                    <div className="flex justify-between items-center pb-3 border-b border-cyber-border/40">
                      <h3 className="text-xs font-extrabold tracking-widest font-mono text-cyan-400 uppercase">
                        {isLogin ? "SECURE CLIENT SIGN IN" : "ONBOARD PARTICIPANT PROFILE"}
                      </h3>
                      <button
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setAuthError("");
                        }}
                        className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase cursor-pointer"
                      >
                        {isLogin ? "REGISTER STUDENT" : "SIGN IN REGISTRANT"}
                      </button>
                    </div>

                    {authError && (
                      <div className="p-3 text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl mt-3 text-xs font-mono">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="mt-4 flex flex-col gap-3 font-mono text-[11px]">
                      
                      {!isLogin && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-500 uppercase tracking-wider">Candidate Name</label>
                            <input
                              type="text"
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="e.g. Siddharth Sharma"
                              className="w-full bg-cyber-black border border-cyber-border rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-500 uppercase tracking-wider">College Affiliation</label>
                            <input
                              type="text"
                              value={authCollege}
                              onChange={(e) => setAuthCollege(e.target.value)}
                              placeholder="e.g. IIT Delhi"
                              className="w-full bg-cyber-black border border-cyber-border rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-slate-500 uppercase tracking-wider">Contact Phone</label>
                            <input
                              type="text"
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              placeholder="e.g. +91 9191919191"
                              className="w-full bg-cyber-black border border-cyber-border rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none"
                              required
                            />
                          </div>
                        </>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 uppercase tracking-wider">Registered Email</label>
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="e.g. student@apex.com"
                          className="w-full bg-cyber-black border border-cyber-border rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-slate-500 uppercase tracking-wider">Password Token</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="e.g. password123"
                          className="w-full bg-cyber-black border border-cyber-border rounded-lg px-3 py-2.5 text-slate-300 focus:outline-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-3 mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-cyber-black text-xs font-bold uppercase tracking-wider rounded-xl font-display transition-colors cursor-pointer"
                      >
                        {authLoading ? "SEEKING HANDSHAKE..." : isLogin ? "COMPLICATE ADMISSION" : "CREATE SECURED RANKING"}
                      </button>
                    </form>

                    {/* Highly Ergonomic Rapid Evaluation Shortcut Buttons (One-Click instant role profiles) */}
                    <div className="mt-5 pt-4 border-t border-cyber-border/40 font-mono text-[10px]">
                      <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Code className="w-3.5 h-3.5" /> Rapid Evaluation shortcuts (One-click Login)
                      </span>
                      <div className="flex flex-col gap-1.5 mt-2">
                        <button
                          onClick={() => handleQuickLogin("superadmin@apex.com", "superadmin123")}
                          className="flex justify-between items-center px-3 py-2 rounded bg-cyber-border hover:bg-slate-800 text-[9px] text-slate-300 cursor-pointer"
                        >
                          <span>Alex Mercer (Superadmin role)</span>
                          <span className="text-[8px] border border-rose-500/30 text-rose-400 bg-rose-950/10 px-1 py-0.2 rounded font-bold uppercase">Superadmin</span>
                        </button>
                        <button
                          onClick={() => handleQuickLogin("admin@apex.com", "admin123")}
                          className="flex justify-between items-center px-3 py-2 rounded bg-cyber-border hover:bg-slate-800 text-[9px] text-slate-300 cursor-pointer"
                        >
                          <span>Elena Rostova (Admin role)</span>
                          <span className="text-[8px] border border-cyan-500/30 text-cyan-400 bg-cyan-950/10 px-1 py-0.2 rounded font-bold uppercase">Admin</span>
                        </button>
                        <button
                          onClick={() => handleQuickLogin("student@apex.com", "student123")}
                          className="flex justify-between items-center px-3 py-2 rounded bg-cyber-border hover:bg-slate-800 text-[9px] text-slate-300 cursor-pointer"
                        >
                          <span>Siddharth Sharma (Student role)</span>
                          <span className="text-[8px] border border-slate-700 text-slate-400 bg-cyber-card px-1 py-0.2 rounded font-bold uppercase">Student</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* View 2: Schedule builder Timeline */}
          {activeTab === "schedule" && (
            <ScheduleBuilder
              events={events}
              user={user}
              onRefreshEvents={loadMainCatalogFeeds}
              onRefreshUser={(updated) => setUser(updated)}
              onTriggerCheckout={triggerSandboxCheckout}
              onOpenCreateModal={() => setIsCreateEventOpen(true)}
              onOpenEditModal={(evt) => setEditingEvent(evt)}
            />
          )}

          {/* View 3: Personalized Itinerary & Printable badgelines */}
          {activeTab === "itinerary" && user && (
            <ItineraryPreview
              user={user}
              events={events}
            />
          )}

          {/* View 4: Merchandise store catalogs */}
          {activeTab === "souvenirs" && (
            <MerchandiseStore
              merch={merchandise}
              user={user}
              onRefreshFinance={loadProfile}
              onTriggerCheckout={triggerSandboxCheckout}
              onOpenCreateModal={() => setIsCreateMerchOpen(true)}
            />
          )}

          {/* View 5: Administrative announcements and notifications broadcaster */}
          {activeTab === "admin" && user && (user.role === "admin" || user.role === "superadmin") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="admin-module-view">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <BroadcastAnnouncementPanel onSuccess={loadMainCatalogFeeds} />
              </div>
              <div className="lg:col-span-8 rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4">
                <div className="pb-3 border-b border-cyber-border/40">
                  <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">EXISTING AGENDA SCHEDULING ROADMAP (CRUD)</h3>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Manage, update, or remove events and technical workshops listed in general schedule catalogs.</p>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1 select-none">
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs font-mono">
                      No events currently listed inside timeline registers.
                    </div>
                  ) : (
                    events.map(evt => (
                      <div key={evt.id} className="p-3.5 bg-cyber-black rounded-xl border border-cyber-border/80 flex items-center justify-between gap-3 font-mono text-[10px]">
                        <div>
                          <span className={`text-[8px] font-bold border py-0.2 px-1 rounded uppercase mr-2 ${
                            evt.type === 'workshop' ? 'border-purple-500/20 text-purple-400' : 'border-cyan-500/20 text-cyan-400'
                          }`}>
                            {evt.type}
                          </span>
                          <span className="text-slate-200 font-sans font-semibold text-xs">{evt.title}</span>
                          <div className="text-slate-500 mt-1 flex gap-3 text-[9px]">
                            <span>Day {evt.day}</span>
                            <span>Venue: {evt.venue}</span>
                            <span>Fees: {evt.price > 0 ? `$${evt.price}` : 'Free'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingEvent(evt)}
                            className="px-2.5 py-1.5 rounded-lg border border-cyber-border text-slate-300 hover:border-cyan-500/40 text-[9px] font-semibold cursor-pointer"
                          >
                            EDIT
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View 6: Financial dashboard telemetry */}
          {activeTab === "superadmin" && user && user.role === "superadmin" && (
            <FinanceDashboard
              onRefreshFinance={loadMainCatalogFeeds}
              registeredUsers={allUsers}
              onRefreshUser={loadAllUsersList}
            />
          )}

        </main>
      </div>

      {/* Global Sandbox Payment stripe-checkout trigger overlay */}
      {activeCheckoutTx && (
        <PaymentGateway
          transaction={activeCheckoutTx}
          onSuccess={(final) => {
            loadMainCatalogFeeds();
            loadProfile();
          }}
          onClose={() => setActiveCheckoutTx(null)}
        />
      )}

      {/* Admin Creator Agenda Modalities */}
      {isCreateEventOpen && (
        <CreateEditEventModal
          onSuccess={loadMainCatalogFeeds}
          onClose={() => setIsCreateEventOpen(false)}
        />
      )}

      {editingEvent && (
        <CreateEditEventModal
          eventToEdit={editingEvent}
          onSuccess={loadMainCatalogFeeds}
          onClose={() => setEditingEvent(null)}
        />
      )}

      {isCreateMerchOpen && (
        <CreateMerchandiseModal
          onSuccess={loadMainCatalogFeeds}
          onClose={() => setIsCreateMerchOpen(false)}
        />
      )}

      {/* Footer disclaimer rails description mapping */}
      <footer className="text-center py-4 border-t border-cyber-border/40 font-mono text-[9px] text-slate-500 selection:bg-rose-500 select-none pointer-events-none mt-6">
        <div>E-CELL FLAGSHIP EVENT APPLICATION • APEX SUMMIT '26 SYSTEM CONTROL PANEL</div>
        <div className="mt-1">All rights of allocation securely administered under RBAC constraints.</div>
      </footer>
    </div>
  );
}
