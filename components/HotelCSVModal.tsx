"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react";
import { Hotel } from "@/lib/types";

interface HotelCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingHotels: Hotel[];
  onImportComplete: (importedHotels: Hotel[]) => Promise<void>;
}

// Curated nature/resort placeholder images for Cherrapunji
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default function HotelCSVModal({
  isOpen,
  onClose,
  existingHotels,
  onImportComplete,
}: HotelCSVModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedHotels, setParsedHotels] = useState<Hotel[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    processCSVFile(uploadedFile);
  };

  const processCSVFile = (uploadedFile: File) => {
    setParseError(null);
    setSuccessCount(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty");

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          throw new Error("CSV must contain at least a header row and one data row.");
        }

        const headers = parseCSVLine(lines[0]).map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, "")
        );

        // Map column indices
        const nameIdx = headers.findIndex((h) => h === "name" || h === "hotelname");
        const typeIdx = headers.findIndex((h) => h === "type" || h === "category");
        const addressIdx = headers.findIndex((h) => h === "address");
        const phoneIdx = headers.findIndex((h) => h.includes("phone") || h === "contact");
        const ratingIdx = headers.findIndex((h) => h.includes("rating"));
        const reviewsIdx = headers.findIndex((h) => h.includes("review") || h.includes("reviews"));
        const notesIdx = headers.findIndex((h) => h === "notes");
        const priceIdx = headers.findIndex((h) => h.includes("price") || h.includes("tariff"));
        const originalPriceIdx = headers.findIndex((h) => h.includes("originalprice"));
        const areaIdx = headers.findIndex((h) => h === "area" || h === "locality");
        const slugIdx = headers.findIndex((h) => h === "slug");
        const taglineIdx = headers.findIndex((h) => h === "tagline");
        const descriptionIdx = headers.findIndex((h) => h === "description");
        const amenitiesIdx = headers.findIndex((h) => h === "amenities");
        const imagesIdx = headers.findIndex((h) => h === "images" || h === "image");
        const latIdx = headers.findIndex((h) => h === "lat" || h === "latitude");
        const lngIdx = headers.findIndex((h) => h === "lng" || h === "longitude");

        if (nameIdx === -1) {
          throw new Error("Could not find a 'Name' or 'Hotel Name' column in the header.");
        }

        const hotels: Hotel[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length <= nameIdx) continue;

          const name = row[nameIdx]?.trim();
          if (!name) continue;

          const rawType = (typeIdx !== -1 ? row[typeIdx] : "Resort") || "Resort";
          const address = (addressIdx !== -1 ? row[addressIdx] : "") || `${name}, Sohra, Meghalaya 793108`;
          const phone = (phoneIdx !== -1 ? row[phoneIdx] : "") || "+91 98648 79505";
          const rawRating = ratingIdx !== -1 ? parseFloat(row[ratingIdx]) : NaN;
          const rating = !isNaN(rawRating) ? Math.min(5, Math.max(1, rawRating)) : 4.3;

          const rawReviews = reviewsIdx !== -1 ? parseInt(row[reviewsIdx]?.replace(/[^0-9]/g, "") || "") : NaN;
          const reviewsCount = !isNaN(rawReviews) ? rawReviews : 120;

          const notes = notesIdx !== -1 ? row[notesIdx] : "";
          const slug = (slugIdx !== -1 && row[slugIdx]?.trim()) || generateSlug(name);
          const id = slug;

          // Deduce area/locality from address or name
          let area = areaIdx !== -1 && row[areaIdx]?.trim() ? row[areaIdx].trim() : "";
          if (!area) {
            const lowerAddr = address.toLowerCase();
            if (lowerAddr.includes("mawsmai")) area = "Mawsmai";
            else if (lowerAddr.includes("saitsohpen")) area = "Saitsohpen";
            else if (lowerAddr.includes("tyrna") || lowerAddr.includes("nongriat")) area = "Tyrna";
            else if (lowerAddr.includes("laitkynsew")) area = "Laitkynsew";
            else if (lowerAddr.includes("khliehshnong")) area = "Khliehshnong";
            else if (lowerAddr.includes("nohkalikai")) area = "Nohkalikai Road";
            else if (lowerAddr.includes("mawkisyiem")) area = "Lower Sohra";
            else area = "Sohra (Cherrapunji)";
          }

          // Deduce realistic price based on type
          let price = priceIdx !== -1 ? parseInt(row[priceIdx]?.replace(/[^0-9]/g, "") || "") : NaN;
          if (isNaN(price) || price <= 0) {
            const lowerType = rawType.toLowerCase();
            if (lowerType.includes("resort")) price = 5500;
            else if (lowerType.includes("hotel")) price = 3200;
            else if (lowerType.includes("cottage")) price = 2800;
            else if (lowerType.includes("homestay") || lowerType.includes("guest house")) price = 1800;
            else price = 3500;
          }

          let origPrice = originalPriceIdx !== -1 ? parseInt(row[originalPriceIdx]?.replace(/[^0-9]/g, "") || "") : NaN;
          if (isNaN(origPrice) || origPrice <= price) {
            origPrice = Math.round((price * 1.25) / 100) * 100;
          }

          // Amenities
          let amenities: string[] = [];
          if (amenitiesIdx !== -1 && row[amenitiesIdx]?.trim()) {
            amenities = row[amenitiesIdx].split(/[;,|]/).map((a) => a.trim()).filter(Boolean);
          }
          if (amenities.length === 0) {
            amenities = [
              "Free Wi-Fi",
              "Hot Water Geyser",
              "Mountain & Cloud View",
              "In-House Dining",
              "Travel & Trek Assistance",
              "Free Parking",
            ];
          }

          // Images
          let images: string[] = [];
          if (imagesIdx !== -1 && row[imagesIdx]?.trim()) {
            images = row[imagesIdx].split(/[;,|]/).map((img) => img.trim()).filter(Boolean);
          }
          if (images.length === 0) {
            const imgIndex = i % FALLBACK_IMAGES.length;
            images = [
              FALLBACK_IMAGES[imgIndex],
              FALLBACK_IMAGES[(imgIndex + 1) % FALLBACK_IMAGES.length],
            ];
          }

          const tagline =
            (taglineIdx !== -1 && row[taglineIdx]?.trim()) ||
            `${rawType} set amidst the mist and dramatic canyons of ${area}`;

          const description =
            (descriptionIdx !== -1 && row[descriptionIdx]?.trim()) ||
            `${name} is a verified ${rawType.toLowerCase()} situated in ${area}, Cherrapunji (Sohra). Offering comfortable accommodations with warm Khasi hospitality, authentic local meals, and direct access to renowned waterfalls and viewpoints. ${notes ? `Note: ${notes}` : ""}`;

          const lat = latIdx !== -1 ? parseFloat(row[latIdx]) : 25.274;
          const lng = lngIdx !== -1 ? parseFloat(row[lngIdx]) : 91.732;

          // Categories
          const categories: string[] = [];
          const lowerType = rawType.toLowerCase();
          if (lowerType.includes("resort")) categories.push("resorts-in-cherrapunji");
          if (lowerType.includes("homestay") || lowerType.includes("guest house")) categories.push("homestays-in-cherrapunji");
          if (price >= 5000) categories.push("luxury-resorts-cherrapunji");
          if (price <= 2500) categories.push("budget-stays-cherrapunji");

          hotels.push({
            id,
            name,
            slug,
            tagline,
            starRating: rating >= 4.5 ? 5 : rating >= 4.0 ? 4 : 3,
            pricePerNight: price,
            originalPrice: origPrice,
            area,
            address,
            coordinates: {
              lat: !isNaN(lat) ? lat : 25.274,
              lng: !isNaN(lng) ? lng : 91.732,
            },
            images,
            featured: i <= 3,
            rating,
            reviewsCount,
            amenities,
            rooms: [
              {
                id: `${slug}-standard-room`,
                name: "Standard Valley View Room",
                price,
                originalPrice: origPrice,
                capacity: "2 Adults",
                beds: "1 Queen / King Bed",
                sizeSqFt: 320,
                features: ["Geyser", "Valley View", "Ensuite Bathroom", "Electric Kettle"],
              },
            ],
            description,
            highlights: [
              `Scenic location in ${area}`,
              "24/7 Hot water geysers",
              "Direct tariff with zero commission",
            ],
            checkInTime: "14:00",
            checkOutTime: "11:00",
            distanceToCenter: `Near ${area}`,
            phone,
            status: "active",
            categories,
          });
        }

        if (hotels.length === 0) {
          throw new Error("No valid hotel records could be extracted from this CSV.");
        }

        setParsedHotels(hotels);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse CSV file.";
        setParseError(msg);
        setParsedHotels([]);
      }
    };

    reader.readAsText(uploadedFile);
  };

  const handleImport = async () => {
    if (parsedHotels.length === 0) return;
    setIsProcessing(true);
    setImportProgress({ current: 0, total: parsedHotels.length });

    try {
      await onImportComplete(parsedHotels);
      setSuccessCount(parsedHotels.length);
      setParsedHotels([]);
      setFile(null);
    } catch (err) {
      console.error("Import error:", err);
      setParseError("Failed to save some hotels to the backend. Please check console.");
    } finally {
      setIsProcessing(false);
      setImportProgress(null);
    }
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const templateHeaders = [
      "Name",
      "Type",
      "Area",
      "Address",
      "Phone",
      "Google Rating",
      "No. of Reviews",
      "Price Per Night",
      "Original Price",
      "Tagline",
      "Description",
      "Amenities",
      "Notes",
    ];

    const sampleRows = [
      [
        "Polo Orchid Resort",
        "Resort",
        "Nohsngithiang",
        "Mawsmai, Sohra, Meghalaya 793108",
        "+91 99867 02889",
        "4.5",
        "5161",
        "8500",
        "10500",
        "Cliffside retreat facing Seven Sisters Falls",
        "Luxury log cabins overlooking Bangladesh plains",
        "Free Wi-Fi; Hot Water Geyser; Infinity Pool; Restaurant; Bonfire",
        "Top recommended luxury property",
      ],
      [
        "Jiva Resort Cherrapunjee",
        "Resort",
        "Saitsohpen",
        "Saitsohpen, Sohra, Meghalaya 793108",
        "+91 69093 90999",
        "4.5",
        "7064",
        "6200",
        "7800",
        "Eco-luxury retreat amidst tranquil pine groves",
        "Stone cottages and landscaped gardens in central Sohra",
        "Free Wi-Fi; Hot Water Geyser; Fine Dining; Free Parking",
        "Popular eco resort",
      ],
      [
        "Monica's Homestay",
        "Homestay",
        "Saitsohpen",
        "Saitsohpen, Lad Pynshad Khurai, Sohra 793108",
        "+91 80143 09903",
        "4.6",
        "195",
        "1800",
        "2200",
        "Cozy family homestay with homemade Khasi breakfast",
        "Warm local hospitality close to town market",
        "Free Wi-Fi; Hot Water Geyser; Homecooked Meals; Parking",
        "Authentic local host",
      ],
    ];

    const csvContent =
      templateHeaders.join(",") +
      "\n" +
      sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cherrapunji_hotels_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Current Hotels
  const handleExportCurrent = () => {
    if (existingHotels.length === 0) return;

    const headers = [
      "Name",
      "Slug",
      "Type",
      "Area",
      "Address",
      "Phone",
      "Google Rating",
      "No. of Reviews",
      "Price Per Night",
      "Original Price",
      "Tagline",
      "Description",
      "Amenities",
    ];

    const rows = existingHotels.map((h) => [
      h.name,
      h.slug,
      h.categories?.[0] || "Resort",
      h.area,
      h.address,
      h.phone || "",
      h.rating.toString(),
      h.reviewsCount.toString(),
      h.pricePerNight.toString(),
      h.originalPrice.toString(),
      h.tagline,
      h.description,
      h.amenities.join("; "),
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cherrapunji_hotels_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#fbfdfc]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Bulk Import & Sync Hotels (CSV)
              </h2>
              <p className="text-xs text-slate-500">
                Upload your Cherrapunji hotel listings to populate or update the live directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Row: Template & Export */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Supports custom CSV formats including Google Maps data, categories, ratings, and phone numbers.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download Sample CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Current ({existingHotels.length})</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successCount !== null && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Successfully imported {successCount} hotels!</p>
                  <p className="text-[11px] text-emerald-700">
                    The hotel inventory has been synchronized with the live database and public portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {parseError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Error reading CSV file</p>
                <p className="text-rose-700 mt-0.5">{parseError}</p>
              </div>
            </div>
          )}

          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 group-hover:border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-3 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">
              {file ? file.name : "Click to browse or drop your CSV file here"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Auto-maps Name, Category, Address, Phone, Google Rating, Reviews, and Tariffs
            </p>
          </div>

          {/* Parsed Hotels Preview Table */}
          {parsedHotels.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Parsed Properties Preview ({parsedHotels.length} Hotels Found)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review hotels before synchronizing with Firestore and local database
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Ready to Import
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Hotel Name</th>
                      <th className="py-2.5 px-3 font-semibold">Locality</th>
                      <th className="py-2.5 px-3 font-semibold">Rating</th>
                      <th className="py-2.5 px-3 font-semibold">Phone</th>
                      <th className="py-2.5 px-3 font-semibold">Tariff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedHotels.map((h, idx) => (
                      <tr key={h.id || idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{h.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{h.slug}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{h.area}</td>
                        <td className="py-2.5 px-3 font-semibold text-amber-600">
                          {h.rating}★ ({h.reviewsCount})
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{h.phone || "—"}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">₹{h.pricePerNight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#fbfdfc]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>

          {parsedHotels.length > 0 && (
            <button
              type="button"
              onClick={handleImport}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    Importing {importProgress ? `(${importProgress.current}/${importProgress.total})` : "..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Import All {parsedHotels.length} Hotels to Database</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
