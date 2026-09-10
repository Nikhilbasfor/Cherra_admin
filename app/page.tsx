"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  Users2,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Star,
  MessageSquare,
  PhoneCall,
  Search,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import HotelModal from "@/components/HotelModal";
import LeadDetailModal from "@/components/LeadDetailModal";
import { INITIAL_HOTELS, INITIAL_LEADS } from "@/lib/initialData";
import { Hotel, InquiryLead } from "@/lib/types";
import {
  fetchAdminHotels,
  saveAdminHotel,
  deleteAdminHotel,
  fetchAdminInquiries,
  updateAdminInquiry,
} from "@/lib/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "hotels" | "leads" | "seo">("dashboard");
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [leads, setLeads] = useState<InquiryLead[]>(INITIAL_LEADS);
  const [isLoading, setIsLoading] = useState(false);

  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [hotelToEdit, setHotelToEdit] = useState<Hotel | null>(null);

  const [selectedLead, setSelectedLead] = useState<InquiryLead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [leadSearchQuery, setLeadSearchQuery] = useState("");

  // Load live data from Backend / Firestore
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [hList, iList] = await Promise.all([
        fetchAdminHotels(),
        fetchAdminInquiries(),
      ]);
      if (hList && hList.length > 0) setHotels(hList);
      if (iList && iList.length > 0) setLeads(iList);
    } catch (err) {
      console.warn("Error loading backend data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const [hList, iList] = await Promise.all([
          fetchAdminHotels(),
          fetchAdminInquiries(),
        ]);
        if (isMounted) {
          if (hList && hList.length > 0) setHotels(hList);
          if (iList && iList.length > 0) setLeads(iList);
        }
      } catch (err) {
        console.warn("Error loading backend data:", err);
      }
    };

    fetchLatest();
    // Auto refresh every 10 seconds to catch new incoming leads from User site
    const interval = setInterval(fetchLatest, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleOpenAddHotel = () => {
    setHotelToEdit(null);
    setIsHotelModalOpen(true);
  };

  const handleOpenEditHotel = (hotel: Hotel) => {
    setHotelToEdit(hotel);
    setIsHotelModalOpen(true);
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (confirm("Are you sure you want to remove this hotel from the directory?")) {
      setHotels((prev) => prev.filter((h) => h.id !== hotelId));
      await deleteAdminHotel(hotelId);
    }
  };

  const handleSaveHotel = async (saved: Hotel) => {
    setHotels((prev) => {
      const exists = prev.some((h) => h.id === saved.id);
      if (exists) {
        return prev.map((h) => (h.id === saved.id ? saved : h));
      }
      return [saved, ...prev];
    });
    await saveAdminHotel(saved);
  };

  const handleOpenLead = (lead: InquiryLead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleUpdateLead = async (updated: InquiryLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
    await updateAdminInquiry(updated);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = leadStatusFilter === "all" || l.status === leadStatusFilter;
    const matchesSearch =
      !leadSearchQuery.trim() ||
      l.customerName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      l.customerPhone.includes(leadSearchQuery) ||
      l.hotelName.toLowerCase().includes(leadSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const estimatedPipelineValue = leads
    .filter((l) => l.status !== "cancelled")
    .reduce((sum, l) => sum + (l.budget || 5000), 0);

  const getStatusBadge = (status: InquiryLead["status"]) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">New Lead</span>;
      case "contacted":
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold">Contacted</span>;
      case "quote_sent":
        return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold">Quote Sent</span>;
      case "converted":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-semibold">Converted 🎉</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">Closed</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8faf9] text-slate-900">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadsCount={newLeads}
        hotelsCount={hotels.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 mb-6">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              CherraStays Back-Office (Live Backend Connected)
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {activeTab === "dashboard" && "Management Dashboard"}
              {activeTab === "hotels" && "Hotel Inventory & Tariffs"}
              {activeTab === "leads" && "CRM Inquiries & Leads Pipeline"}
              {activeTab === "seo" && "SEO & Google Snippets"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs shadow-xs"
              title="Sync with Backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            {activeTab === "hotels" && (
              <button
                onClick={handleOpenAddHotel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hotel</span>
              </button>
            )}

            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Hotels"
                value={hotels.length}
                subtitle="Live in database"
                change="Connected"
                icon={Building2}
                iconColor="text-emerald-700"
              />
              <StatCard
                title="Total CRM Inquiries"
                value={totalLeads}
                subtitle={`${newLeads} awaiting contact`}
                change="+18% vs last wk"
                icon={Users2}
                iconColor="text-amber-600"
              />
              <StatCard
                title="Lead Conversion Rate"
                value={`${conversionRate}%`}
                subtitle={`${convertedLeads} confirmed stays`}
                change="+4% increase"
                icon={TrendingUp}
                iconColor="text-teal-700"
              />
              <StatCard
                title="Pipeline Tariff Volume"
                value={`₹${(estimatedPipelineValue / 1000).toFixed(0)}k`}
                subtitle="Estimated booking potential"
                icon={Sparkles}
                iconColor="text-emerald-600"
              />
            </div>

            {/* Pipeline Stage Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Inquiry Pipeline Status</h3>
                  <p className="text-xs text-slate-500">Live progress of customer inquiries from User site</p>
                </div>
                <button
                  onClick={() => setActiveTab("leads")}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Manage All Leads →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-xs text-amber-800 font-semibold block mb-0.5">New Leads</span>
                  <span className="text-xl font-bold text-slate-900">{newLeads}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pending first contact</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-xs text-blue-800 font-semibold block mb-0.5">Contacted</span>
                  <span className="text-xl font-bold text-slate-900">
                    {leads.filter((l) => l.status === "contacted").length}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Discussion ongoing</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                  <span className="text-xs text-purple-800 font-semibold block mb-0.5">Quote Sent</span>
                  <span className="text-xl font-bold text-slate-900">
                    {leads.filter((l) => l.status === "quote_sent").length}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tariff shared</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-semibold block mb-0.5">Converted</span>
                  <span className="text-xl font-bold text-slate-900">{convertedLeads}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Confirmed bookings</p>
                </div>
              </div>
            </div>

            {/* Recent Leads Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Inquiries</h3>
                <span className="text-xs text-slate-400">Sorted by newest</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5 font-semibold">Guest</th>
                      <th className="pb-2.5 font-semibold">Hotel</th>
                      <th className="pb-2.5 font-semibold">Dates</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.slice(0, 4).map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3">
                          <p className="font-bold text-slate-900">{lead.customerName}</p>
                          <p className="text-[11px] text-slate-500">{lead.customerPhone}</p>
                        </td>
                        <td className="py-3 text-slate-700">{lead.hotelName}</td>
                        <td className="py-3 text-slate-500">
                          {lead.checkIn} to {lead.checkOut}
                        </td>
                        <td className="py-3">{getStatusBadge(lead.status)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleOpenLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold"
                          >
                            Open Lead
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. HOTELS INVENTORY TAB */}
        {activeTab === "hotels" && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Listed Properties in Cherrapunji ({hotels.length})</h3>
                  <p className="text-xs text-slate-500">
                    Edits made here are saved directly to the backend and reflect on the User website
                  </p>
                </div>
                <button
                  onClick={handleOpenAddHotel}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Hotel</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5 font-semibold">Hotel</th>
                      <th className="pb-2.5 font-semibold">Rating</th>
                      <th className="pb-2.5 font-semibold">Locality</th>
                      <th className="pb-2.5 font-semibold">Base Tariff</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hotels.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-11 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                              <Image src={h.images[0]} alt="" fill className="object-cover" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{h.name}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">{h.tagline}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {h.starRating}★
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600">{h.area}</td>
                        <td className="py-3.5 font-bold text-emerald-800">₹{h.pricePerNight} / night</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                            {h.status || "Active"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditHotel(h)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                              title="Edit Hotel"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteHotel(h.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700"
                              title="Delete Hotel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CRM LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Inquiry Pipeline & Lead Tracker</h3>
                  <p className="text-xs text-slate-500">
                    Live booking inquiries submitted from the User website
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search guest or hotel..."
                      value={leadSearchQuery}
                      onChange={(e) => setLeadSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="all">All Stages ({leads.length})</option>
                    <option value="new">New Leads ({leads.filter((l) => l.status === "new").length})</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_sent">Quote Sent</option>
                    <option value="converted">Converted 🎉</option>
                    <option value="cancelled">Closed</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5 font-semibold">Lead Info</th>
                      <th className="pb-2.5 font-semibold">Hotel & Category</th>
                      <th className="pb-2.5 font-semibold">Stay Dates</th>
                      <th className="pb-2.5 font-semibold">Guests</th>
                      <th className="pb-2.5 font-semibold">Status Stage</th>
                      <th className="pb-2.5 font-semibold text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map((lead) => {
                      const waUrl = `https://wa.me/${lead.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${lead.customerName}, regarding your inquiry for ${lead.hotelName} in Cherrapunji for ${lead.checkIn} to ${lead.checkOut}...`
                      )}`;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleOpenLead(lead)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3.5">
                            <p className="font-bold text-slate-900">{lead.customerName}</p>
                            <p className="text-[11px] text-slate-500">{lead.customerPhone}</p>
                            <p className="text-[10px] text-emerald-700">{lead.createdAt}</p>
                          </td>
                          <td className="py-3.5">
                            <p className="font-semibold text-slate-900">{lead.hotelName}</p>
                            <p className="text-[11px] text-slate-500">{lead.roomType || "Standard"}</p>
                          </td>
                          <td className="py-3.5 text-slate-600">
                            {lead.checkIn} ➔ {lead.checkOut}
                          </td>
                          <td className="py-3.5 text-slate-600">
                            {lead.guests.adults}A, {lead.guests.children}C
                          </td>
                          <td className="py-3.5">{getStatusBadge(lead.status)}</td>
                          <td className="py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                                title="WhatsApp Guest"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`tel:${lead.customerPhone}`}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                                title="Call Guest"
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SEO TAB */}
        {activeTab === "seo" && (
          <div className="space-y-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Google Search Engine Ranking Status</h3>
                <p className="text-xs text-slate-500">
                  Preview of how CherraStays appears on Google Search results
                </p>
              </div>

              {/* Realistic Daylight Google SERP Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-300 space-y-1 max-w-xl shadow-xs font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-[10px]">
                    C
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <span>https://cherrapunjistays.com</span>
                    <span className="text-slate-400 ml-1">› hotels › cherrapunji</span>
                  </div>
                </div>
                <h4 className="text-base text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug">
                  Hotels in Cherrapunji | Peaceful Nature Resorts & Stays in Sohra
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Explore and book verified 3-star, 4-star, and luxury 5-star hotels in Cherrapunji (Sohra), Meghalaya. Guaranteed direct tariffs, waterfall views & instant WhatsApp quotes.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-600">
                  <span className="text-amber-600 font-medium">Rating: 4.8/5.0</span>
                  <span>•</span>
                  <span>25+ Verified Stays</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">Direct Tariffs</span>
                </div>
              </div>

              {/* Keyword Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Target Primary Keywords
                  </span>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p className="flex items-center justify-between">
                      <span>• &quot;hotels in cherrapunji&quot;</span>
                      <span className="text-emerald-700 font-semibold">Optimized (SSR)</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>• &quot;3 star hotels cherrapunji&quot;</span>
                      <span className="text-emerald-700 font-semibold">Optimized</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>• &quot;resorts in cherrapunji&quot;</span>
                      <span className="text-emerald-700 font-semibold">Optimized</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Technical SEO Stack
                  </span>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p className="flex items-center justify-between">
                      <span>• Schema.org Hotel JSON-LD</span>
                      <span className="text-emerald-700 font-semibold">Active ✓</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>• Automated XML Sitemap</span>
                      <span className="text-emerald-700 font-semibold">/sitemap.xml ✓</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>• Robots.txt Crawl Directives</span>
                      <span className="text-emerald-700 font-semibold">/robots.txt ✓</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <HotelModal
        isOpen={isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        hotelToEdit={hotelToEdit}
        onSave={handleSaveHotel}
      />

      <LeadDetailModal
        isOpen={isLeadModalOpen}
        lead={selectedLead}
        onClose={() => setIsLeadModalOpen(false)}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
}
