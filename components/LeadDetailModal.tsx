"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Building,
  Users,
  MessageSquare,
  PhoneCall,
} from "lucide-react";
import { InquiryLead, FollowUpNote } from "@/lib/types";

interface LeadDetailModalProps {
  lead: InquiryLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updated: InquiryLead) => void;
}

export default function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
}: LeadDetailModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <LeadDetailContent
      lead={lead}
      onClose={onClose}
      onUpdateLead={onUpdateLead}
    />
  );
}

function LeadDetailContent({
  lead,
  onClose,
  onUpdateLead,
}: {
  lead: InquiryLead;
  onClose: () => void;
  onUpdateLead: (updated: InquiryLead) => void;
}) {
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const [newNoteText, setNewNoteText] = useState("");
  const [notes, setNotes] = useState<FollowUpNote[]>(lead.notes || []);

  const handleStatusChange = (status: InquiryLead["status"]) => {
    setCurrentStatus(status);
    const updated: InquiryLead = {
      ...lead,
      status,
      notes,
    };
    onUpdateLead(updated);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: FollowUpNote = {
      id: "note-" + Date.now(),
      text: newNoteText.trim(),
      author: "Admin Officer",
      createdAt: "Just now",
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setNewNoteText("");

    const updated: InquiryLead = {
      ...lead,
      status: currentStatus,
      notes: updatedNotes,
    };
    onUpdateLead(updated);
  };

  const whatsappUrl = `https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${lead.customerName}, this is the reservations team for *${lead.hotelName}* in Cherrapunji regarding your booking request for ${lead.checkIn} to ${lead.checkOut}. How may we assist you today?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 my-6">
        {/* Header */}
        <div className="bg-emerald-50/60 px-5 py-3.5 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900">Lead Details: {lead.customerName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Pipeline Selector */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Lead CRM Pipeline Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: "new", label: "1. New Lead", color: "bg-amber-50 text-amber-800 border-amber-300" },
                { id: "contacted", label: "2. Contacted", color: "bg-blue-50 text-blue-800 border-blue-300" },
                { id: "quote_sent", label: "3. Quote Sent", color: "bg-purple-50 text-purple-800 border-purple-300" },
                { id: "converted", label: "4. Converted 🎉", color: "bg-emerald-50 text-emerald-800 border-emerald-400" },
                { id: "cancelled", label: "5. Closed", color: "bg-rose-50 text-rose-800 border-rose-300" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleStatusChange(st.id as InquiryLead["status"])}
                  className={`py-1.5 px-2 rounded-lg font-semibold text-center border transition-all ${
                    currentStatus === st.id
                      ? `${st.color} shadow-xs font-bold ring-2 ring-emerald-200`
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions (WhatsApp & Call) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message on WhatsApp</span>
            </a>
            <a
              href={`tel:${lead.customerPhone}`}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call: {lead.customerPhone}</span>
            </a>
          </div>

          {/* Guest Profile & Trip Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                Guest Info
              </span>
              <p className="flex items-center gap-1.5 text-slate-900 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.customerName}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.customerPhone}</span>
              </p>
              {lead.customerEmail && (
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lead.customerEmail}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                Stay Details
              </span>
              <p className="flex items-center gap-1.5 text-slate-900 font-medium">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.hotelName}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.checkIn} to {lead.checkOut}</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lead.guests.adults} Adults, {lead.guests.children} Children ({lead.roomType || "Standard"})</span>
              </p>
            </div>
          </div>

          {/* Special Requests */}
          {lead.specialRequests && (
            <div className="bg-amber-50/50 border border-amber-200/80 p-3 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                Special Request / Notes
              </span>
              <p className="text-slate-700 leading-relaxed">{lead.specialRequests}</p>
            </div>
          )}

          {/* Follow-up Log */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Internal Follow-up Log ({notes.length})
              </span>
              <span className="text-[10px] text-slate-400">Team private</span>
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Log a call note, tariff discussed, or payment update..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0"
              >
                Log Note
              </button>
            </form>

            <div className="space-y-1.5">
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-emerald-700">{n.author}</span>
                      <span>{n.createdAt}</span>
                    </div>
                    <p className="text-slate-700">{n.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-2 text-[11px]">
                  No internal notes yet. Log customer conversation updates above.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
