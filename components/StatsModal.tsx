"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Sparkles } from "lucide-react";
import { SiteStats } from "@/lib/types";

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stats: SiteStats) => void;
  currentStats: SiteStats;
  hotelCount?: number;
}

export default function StatsModal({
  isOpen,
  onClose,
  onSave,
  currentStats,
  hotelCount,
}: StatsModalProps) {
  const [satisfactionRate, setSatisfactionRate] = useState(
    currentStats.satisfactionRate || "4.8 / 5.0"
  );
  const [tariffPledge, setTariffPledge] = useState(currentStats.tariffPledge || "100%");
  const [avgResponseTime, setAvgResponseTime] = useState(
    currentStats.avgResponseTime || "20 Min"
  );

  useEffect(() => {
    setSatisfactionRate(currentStats.satisfactionRate || "4.8 / 5.0");
    setTariffPledge(currentStats.tariffPledge || "100%");
    setAvgResponseTime(currentStats.avgResponseTime || "20 Min");
  }, [currentStats, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      verifiedStays: currentStats.verifiedStays || (hotelCount ? `${hotelCount}+` : "6+"),
      satisfactionRate: satisfactionRate.trim() || "4.8 / 5.0",
      tariffPledge: tariffPledge.trim() || "100%",
      avgResponseTime: avgResponseTime.trim() || "20 Min",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Update Homepage Metrics & Stats
              </h2>
              <p className="text-xs text-slate-500">
                Displayed prominently on the live public portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Automatic Inventory Status Banner */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Live Hotel Inventory
              </span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {currentStats.verifiedStays || (hotelCount ? `${hotelCount}+` : "6+")} Verified Stays
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              ⚡ Auto-Managed
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Guest Satisfaction Rating
            </label>
            <input
              type="text"
              required
              value={satisfactionRate}
              onChange={(e) => setSatisfactionRate(e.target.value)}
              placeholder="e.g. 4.9 / 5.0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Direct Tariff Pledge
            </label>
            <input
              type="text"
              required
              value={tariffPledge}
              onChange={(e) => setTariffPledge(e.target.value)}
              placeholder="e.g. 100% or Direct Front-Desk"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Average WhatsApp Response Time
            </label>
            <input
              type="text"
              required
              value={avgResponseTime}
              onChange={(e) => setAvgResponseTime(e.target.value)}
              placeholder="e.g. 15 Min or Instant"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save Counters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
