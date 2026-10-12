import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const firebaseConfig = {
  apiKey: "AIzaSyCqJAgcMfdnyIzG-zFY3mdJDJxEO04tj-I",
  authDomain: "cherraproject.firebaseapp.com",
  projectId: "cherraproject",
  storageBucket: "cherraproject.firebasestorage.app",
  messagingSenderId: "528185893048",
  appId: "1:528185893048:web:6f359608b13a55a515d44d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const hotelsFile = path.resolve(__dirname, "../../User/data/hotels.json");
const hotelsRaw = fs.readFileSync(hotelsFile, "utf-8");
const hotels = JSON.parse(hotelsRaw);

console.log(`Starting Firestore upload for ${hotels.length} hotels...`);

async function uploadHotels() {
  let count = 0;
  for (const hotel of hotels) {
    try {
      await setDoc(doc(db, "hotels", hotel.id), hotel, { merge: true });
      count++;
      if (count % 10 === 0 || count === hotels.length) {
        console.log(`Uploaded ${count}/${hotels.length} hotels to Firestore.`);
      }
    } catch (err) {
      console.error(`Failed to upload ${hotel.name}:`, err.message);
    }
  }

  try {
    await setDoc(doc(db, "siteStats", "current"), {
      verifiedStays: `${hotels.length}+`,
      satisfactionRate: "4.9 / 5.0",
      tariffPledge: "100%",
      avgResponseTime: "16 Min",
    }, { merge: true });
    console.log("Updated siteStats in Firestore.");
  } catch (err) {
    console.error("Failed to update siteStats in Firestore:", err.message);
  }

  console.log("Firestore upload complete!");
  process.exit(0);
}

uploadHotels();
