import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
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

async function clearAllHotels() {
  console.log("Fetching hotels from Firestore to delete...");
  const hotelsCol = collection(db, "hotels");
  const snapshot = await getDocs(hotelsCol);
  
  console.log(`Found ${snapshot.size} hotels in Firestore. Deleting...`);
  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, "hotels", document.id));
  }
  console.log("All Firestore hotels deleted!");

  // Update siteStats
  await setDoc(doc(db, "siteStats", "current"), {
    verifiedStays: "0",
    satisfactionRate: "4.9 / 5.0",
    tariffPledge: "100%",
    avgResponseTime: "16 Min",
  }, { merge: true });
  console.log("Firestore siteStats updated to 0 verifiedStays.");

  // Clear local JSON
  const userHotelsFile = path.resolve(__dirname, "../../User/data/hotels.json");
  fs.writeFileSync(userHotelsFile, JSON.stringify([], null, 2), "utf-8");
  console.log("User/data/hotels.json cleared to []!");

  // Clear stats.json
  const userStatsFile = path.resolve(__dirname, "../../User/data/stats.json");
  if (fs.existsSync(userStatsFile)) {
    fs.writeFileSync(userStatsFile, JSON.stringify({
      verifiedStays: "0",
      satisfactionRate: "4.9 / 5.0",
      tariffPledge: "100%",
      avgResponseTime: "16 Min"
    }, null, 2), "utf-8");
  }

  process.exit(0);
}

clearAllHotels().catch((err) => {
  console.error("Error clearing hotels:", err);
  process.exit(1);
});
