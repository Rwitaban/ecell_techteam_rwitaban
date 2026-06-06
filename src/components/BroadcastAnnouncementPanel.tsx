import React, { useState } from "react";
import { api } from "../lib/api";
import { Megaphone, ShieldAlert, Terminal } from "lucide-react";

interface BroadcastAnnouncementPanelProps {
  onSuccess: () => void;
}

export default function BroadcastAnnouncementPanel({ onSuccess }: BroadcastAnnouncementPanelProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsSending(true);
    setSuccess(false);
    setErrorMsg("");

    try {
      await api.postNotification(title, message);
      setTitle("");
      setMessage("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred broadcasting announcement.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-cyber-border bg-cyber-card/15 p-5 flex flex-col gap-4" id="broadcast-composing-panel">
      <div className="flex items-center gap-2 pb-2 border-b border-cyber-border/40">
        <Megaphone className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-semibold tracking-wider font-display text-slate-200">BROADCAST SUMMIT ANNOUNCEMENT</h3>
      </div>

      <div className="flex items-start gap-2 bg-cyber-black p-3.5 rounded-xl border border-cyber-border/40 text-[10px] text-slate-400 font-sans leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <span>
          A system broadcast immediately transmits live toast banners to all active user portals in real-time, plus appends permanent announcements to event log feeds.
        </span>
      </div>

      {success && (
        <div className="p-3 text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs font-mono">
          Announcement broadcast completed successfully! Live stream terminals informed.
        </div>
      )}

      {errorMsg && (
        <div className="p-3 text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl text-xs font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleBroadcast} className="flex flex-col gap-3 font-mono text-[11px]">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Broadcast Headline</label>
          <input
            type="text"
            placeholder="e.g., Keynote Speaker Delayed for 15 Minutes..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500/40"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Detailed Alert Message</label>
          <textarea
            placeholder="Provide context, room updates, and instructions for summit registrants..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500/40 h-20 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !title || !message}
          className="w-full py-3 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyber-border text-cyber-black font-bold font-display uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Megaphone className="w-3.5 h-3.5 text-cyber-black stroke-[3px]" />
          {isSending ? "BROADCASTING TO TERMINALS..." : "BROADCAST REALTIME ALERT"}
        </button>
      </form>
    </div>
  );
}
