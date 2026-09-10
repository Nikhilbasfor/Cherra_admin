import { Hotel, InquiryLead } from "./types";
import { INITIAL_HOTELS, INITIAL_LEADS } from "./initialData";
import { db, isFirebaseConfigured } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

const USER_API_BASE = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:3000";

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
    const res = await fetch(`${USER_API_BASE}/api/hotels`, { cache: "no-store" });
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
      await withTimeout(setDoc(doc(db, "hotels", hotel.id), hotel, { merge: true }), 2500);
    } catch (err) {
      console.warn("Firestore save hotel error:", err);
    }
  }

  try {
    await fetch(`${USER_API_BASE}/api/hotels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    });
  } catch (err) {
    console.warn("User API delete hotel error:", err);
  }

  return true;
}

// ----------------- INQUIRIES / LEADS -----------------

export async function fetchAdminInquiries(): Promise<InquiryLead[]> {
  if (db && isFirebaseConfigured) {
    try {
      const col = collection(db, "inquiries");
      const q = query(col, orderBy("createdAt", "desc"));
      const snapshot = await withTimeout(getDocs(q), 2500);
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InquiryLead));
      }
    } catch (err) {
      console.warn("Firestore inquiries fetch error:", err);
    }
  }

  try {
    const res = await fetch(`${USER_API_BASE}/api/inquiries`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("User API inquiries fetch error:", err);
  }

  return INITIAL_LEADS;
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry),
    });
  } catch (err) {
    console.warn("User API update inquiry error:", err);
  }

  return inquiry;
}
