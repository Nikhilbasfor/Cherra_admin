"use client";

import React, { useState } from "react";
import { X, Building2, Plus, Trash2, Check } from "lucide-react";
import { Hotel, Room } from "@/lib/types";

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelToEdit?: Hotel | null;
  onSave: (hotel: Hotel) => void;
}

const ALL_AMENITIES = [
  "Infinity View Pool",
  "Free High-Speed Wi-Fi",
  "Seven Sisters Viewpoint",
  "Fine Dining Restaurant",
  "Bonfire Nights",
  "Geyser / 24hr Hot Water",
  "Private Balcony",
  "Travel Desk / Trek Guides",
  "Children's Play Zone",
  "Free Parking",
];

export default function HotelModal({
  isOpen,
  onClose,
  hotelToEdit,
  onSave,
}: HotelModalProps) {
  if (!isOpen) return null;

  return (
    <HotelModalContent
      key={hotelToEdit?.id ?? "new"}
      onClose={onClose}
      hotelToEdit={hotelToEdit}
      onSave={onSave}
    />
  );
}

function HotelModalContent({
  onClose,
  hotelToEdit,
  onSave,
}: {
  onClose: () => void;
  hotelToEdit?: Hotel | null;
  onSave: (hotel: Hotel) => void;
}) {
  const [name, setName] = useState(hotelToEdit?.name || "");
  const [slug, setSlug] = useState(hotelToEdit?.slug || "");
  const [tagline, setTagline] = useState(hotelToEdit?.tagline || "");
  const [starRating, setStarRating] = useState<1 | 2 | 3 | 4 | 5>(hotelToEdit?.starRating || 3);
  const [pricePerNight, setPricePerNight] = useState<number>(hotelToEdit?.pricePerNight || 3500);
  const [originalPrice, setOriginalPrice] = useState<number>(hotelToEdit?.originalPrice || 4200);
  const [area, setArea] = useState(hotelToEdit?.area || "Sohra Town");
  const [address, setAddress] = useState(hotelToEdit?.address || "Sohra, Cherrapunji, Meghalaya 793108");
  const [lat, setLat] = useState(hotelToEdit?.coordinates?.lat || 25.275);
  const [lng, setLng] = useState(hotelToEdit?.coordinates?.lng || 91.721);
  const [imageUrl, setImageUrl] = useState(
    hotelToEdit?.images?.[0] ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  );
  const [featured, setFeatured] = useState(hotelToEdit?.featured || false);
  const [status, setStatus] = useState<"active" | "inactive">(hotelToEdit?.status || "active");
  const [description, setDescription] = useState(
    hotelToEdit?.description || "A serene and comfortable stay in Cherrapunji with scenic nature views."
  );
  const [amenities, setAmenities] = useState<string[]>(
    hotelToEdit?.amenities || ["Free High-Speed Wi-Fi", "Geyser / 24hr Hot Water", "Private Balcony"]
  );
  const [checkInTime, setCheckInTime] = useState(hotelToEdit?.checkInTime || "14:00");
  const [checkOutTime, setCheckOutTime] = useState(hotelToEdit?.checkOutTime || "11:00");
  const [phone, setPhone] = useState(hotelToEdit?.phone || "+91 87947 12345");
  const [email, setEmail] = useState(hotelToEdit?.email || "bookings@cherrapunjistays.com");
  const [distanceToCenter, setDistanceToCenter] = useState(
    hotelToEdit?.distanceToCenter || "2.5 km from Sohra Market"
  );
  const [highlights, setHighlights] = useState<string>(
    hotelToEdit?.highlights && hotelToEdit.highlights.length > 0
      ? hotelToEdit.highlights.join(", ")
      : "Panoramic valley views, Direct property booking, Zero platform fees"
  );
  const [rooms, setRooms] = useState<Room[]>(
    hotelToEdit?.rooms && hotelToEdit.rooms.length > 0
      ? hotelToEdit.rooms
      : [
          {
            id: "r-default-1",
            name: "Deluxe View Room",
            price: 3500,
            capacity: "2 Adults",
            beds: "1 Queen Bed",
            features: ["Hot Water", "Balcony"],
          },
        ]
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (!hotelToEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleAddRoom = () => {
    setRooms((prev) => [
      ...prev,
      {
        id: "r-" + Date.now(),
        name: "Executive Room",
        price: pricePerNight,
        capacity: "2 Adults",
        beds: "1 King Bed",
        features: ["Canyon View"],
      },
    ]);
  };

  const handleRemoveRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHighlights = highlights
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const finalHotel: Hotel = {
      id: hotelToEdit ? hotelToEdit.id : slug || "hotel-" + Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      tagline,
      starRating,
      pricePerNight,
      originalPrice,
      area,
      address,
      coordinates: { lat, lng },
      images: [
        imageUrl ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      ],
      featured,
      status,
      rating: hotelToEdit ? hotelToEdit.rating : 4.7,
      reviewsCount: hotelToEdit ? hotelToEdit.reviewsCount : 1,
      amenities,
      rooms,
      description,
      highlights:
        parsedHighlights.length > 0
          ? parsedHighlights
          : ["Panoramic views", "Direct booking guarantee"],
      checkInTime: checkInTime.trim() || "14:00",
      checkOutTime: checkOutTime.trim() || "11:00",
      distanceToCenter: distanceToCenter.trim() || "Central Sohra",
      phone: phone.trim() || "+91 87947 12345",
      email: email.trim() || "bookings@cherrapunjistays.com",
    };

    onSave(finalHotel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-10 my-6">
        <div className="bg-emerald-50/60 px-5 py-3.5 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              {hotelToEdit ? `Edit Hotel: ${hotelToEdit.name}` : "Add New Hotel in Cherrapunji"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Hotel Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hotel Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Pine Ridge Luxury Resort"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. pine-ridge-resort-cherrapunji"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Cliffside sunrise views overlooking Bangladesh canyons"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Star Rating, Price, Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Star Rating</label>
              <select
                value={starRating}
                onChange={(e) => setStarRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value={5}>5 Star (Luxury)</option>
                <option value={4}>4 Star (Premium)</option>
                <option value={3}>3 Star (Comfort)</option>
                <option value={2}>2 Star (Homestay)</option>
                <option value={1}>1 Star (Basic)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Price per Night (₹) *</label>
              <input
                type="number"
                required
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Original Price (₹)</label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Area & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Nohsngithiang, Saitsohpen, Sohra Town"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village Laitkynsew, Sohra, Meghalaya 793108"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Check-in & Check-out Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Check-in Time *</label>
              <input
                type="text"
                required
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="e.g. 14:00 or 1:00 PM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Check-out Time *</label>
              <input
                type="text"
                required
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                placeholder="e.g. 11:00 or 11:00 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Contact Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 87947 12345"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="stay@cherrapunji.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Distance to Center / Hub */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Location Hub / Distance to Center</label>
            <input
              type="text"
              value={distanceToCenter}
              onChange={(e) => setDistanceToCenter(e.target.value)}
              placeholder="e.g. 2.5 km from Sohra Market, near Nohkalikai Falls"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Property Highlights */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Property Highlights (Separate with commas)
            </label>
            <input
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Panoramic waterfall view, Direct Khasi dining, Zero platform fees"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Photo Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
            />
          </div>

          {/* Amenities Checklist */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Amenities Checklist</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_AMENITIES.map((item) => {
                const isChecked = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left transition-colors ${
                      isChecked
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rooms */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-700 font-semibold">Room Categories ({rooms.length})</label>
              <button
                type="button"
                onClick={handleAddRoom}
                className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room
              </button>
            </div>
            <div className="space-y-1.5">
              {rooms.map((room, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => {
                      const newRooms = [...rooms];
                      newRooms[idx].name = e.target.value;
                      setRooms(newRooms);
                    }}
                    className="bg-transparent text-slate-800 font-medium focus:outline-none flex-1 text-xs"
                  />
                  <div className="w-24 flex items-center gap-1">
                    <span className="text-slate-400">₹</span>
                    <input
                      type="number"
                      value={room.price}
                      onChange={(e) => {
                        const newRooms = [...rooms];
                        newRooms[idx].price = Number(e.target.value);
                        setRooms(newRooms);
                      }}
                      className="bg-transparent text-emerald-800 font-bold focus:outline-none w-full text-right text-xs"
                    />
                  </div>
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRoom(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Featured & Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-emerald-600 w-3.5 h-3.5 rounded"
              />
              <span className="text-slate-700 font-medium">Featured on Homepage</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Draft)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              {hotelToEdit ? "Save Changes" : "Create Hotel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
