/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ScheduleItem, User } from "../types";
import { api } from "../lib/api";
import { Calendar, User2, MapPin, DollarSign, Plus, Trash2, CalendarRange, Clock, Lock, ShieldCheck, Check, RotateCcw, AlertTriangle } from "lucide-react";

interface ScheduleBuilderProps {
  events: ScheduleItem[];
  user: User | null;
  onRefreshEvents: () => void;
  onRefreshUser: (updatedUser: User) => void;
  onTriggerCheckout: (type: "ticket" | "merchandise", itemId: string, amount: number, itemName: string) => void;
  onOpenCreateModal?: () => void;
  onOpenEditModal?: (event: ScheduleItem) => void;
}

export default function ScheduleBuilder({
  events,
  user,
  onRefreshEvents,
  onRefreshUser,
  onTriggerCheckout,
  onOpenCreateModal,
  onOpenEditModal,
}: ScheduleBuilderProps) {
  const [activeTab, setActiveTab] = useState<"all" | "events" | "workshops" | "my">("all");
  const [dayFilter, setDayFilter] = useState<0 | 1 | 2>(0); // 0 = all, 1 = Day 1, 2 = Day 2
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const handleRegister = async (event: ScheduleItem) => {
    if (!user) return;
    setLoadingEventId(event.id);
    setConflictWarning(null);

    // Frontend pre-check for overlap conflict to fail fast and give gorgeous visual response
    const currentSchedule = events.filter((e) => user.itinerary.includes(e.id));
    const conflict = currentSchedule.find((item) => {
      if (item.day !== event.day) return false;
      // Overlap formula: startA < endB && startB < endA
      return event.startHour < item.endHour && item.startHour < event.endHour;
    });

    if (conflict) {
      setConflictWarning(`Overlap Conflict: "${event.title}" clashes with your current scheduled item "${conflict.title}"!`);
      setLoadingEventId(null);
      // Remove overlap notice after 8 seconds
      setTimeout(() => setConflictWarning(null), 8000);
      return;
    }

    try {
      // Trigger API registration call
      await api.registerForEvent(event.id);
      
      // Reload timeline and profile data states
      const updatedUser = await api.getProfile();
      onRefreshUser(updatedUser);
      onRefreshEvents();
    } catch (err: any) {
      if (err.message.includes("Sandbox")) {
        // Redirection to payment sandbox gateway
        onTriggerCheckout("ticket", event.id, event.price, event.title);
      } else {
        setConflictWarning(err.message);
        setTimeout(() => setConflictWarning(null), 8000);
      }
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleCancelRegistration = async (event: ScheduleItem) => {
    if (!user) return;
    setLoadingEventId(event.id);
    setConflictWarning(null);

    try {
      const updatedUser = await api.cancelRegistration(event.id);
      onRefreshUser(updatedUser);
      onRefreshEvents();
    } catch (err: any) {
      setConflictWarning(err.message || "Failed to cancel agenda registration.");
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this event/workshop? This is irreversible.")) return;
    try {
      await api.deleteEvent(eventId);
      onRefreshEvents();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // List filtering controllers
  const filteredEvents = events.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeTab === "all" ||
                        (activeTab === "events" && item.type === "event") ||
                        (activeTab === "workshops" && item.type === "workshop") ||
                        (activeTab === "my" && user?.itinerary.includes(item.id));
    
    const matchesDay = dayFilter === 0 || item.day === dayFilter;

    return matchesSearch && matchesType && matchesDay;
  });

  return (
    <div className="flex flex-col gap-6" id="scheduler-panel-container">
      {/* Selection Filter Rails */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center border-b border-cyber-border/40 pb-5">
        
        {/* Navigation Tabs */}
        <div className="flex bg-cyber-black p-1 rounded-xl border border-cyber-border/60 self-start" id="timeline-tabs-rail">
          {(["all", "events", "workshops", "my"] as const).map((tab) => {
            if (tab === "my" && !user) return null; // Only show 'my schedule' for logged-in students
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 font-display cursor-pointer ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-cyan-950/80 to-purple-950/80 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                id={`tab-${tab}`}
              >
                {tab === "my" ? "✨ My Schedule" : tab}
              </button>
            );
          })}
        </div>

        {/* Day Filters */}
        <div className="flex gap-2" id="day-tabs-rail">
          {([0, 1, 2] as const).map((day) => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all duration-300 border cursor-pointer ${
                dayFilter === day
                  ? "border-cyan-500/40 bg-cyan-950/10 text-cyan-400"
                  : "border-cyber-border/50 bg-cyber-card/20 text-slate-400 hover:text-slate-200"
              }`}
            >
              {day === 0 ? "All Days" : `Day ${day} ONLY`}
            </button>
          ))}
        </div>

        {/* Text Filter Input */}
        <div className="relative flex-1 max-w-sm" id="timeline-search-field">
          <input
            type="text"
            placeholder="Search keywords, speakers, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-mono bg-cyber-card border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500/60 transition-colors"
          />
        </div>

        {/* Admin Event Builder Creator */}
        {user && (user.role === "admin" || user.role === "superadmin") && onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyber-purple/90 hover:from-cyan-400 hover:to-cyber-purple text-cyber-black text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-950/20"
            id="btn-create-agenda"
          >
            <Plus className="w-4 h-4 text-cyber-black stroke-[3px]" />
            ADD AGENDA ITEM
          </button>
        )}
      </div>

      {/* Overlap & Conflict Toast Warnings */}
      {conflictWarning && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/15 text-rose-400 font-mono text-[11px] flex gap-3 items-center shadow-xl animate-shake" id="conflict-toast-warning">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 animate-bounce" />
          <div className="flex-1 font-sans">
            <strong className="font-display font-medium block">REGISTRATION BLOCKED</strong>
            <span>{conflictWarning}</span>
          </div>
          <button onClick={() => setConflictWarning(null)} className="text-slate-500 hover:text-slate-333 transition-colors text-xs py-0.5 px-1 bg-cyber-border rounded border border-cyber-border">
            CLOSE
          </button>
        </div>
      )}

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="timeline-grid-view">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-16 rounded-2xl border border-dashed border-cyber-border/60 bg-cyber-card/10 text-slate-500 text-xs font-mono">
            No sumit schedule items matched the selected filter states.
          </div>
        ) : (
          filteredEvents.map((item) => {
            const isRegistered = user && (
              item.type === "event" 
                ? user.registeredEvents.includes(item.id)
                : user.registeredWorkshops.includes(item.id)
            );
            
            const isFull = item.registeredCount >= item.capacity;
            const spotsRemaining = Math.max(0, item.capacity - item.registeredCount);

            return (
              <div
                key={item.id}
                className={`relative rounded-2xl border bg-cyber-card/40 p-5 flex flex-col gap-4 group transition-all duration-300 hover:border-cyan-500/30 hover:bg-cyber-card/65 ${
                  isRegistered 
                    ? "border-cyan-500/25 bg-radial-gradient from-cyan-950/5 to-transparent border-l-4 border-l-cyan-400"
                    : "border-cyber-border"
                }`}
                id={`agenda-item-${item.id}`}
              >
                {/* Event Tags Ribbon */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      item.type === "workshop"
                        ? "border-purple-500/30 bg-purple-950/10 text-purple-400"
                        : "border-cyan-500/30 bg-cyan-950/10 text-cyan-400"
                    }`}>
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono border border-cyber-border px-2 py-0.5 rounded text-slate-400">
                      Day {item.day}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    {item.price > 0 ? (
                      <span className="text-cyan-400 font-bold bg-cyan-950/20 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {item.price}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded">
                        FREE ACCESS
                      </span>
                    )}

                    {/* Quick registration flag */}
                    {isRegistered && (
                      <span className="text-cyan-300 bg-cyan-950/20 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-sans text-[9px] uppercase font-bold">
                        <Check className="w-3 h-3 text-cyan-400 stroke-[3]" />
                        REGISTERED
                      </span>
                    )}
                  </div>
                </div>

                {/* Event core summary details */}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold tracking-wide font-display text-slate-200 mt-1 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-mono">
                    {item.description}
                  </p>
                </div>

                {/* Event logistical stats */}
                <div className="grid grid-cols-2 gap-3.5 pt-3.5 border-t border-cyber-border/40 text-slate-400 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <User2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate" title={`${item.speaker} (${item.speakerTitle})`}>
                      {item.speaker}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">
                      {item.timeSlot.replace("Day 1, ", "").replace("Day 2, ", "")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate" title={item.venue}>
                      {item.venue}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {spotsRemaining === 0 ? (
                        <span className="text-rose-400 font-bold">SEATS SECURED [FULL]</span>
                      ) : (
                        <span>{spotsRemaining} seats left</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Interaction Action Panel */}
                <div className="flex gap-2 mt-2 pt-2 border-t border-cyber-border/20">
                  {user ? (
                    isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(item)}
                        disabled={loadingEventId === item.id}
                        className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 text-xs font-semibold uppercase tracking-wider transition-colors font-display cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {loadingEventId === item.id ? "Processing..." : "Deregister Agenda Slot"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(item)}
                        disabled={loadingEventId === item.id || (isFull && !isRegistered)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-display transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                          isFull
                            ? "bg-cyber-border text-slate-500 border border-cyber-border"
                            : "bg-cyber-border hover:bg-slate-800 text-slate-200 hover:text-cyan-400"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {loadingEventId === item.id 
                          ? "Securing Seat..." 
                          : isFull 
                          ? "Maximum Capacity Achieved" 
                          : item.price > 0 
                          ? `Pay Registration Fee $${item.price}` 
                          : "Add to My Schedule"}
                      </button>
                    )
                  ) : (
                    <div className="text-[11px] text-slate-500 text-center w-full font-mono py-1">
                      Authenticate to build schedule registrations.
                    </div>
                  )}

                  {/* Admin Specific Action Keys */}
                  {user && (user.role === "admin" || user.role === "superadmin") && (
                    <div className="flex gap-1.5">
                      {onOpenEditModal && (
                        <button
                          onClick={() => onOpenEditModal(item)}
                          className="px-3 rounded-xl border border-cyber-border bg-cyber-card hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-xs font-semibold cursor-pointer"
                          title="Edit Event Specs"
                        >
                          EDIT
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 rounded-xl border border-red-500/20 bg-red-950/10 hover:bg-red-950/30 text-red-400 transition-all cursor-pointer"
                        title="Delete Agenda Route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
