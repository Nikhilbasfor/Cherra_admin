"use client";

import React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Building2,
  Users2,
  SearchCode,
  Compass,
  HelpCircle,
  ExternalLink,
  X,
} from "lucide-react";

export type AdminTab = "dashboard" | "hotels" | "leads" | "attractions" | "faqs" | "seo";

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  leadsCount: number;
  hotelsCount: number;
  attractionsCount?: number;
  faqsCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  leadsCount,
  hotelsCount,
  attractionsCount = 0,
  faqsCount = 0,
  isOpen = false,
  onClose,
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
      id: "attractions",
      label: "Sightseeing Attractions",
      icon: Compass,
      count: attractionsCount,
    },
    {
      id: "faqs",
      label: "FAQs & Guide Q&A",
      icon: HelpCircle,
      count: faqsCount,
    },
    {
      id: "seo",
      label: "SEO & Rich Snippets",
      icon: SearchCode,
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (onClose) {
      onClose();
    }
  };

  const renderNavList = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleSelectTab(item.id as AdminTab)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
  );

  const renderFooter = () => (
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
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4 shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="px-2 py-3 border-b border-slate-100 space-y-1">
            <div className="relative h-9 w-full max-w-[190px]">
              <Image
                src="/images/cherrapunji-hotels-logo-dark.png"
                alt="Cherrapunji Hotels Web"
                fill
                className="object-contain object-left"
              />
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Control Panel & Live CRM
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          {renderNavList()}
        </div>

        {/* Footer */}
        {renderFooter()}
      </aside>

      {/* 2. Mobile Slide-Over Drawer & Backdrop */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Slide-over Drawer */}
        <aside
          className={`relative w-72 max-w-[85vw] h-full bg-white flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-out z-10 overflow-y-auto ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-5">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-slate-100">
              <div>
                <div className="relative h-8 w-36">
                  <Image
                    src="/images/cherrapunji-hotels-logo-dark.png"
                    alt="Cherrapunji Hotels Web"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    Control Panel
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            {renderNavList()}
          </div>

          {/* Footer */}
          {renderFooter()}
        </aside>
      </div>
    </>
  );
}
