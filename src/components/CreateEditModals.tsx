import React, { useState, useEffect } from "react";
import { ScheduleItem, MerchandiseItem } from "../types";
import { api } from "../lib/api";
import { X, Calendar, DollarSign, Users, Award, MapPin, Tag } from "lucide-react";

interface CreateEditEventModalProps {
  eventToEdit?: ScheduleItem | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function CreateEditEventModal({ eventToEdit, onSuccess, onClose }: CreateEditEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"event" | "workshop">("event");
  const [speaker, setSpeaker] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerCompany, setSpeakerCompany] = useState("");
  const [day, setDay] = useState<1 | 2>(1);
  const [timeSlot, setTimeSlot] = useState("");
  const [startHour, setStartHour] = useState("9.0");
  const [endHour, setEndHour] = useState("10.5");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("0");
  const [capacity, setCapacity] = useState("100");
  const [allocatedBudget, setAllocatedBudget] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setType(eventToEdit.type);
      setSpeaker(eventToEdit.speaker);
      setSpeakerTitle(eventToEdit.speakerTitle);
      setSpeakerCompany(eventToEdit.speakerCompany);
      setDay(eventToEdit.day);
      setTimeSlot(eventToEdit.timeSlot);
      setStartHour(eventToEdit.startHour.toString());
      setEndHour(eventToEdit.endHour.toString());
      setVenue(eventToEdit.venue);
      setPrice(eventToEdit.price.toString());
      setCapacity(eventToEdit.capacity.toString());
      setAllocatedBudget(eventToEdit.allocatedBudget.toString());
    } else {
      setTimeSlot("Day 1, 09:00 AM - 10:30 AM");
      setVenue("Grand Apex Hall Room A");
    }
  }, [eventToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !venue || !timeSlot) {
      setErrorMsg("Please complete all requested schema descriptors.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      title,
      description,
      type,
      speaker: speaker || "TBA",
      speakerTitle,
      speakerCompany,
      day: Number(day) as 1 | 2,
      timeSlot,
      startHour: Number(startHour),
      endHour: Number(endHour),
      venue,
      price: Number(price),
      capacity: Number(capacity),
      allocatedBudget: Number(allocatedBudget),
    };

    try {
      if (eventToEdit) {
        await api.updateEvent(eventToEdit.id, payload);
      } else {
        await api.createEvent(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Endpoint error updating database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg border border-cyber-border bg-cyber-dark rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b border-cyber-border/80">
          <h3 className="text-sm font-semibold tracking-wider font-display text-slate-200">
            {eventToEdit ? "EDIT SUMMIT AGENDA ITEM" : "CREATE NEW SUMMIT AGENDA ITEM"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl mt-3 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 font-mono text-[11px]">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Agenda Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Keynote Panel: AI Startups Decentralized"
              className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500/40"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Synopsis Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed outline of this session..."
              className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500/40 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Session Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
              >
                <option value="event">Main Stage Event</option>
                <option value="workshop">Technical Workshop</option>
              </select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Price ($ USD, 0 for Free)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Speaker info group */}
          <div className="border border-cyber-border/60 rounded-xl p-4 bg-cyber-card/10 flex flex-col gap-3">
            <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Speaker / Mentor Details
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-500 uppercase">Speaker Name</label>
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="e.g. Sam Altman"
                  className="w-full bg-cyber-black border border-cyber-border rounded-lg px-2.5 py-2 text-slate-300 text-[10px] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-500 uppercase">Title / Rank</label>
                <input
                  type="text"
                  value={speakerTitle}
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  placeholder="e.g. CEO"
                  className="w-full bg-cyber-black border border-cyber-border rounded-lg px-2.5 py-2 text-slate-300 text-[10px] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-slate-500 uppercase">Affiliation</label>
                <input
                  type="text"
                  value={speakerCompany}
                  onChange={(e) => setSpeakerCompany(e.target.value)}
                  placeholder="e.g. OpenAI"
                  className="w-full bg-cyber-black border border-cyber-border rounded-lg px-2.5 py-2 text-slate-300 text-[10px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Logistics scheduling coordinates and Overlap checkers */}
          <div className="grid grid-cols-3 gap-3 border border-cyber-border/60 rounded-xl p-4 bg-cyber-card/10">
            <div className="flex flex-col gap-1">
              <label className="text-[8px] text-cyan-400 font-bold uppercase">Summit Day</label>
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value) as any)}
                className="w-full bg-cyber-black border border-cyber-border rounded-lg p-2 text-[10px] text-slate-200"
              >
                <option value={1}>Day 1 Agenda</option>
                <option value={2}>Day 2 Agenda</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-12 sm:col-span-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] text-cyan-400 font-bold uppercase">Overlap Conflict Check hours (0.0 to 24.0)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    step="0.5"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    placeholder="Start, e.g. 10.5"
                    className="w-1/2 bg-cyber-black border border-cyber-border rounded-lg p-2 text-[10px] text-slate-200"
                    title="Start: 13.5 signifies 1:30 PM"
                  />
                  <span className="text-slate-500 font-bold">to</span>
                  <input
                    type="number"
                    step="0.5"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    placeholder="End, e.g. 12.0"
                    className="w-1/2 bg-cyber-black border border-cyber-border rounded-lg p-2 text-[10px] text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Visual slot & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Time Slot Label</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="e.g. Day 1, 10:30 AM - 12:00 PM"
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Venue Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Arena Hall C"
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stats: Capacity and Allocated Budget (Superadmin overrides) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Seat Capacity</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Allocated Budget ($ USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={allocatedBudget}
                  onChange={(e) => setAllocatedBudget(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-cyber-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-cyber-border text-slate-400 hover:text-slate-200 transition-colors font-display text-xs cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-cyber-black text-xs font-bold font-display uppercase tracking-wider transition-colors hover:bg-cyan-400"
            >
              {isSubmitting ? "PROCESSING..." : eventToEdit ? "APPLY MODIFICATIONS" : "SPAWN AGENDA ROUTE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------

interface CreateMerchandiseModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function CreateMerchandiseModal({ onSuccess, onClose }: CreateMerchandiseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("25");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("50");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      setErrorMsg("Please populate name, price, and initial stock quantities.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await api.createMerchandise({
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
        stock: Number(stock),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Endpoint error updating souvenirs database.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md border border-cyber-border bg-cyber-dark rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center pb-4 border-b border-cyber-border/80">
          <h3 className="text-sm font-semibold tracking-wider font-display text-slate-200 flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" /> STOCK SOUVENIR CATALOG
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl mt-3 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 font-mono text-[11px]">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Souvenir Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. APEX Cyber Matte Grip Band"
              className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Product Bio</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Features, material details, dimensions..."
              className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Retail Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-cyber-black border border-cyber-border rounded-xl pl-8 pr-4 py-2.5 text-slate-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Inital Stock */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Initial Stock Qty</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-2.5 text-slate-300 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Image URL with placeholder guidance */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Mock Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. https://images.unsplash.com/..."
              className="w-full bg-cyber-black border border-cyber-border rounded-xl px-4 py-3 text-slate-300 focus:outline-none text-[10px]"
            />
            <span className="text-[9px] text-slate-500">Leaving blank injects the standard silicon matrix tee placeholder.</span>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-cyber-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl border border-cyber-border text-slate-400 hover:text-slate-200 transition-colors font-display text-xs cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-cyber-black text-xs font-bold font-display uppercase tracking-wider transition-colors hover:bg-cyan-400"
            >
              {isSubmitting ? "PACKING..." : "COMMIT STOCK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
