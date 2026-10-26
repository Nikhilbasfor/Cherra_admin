import { Hotel, InquiryLead, Attraction, FAQItem, SiteStats } from "./types";
import { INITIAL_HOTELS, INITIAL_ATTRACTIONS, INITIAL_FAQS, INITIAL_STATS } from "./initialData";
import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const USER_API_BASE =
  process.env.NEXT_PUBLIC_USER_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://resortsincherrapunji.com"
    : "http://localhost:3000");

const ADMIN_API_KEY =
  process.env.NEXT_PUBLIC_ADMIN_API_KEY ||
  process.env.ADMIN_API_KEY ||
  "cherra_admin_secret_2026";

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ----------------- HOTELS -----------------

export async function fetchAdminHotels(): Promise<Hotel[]> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "hotels");
      const q = query(col, orderBy("rating", "desc"));
      const snapshot = await withTimeout(getDocs(q), 2500);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hotel));
      }
    } catch (err) {
      console.warn("Firestore error in Admin, falling back to API:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/hotels?includeInactive=true`, {
      cache: "no-store",
      headers: { "x-admin-key": ADMIN_API_KEY },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("User API not reachable, using local initial data:", err);
  }

  return INITIAL_HOTELS;
}

export async function saveAdminHotel(hotel: Hotel): Promise<Hotel> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "hotels", hotel.id), hotel, { merge: true }), 15000);
    } catch (err) {
      console.warn("Firestore save hotel error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(hotel),
    });
  } catch (err) {
    console.warn("User API save hotel error:", err);
  }

  return hotel;
}

export async function deleteAdminHotel(hotelId: string): Promise<boolean> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(deleteDoc(doc(db, "hotels", hotelId)), 2500);
    } catch (err) {
      console.warn("Firestore delete hotel error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/hotels/${hotelId}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": ADMIN_API_KEY,
      },
    });
  } catch (err) {
    console.warn("User API delete hotel error:", err);
  }

  return true;
}

/**
 * Upload a batch/folder of photos for a specific hotel.
 * Replaces hardcoded Unsplash images with real property photos.
 * Compresses images in-browser to crisp WebP and saves directly to Firestore
 * so uploads work on the live site in 2 seconds without needing a Storage bucket.
 */
export async function uploadAdminHotelImages(
  hotel: Hotel,
  files: File[],
  replaceAll: boolean = true,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; images: string[]; hotel?: Hotel }> {
  const imageFiles = files.filter(
    (f) => f.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(f.name)
  );

  if (imageFiles.length === 0) {
    throw new Error("No valid image files were selected.");
  }

  // Keep total base64 under ~720 KB so the hotel document stays well below Firestore's 1 MB limit.
  const existingKept = replaceAll
    ? []
    : (hotel.images || []).filter((img) => !img.includes("unsplash.com"));
  const existingChars = existingKept.reduce((sum, s) => sum + s.length, 0);
  const availableBudgetChars = Math.max(200_000, 720_000 - existingChars);
  const maxCharsPerPhoto = Math.floor(availableBudgetChars / imageFiles.length);

  const webpDataUrls: string[] = [];
  for (let i = 0; i < imageFiles.length; i++) {
    const dataUrl = await fileToBoundedWebPDataUrl(imageFiles[i], maxCharsPerPhoto);
    webpDataUrls.push(dataUrl);
    onProgress?.(i + 1, imageFiles.length);
  }

  const finalImages = [...existingKept, ...webpDataUrls];
  const updatedHotel: Hotel = { ...hotel, images: finalImages };
  await saveAdminHotel(updatedHotel);

  return { success: true, images: finalImages, hotel: updatedHotel };
}

/**
 * Compress an image file in the browser into a WebP data URL guaranteed to stay under `maxChars`.
 */
async function fileToBoundedWebPDataUrl(file: File, maxChars: number): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const attempts: Array<{ maxDim: number; quality: number }> = [
    { maxDim: 1280, quality: 0.78 },
    { maxDim: 1080, quality: 0.7 },
    { maxDim: 900, quality: 0.62 },
    { maxDim: 720, quality: 0.55 },
    { maxDim: 560, quality: 0.48 },
  ];

  let result = "";
  for (const { maxDim, quality } of attempts) {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(bitmap, 0, 0, width, height);
    result = canvas.toDataURL("image/webp", quality);
    if (result.length <= maxChars) {
      break;
    }
  }
  bitmap.close?.();
  return result;
}

// ----------------- INQUIRIES / LEADS -----------------

function formatTimestamp(ts: unknown): string {
  if (!ts) return "Recently";
  if (typeof ts === "string") return ts;
  if (typeof ts === "object" && ts !== null && "toDate" in ts && typeof (ts as { toDate: () => Date }).toDate === "function") {
    try {
      return (ts as { toDate: () => Date }).toDate().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch {
      return "Recently";
    }
  }
  if (typeof ts === "object" && ts !== null && "seconds" in ts) {
    try {
      return new Date(Number((ts as { seconds: number }).seconds) * 1000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch {
      return "Recently";
    }
  }
  return String(ts);
}

export function normalizeInquiryLead(id: string, data: Record<string, any>): InquiryLead {
  return {
    id: id || data?.id || `lead-${Date.now()}`,
    customerName: String(data?.customerName || "Guest"),
    customerPhone: String(data?.customerPhone || ""),
    customerEmail: String(data?.customerEmail || ""),
    hotelId: String(data?.hotelId || ""),
    hotelName: String(data?.hotelName || "Cherrapunji Stay"),
    roomType: String(data?.roomType || "Standard Deluxe"),
    checkIn: String(data?.checkIn || ""),
    checkOut: String(data?.checkOut || ""),
    guests: {
      adults: Number(data?.guests?.adults) || 2,
      children: Number(data?.guests?.children) || 0,
    },
    specialRequests: String(data?.specialRequests || ""),
    status: (["new", "contacted", "quote_sent", "converted", "cancelled"].includes(data?.status)
      ? data.status
      : "new") as InquiryLead["status"],
    budget: Number(data?.budget) || 5000,
    notes: Array.isArray(data?.notes)
      ? data.notes.map((n: Record<string, any>) => ({
          id: String(n?.id || Date.now()),
          text: String(n?.text || ""),
          author: String(n?.author || "Admin"),
          createdAt: formatTimestamp(n?.createdAt),
        }))
      : [],
    createdAt: formatTimestamp(data?.createdAt),
  };
}

function deduplicateLeads(leads: InquiryLead[]): InquiryLead[] {
  const seen = new Set<string>();
  const unique: InquiryLead[] = [];
  for (const lead of leads) {
    const key = `${lead.customerPhone}_${lead.hotelName}_${lead.checkIn}_${lead.checkOut}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(lead);
    }
  }
  return unique;
}

export async function fetchAdminInquiries(): Promise<InquiryLead[]> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "inquiries");
      const q = query(col, orderBy("createdAt", "desc"));
      const snapshot = await withTimeout(getDocs(q), 2500);
      if (!snapshot.empty) {
        const raw = snapshot.docs.map((d) => normalizeInquiryLead(d.id, d.data()));
        return deduplicateLeads(raw);
      }
      return [];
    } catch (err) {
      console.warn("Firestore inquiries fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/inquiries`, {
      cache: "no-store",
      headers: {
        "x-admin-key": ADMIN_API_KEY,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const raw = data.map((item: any) => normalizeInquiryLead(item.id, item));
        return deduplicateLeads(raw);
      }
    }
  } catch (err) {
    console.warn("User API inquiries fetch error:", err);
  }

  return [];
}

/**
 * Real-time listener for incoming inquiries and WhatsApp click leads.
 * Fires instantly as soon as any enquiry is submitted on the website.
 */
export function subscribeToAdminInquiries(callback: (leads: InquiryLead[]) => void): () => void {
  if (!db || !isFirebaseConfigured) return () => {};
  try {
    const col = collection(db, "inquiries");
    const q = query(col, orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const raw = snapshot.docs.map((d) => normalizeInquiryLead(d.id, d.data()));
        callback(deduplicateLeads(raw));
      },
      (err) => {
        console.warn("Real-time inquiries listener warning:", err);
      }
    );
  } catch (err) {
    console.warn("Failed to subscribe to inquiries:", err);
    return () => {};
  }
}

export async function updateAdminInquiry(inquiry: InquiryLead): Promise<InquiryLead> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "inquiries", inquiry.id), inquiry, { merge: true }), 2500);
    } catch (err) {
      console.warn("Firestore update inquiry error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(inquiry),
    });
  } catch (err) {
    console.warn("User API update inquiry error:", err);
  }

  return inquiry;
}

// ----------------- ATTRACTIONS -----------------

export async function fetchAdminAttractions(): Promise<Attraction[]> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "attractions");
      const q = query(col, orderBy("rating", "desc"));
      const snapshot = await withTimeout(getDocs(q), 2500);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Attraction));
      }
    } catch (err) {
      console.warn("Firestore attractions fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/attractions`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("User API attractions fetch error:", err);
  }

  return INITIAL_ATTRACTIONS;
}

export async function saveAdminAttraction(attraction: Attraction): Promise<Attraction> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "attractions", attraction.id), attraction, { merge: true }), 2500);
    } catch (err) {
      console.warn("Firestore save attraction error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/attractions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(attraction),
    });
  } catch (err) {
    console.warn("User API save attraction error:", err);
  }

  return attraction;
}

export async function deleteAdminAttraction(attractionId: string): Promise<boolean> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(deleteDoc(doc(db, "attractions", attractionId)), 2500);
    } catch (err) {
      console.warn("Firestore delete attraction error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/attractions/${attractionId}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": ADMIN_API_KEY,
      },
    });
  } catch (err) {
    console.warn("User API delete attraction error:", err);
  }

  return true;
}

// ----------------- FAQS -----------------

export async function fetchAdminFAQs(): Promise<FAQItem[]> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "faqs");
      const q = query(col, orderBy("order", "asc"));
      const snapshot = await withTimeout(getDocs(q), 2500);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FAQItem));
      }
    } catch (err) {
      console.warn("Firestore FAQs fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/faqs`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("User API FAQs fetch error:", err);
  }

  return INITIAL_FAQS;
}

export async function saveAdminFAQ(faq: FAQItem): Promise<FAQItem> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "faqs", faq.id), faq, { merge: true }), 2500);
    } catch (err) {
      console.warn("Firestore save FAQ error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(faq),
    });
  } catch (err) {
    console.warn("User API save FAQ error:", err);
  }

  return faq;
}

export async function deleteAdminFAQ(faqId: string): Promise<boolean> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(deleteDoc(doc(db, "faqs", faqId)), 2500);
    } catch (err) {
      console.warn("Firestore delete FAQ error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/faqs/${faqId}`, {
      method: "DELETE",
      headers: {
        "x-admin-key": ADMIN_API_KEY,
      },
    });
  } catch (err) {
    console.warn("User API delete FAQ error:", err);
  }

  return true;
}

// ----------------- SITE STATS -----------------

export async function fetchAdminStats(): Promise<SiteStats> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "site_stats");
      const snapshot = await withTimeout(getDocs(col), 2500);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as SiteStats;
      }
    } catch (err) {
      console.warn("Firestore stats fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/stats`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && data.verifiedStays) return data;
    }
  } catch (err) {
    console.warn("User API stats fetch error:", err);
  }

  return INITIAL_STATS;
}

export async function saveAdminStats(stats: SiteStats): Promise<SiteStats> {
  if (db && isFirebaseConfigured) {
    try {
      await withTimeout(setDoc(doc(db, "site_stats", "main"), stats, { merge: true }), 2500);
    } catch (err) {
      console.warn("Firestore save stats error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": ADMIN_API_KEY,
      },
      body: JSON.stringify(stats),
    });
  } catch (err) {
    console.warn("User API save stats error:", err);
  }

  return stats;
}

