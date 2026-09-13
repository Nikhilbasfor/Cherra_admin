"use client";

import React, { useState, useEffect } from "react";
import { X, Compass, Sparkles } from "lucide-react";
import { Attraction } from "@/lib/types";

interface AttractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (attraction: Attraction) => void;
  attractionToEdit?: Attraction | null;
}

const CATEGORIES = [
  "Waterfall",
  "Caves",
  "Living Root Bridge",
  "Canyon / Viewpoint",
  "Sacred Forest",
  "Trek & Trails",
];

export default function AttractionModal({
  isOpen,
  onClose,
  onSave,
  attractionToEdit,
}: AttractionModalProps) {
  const [name, setName] = useState("");
  const [khasiName, setKhasiName] = useState("");
  const [category, setCategory] = useState("Waterfall");
  const [description, setDescription] = useState("");
  const [distanceFromSohra, setDistanceFromSohra] = useState("5 km");
  const [image, setImage] = useState("");
  const [rating, setRating] = useState(4.8);
  const [bestTime, setBestTime] = useState("September to April");

  useEffect(() => {
    if (attractionToEdit) {
      setName(attractionToEdit.name || "");
      setKhasiName(attractionToEdit.khasiName || "");
      setCategory(attractionToEdit.category || "Waterfall");
      setDescription(attractionToEdit.description || "");
      setDistanceFromSohra(attractionToEdit.distanceFromSohra || "5 km");
      setImage(attractionToEdit.image || "");
      setRating(attractionToEdit.rating || 4.8);
      setBestTime(attractionToEdit.bestTime || "September to April");
    } else {
      setName("");
      setKhasiName("");
      setCategory("Waterfall");
      setDescription("");
      setDistanceFromSohra("5 km");
      setImage(
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
      );
      setRating(4.8);
      setBestTime("September to April");
    }
  }, [attractionToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id =
      attractionToEdit?.id ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newAttraction: Attraction = {
      id: id || `attraction-${Date.now()}`,
      name: name.trim(),
      khasiName: khasiName.trim() || undefined,
      category,
      description: description.trim(),
      distanceFromSohra: distanceFromSohra.trim() || "5 km",
      image:
        image.trim() ||
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      rating: Number(rating) || 4.8,
      bestTime: bestTime.trim() || "All Year Round",
    };

    onSave(newAttraction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {attractionToEdit ? "Edit Attraction" : "Add New Sightseeing Spot"}
              </h2>
              <p className="text-xs text-slate-500">
                Syncs directly to database & public guide
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Attraction Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nohkalikai Falls"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Khasi Name (Local Lore)
              </label>
              <input
                type="text"
                value={khasiName}
                onChange={(e) => setKhasiName(e.target.value)}
                placeholder="e.g. Ka Likai / Jingkieng Nongriat"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Distance from Central Sohra
              </label>
              <input
                type="text"
                value={distanceFromSohra}
                onChange={(e) => setDistanceFromSohra(e.target.value)}
                placeholder="e.g. 7.5 km"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Best Visiting Season
              </label>
              <input
                type="text"
                value={bestTime}
                onChange={(e) => setBestTime(e.target.value)}
                placeholder="e.g. Monsoon & Post-Monsoon"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Rating (out of 5.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cover Image URL (Direct Link)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a vivid description of what travelers experience..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
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
              <span>{attractionToEdit ? "Save Changes" : "Create Attraction"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
