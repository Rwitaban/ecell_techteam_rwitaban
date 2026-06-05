/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScheduleItem, User } from "../types";
import { Download, Calendar, MapPin, Printer, ShieldCheck, Mail, Globe, Award, Sparkles, Terminal } from "lucide-react";

interface ItineraryPreviewProps {
  user: User;
  events: ScheduleItem[];
}

export default function ItineraryPreview({ user, events }: ItineraryPreviewProps) {
  // Filter and sort items dynamically
  const userItems = events
    .filter((e) => user.itinerary.includes(e.id))
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.startHour - b.startHour;
    });

  const studentEvents = userItems.filter((item) => item.type === "event");
  const studentWorkshops = userItems.filter((item) => item.type === "workshop");
  const totalFeesPaid = userItems.reduce((sum, item) => sum + item.price, 0);

  const triggerPrintBadge = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6" id="itinerary-preview-portal">
      {/* Visual Analytics Ribbon */}
      <div className="grid grid-cols-3 gap-4 border border-cyber-border bg-cyber-card/10 rounded-2xl p-4 font-mono">
        <div className="flex flex-col text-center border-r border-cyber-border/60">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Enrolled Events</span>
          <span className="text-xl font-bold text-cyan-400 mt-1">{studentEvents.length}</span>
        </div>
        <div className="flex flex-col text-center border-r border-cyber-border/60">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Master Workshops</span>
          <span className="text-xl font-bold text-cyber-purple mt-1">{studentWorkshops.length}</span>
        </div>
        <div className="flex flex-col text-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Captured Fees</span>
          <span className="text-xl font-bold text-emerald-400 mt-1">${totalFeesPaid.toFixed(2)}</span>
        </div>
      </div>

      {userItems.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-cyber-border/60 bg-cyber-card/10 text-slate-500 text-xs font-mono">
          Your itinerary is currently empty. Explore the Schedule and register for panels or masterclasses to populate this chronological roadmap!
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Chronological Vertical Timeline */}
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-display text-slate-400 flex items-center gap-1.5 font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" /> Chronology Checklist
            </h3>

            <div className="relative border-l-2 border-cyber-border/80 pl-6 ml-3 py-2 flex flex-col gap-6">
              {userItems.map((item, index) => (
                <div key={item.id} className="relative group" id={`itinerary-item-${item.id}`}>
                  {/* Glowing vertical node */}
                  <div className={`absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-cyber-black transition-colors duration-300 ${
                    item.type === "workshop"
                      ? "border-purple-500 group-hover:bg-purple-500"
                      : "border-cyan-400 group-hover:bg-cyan-500"
                  }`}>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </div>

                  <div className="p-4 rounded-xl border border-cyber-border bg-cyber-card/30 group-hover:bg-cyber-card/50 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase">
                        Day {item.day} • {item.timeSlot.replace("Day 1, ", "").replace("Day 2, ", "")}
                      </span>
                      <span className={`text-[8px] font-bold font-mono uppercase px-1.5 py-0.2 rounded border ${
                        item.type === "workshop"
                          ? "border-purple-500/20 text-purple-400 bg-purple-950/10"
                          : "border-cyan-500/20 text-cyan-400 bg-cyan-950/10"
                      }`}>
                        {item.type}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-200 mt-1">{item.title}</h4>
                    
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-500" /> {item.speaker}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.venue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Holographic Entry Badge Card */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider font-display text-slate-400 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> COMPILER ACCESS SLIP
            </h3>

            {/* Print Friendly High-fidelity Wallet Badge */}
            <div 
              className="relative rounded-2xl border border-dashed border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-purple-950/20 p-5 shadow-2xl overflow-hidden text-center print:border-black print:text-black print:bg-white"
              id="printable-apex-badge"
            >
              {/* Mesh decoration elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="border-b border-cyber-border/80 print:border-black pb-4">
                <span className="text-[9px] font-bold tracking-widest font-mono text-cyan-400 print:text-black block">E-CELL APEX SUMMIT '26</span>
                <span className="text-xs font-semibold tracking-wider font-display text-slate-100 print:text-black mt-1 block">OFFICIAL PORTAL ACCESS</span>
              </div>

              {/* Hologram Badge avatar */}
              <div className="my-5 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl border border-cyan-500/30 print:border-black bg-cyber-black/70 flex items-center justify-center font-mono font-bold text-lg text-slate-100 shadow-inner">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <h4 className="text-xs font-semibold text-slate-200 print:text-black mt-3 font-display uppercase tracking-wide">{user.name}</h4>
                <p className="text-[10px] text-slate-400 print:text-black mt-1 font-mono">{user.college || "Acknowledge Participant"}</p>
              </div>

              {/* Pass barcode representation list */}
              <div className="bg-cyber-black/60 p-3 rounded-xl border border-cyber-border font-mono text-[9px] flex flex-col gap-1.5 text-left text-slate-400 print:border-black print:text-black">
                <div className="flex justify-between">
                  <span>SYSTEM UNIQUE ID:</span>
                  <span className="text-slate-200 print:text-black font-semibold uppercase">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURITY ROLE:</span>
                  <span className="text-cyan-400 print:text-black font-semibold uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL PASSES:</span>
                  <span className="text-slate-200 print:text-black font-semibold">{userItems.length} Enrolls</span>
                </div>
              </div>

              {/* Pseudo Barcode */}
              <div className="mt-5 pt-3 border-t border-cyber-border/40 print:border-black flex flex-col items-center gap-1 select-none">
                <div className="flex gap-[1.5px] h-8 items-center bg-slate-300 p-1.5 rounded">
                  <div className="w-1 bg-black h-full" />
                  <div className="w-[1.5px] bg-black h-full" />
                  <div className="w-[3px] bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-1 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-1.5 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-2 bg-black h-full" />
                  <div className="w-1 bg-black h-full" />
                  <div className="w-0.5 bg-black h-full" />
                  <div className="w-[3px] bg-black h-full" />
                  <div className="w-1 bg-black h-full" />
                  <div className="w-[1.5px] bg-black h-full" />
                </div>
                <span className="text-[8px] font-mono text-slate-500 uppercase">*{user.id}-APEX26*</span>
              </div>
            </div>

            {/* Print and Export commands */}
            <button
              onClick={triggerPrintBadge}
              className="w-full py-2.5 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-950/10 hover:bg-cyan-950/20 text-cyan-400 text-xs font-semibold tracking-wider uppercase transition-colors duration-300 font-display flex items-center justify-center gap-2 cursor-pointer"
              id="btn-print-slip"
            >
              <Printer className="w-4 h-4" />
              PRINT PASS COMPILER PDF
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
