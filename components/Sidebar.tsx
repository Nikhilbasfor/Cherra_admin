"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  Users2,
  SearchCode,
  Mountain,
  ExternalLink,
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "hotels" | "leads" | "seo";
  setActiveTab: (tab: "dashboard" | "hotels" | "leads" | "seo") => void;
  leadsCount: number;
  hotelsCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  leadsCount,
  hotelsCount,
}: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Overview & Analytics",
      icon: LayoutDashboard,
    },
    {
      id: "hotels",
      label: "Hotels Inventory",
      icon: Building2,
      count: hotelsCount,
    },
    {
      id: "leads",
      label: "CRM Leads & Inquiries",
      icon: Users2,
      count: leadsCount,
    },
    {
      id: "seo",
      label: "SEO & Search Engine Snippets",
      icon: SearchCode,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-2 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Cherra<span className="text-emerald-700">Admin</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Hotel CRM & Inventory
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() =>
                  setActiveTab(item.id as "dashboard" | "hotels" | "leads" | "seo")
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Quick Link */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 hover:text-emerald-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>View Live Website</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>

        <div className="px-2 py-1 text-[11px] text-slate-400">
          <p className="text-slate-700 font-medium">Logged in as Administrator</p>
          <p className="text-[10px]">support@cherrapunjistays.com</p>
        </div>
      </div>
    </aside>
  );
}
