import { Hotel, InquiryLead, Attraction, FAQItem, SiteStats } from "./types";

export const INITIAL_HOTELS: Hotel[] = [];

export const INITIAL_LEADS: InquiryLead[] = [
  {
    id: "lead-101",
    customerName: "Ananya Deshmukh",
    customerPhone: "+91 98201 44521",
    customerEmail: "ananya.d@gmail.com",
    hotelId: "polo-orchid-resort",
    hotelName: "Polo Orchid Resort",
    roomType: "Valley View Luxury Villa",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    guests: { adults: 2, children: 1 },
    specialRequests: "Anniversary celebration. Need cliff view room & airport cab.",
    status: "new",
    budget: 8500,
    notes: [],
    createdAt: "Just now",
  },
  {
    id: "lead-102",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98110 87654",
    customerEmail: "vikram.m@outlook.com",
    hotelId: "jiva-resort",
    hotelName: "Jiva Resort Cherrapunji",
    roomType: "Deluxe Pine Cottage",
    checkIn: "2026-10-20",
    checkOut: "2026-10-22",
    guests: { adults: 2, children: 0 },
    specialRequests: "Need quiet cottage away from reception.",
    status: "contacted",
    budget: 6200,
    notes: [
      {
        id: "n1",
        text: "Spoke with client on phone. Sent WhatsApp quotation with 10% advance details.",
        author: "Admin Desk",
        createdAt: "2 hours ago",
      },
    ],
    createdAt: "Today, 11:30 AM",
  },
  {
    id: "lead-103",
    customerName: "Rohan & Priyam Chatterjee",
    customerPhone: "+91 94330 19283",
    customerEmail: "rohan.chat@yahoo.in",
    hotelId: "cherrapunjee-holiday-resort",
    hotelName: "Cherrapunjee Holiday Resort",
    roomType: "Country Comfort Room",
    checkIn: "2026-11-02",
    checkOut: "2026-11-05",
    guests: { adults: 4, children: 0 },
    specialRequests: "Trekking guide needed for Double Decker living root bridge.",
    status: "quote_sent",
    budget: 3800,
    notes: [
      {
        id: "n2",
        text: "Sent customized 3-day trek itinerary with guide fee included.",
        author: "Trek Desk",
        createdAt: "Yesterday",
      },
    ],
    createdAt: "Yesterday, 04:15 PM",
  },
  {
    id: "lead-104",
    customerName: "Kavita Nair",
    customerPhone: "+91 97420 55671",
    customerEmail: "kavita.nair@techcorp.com",
    hotelId: "polo-orchid-resort",
    hotelName: "Polo Orchid Resort",
    roomType: "Presidential Mist Suite",
    checkIn: "2026-10-10",
    checkOut: "2026-10-13",
    guests: { adults: 4, children: 0 },
    specialRequests: "Confirmed booking with 50% deposit received.",
    status: "converted",
    budget: 13500,
    notes: [
      {
        id: "n3",
        text: "Advance payment of ₹20,000 received via UPI. Voucher emailed.",
        author: "Admin Desk",
        createdAt: "3 days ago",
      },
    ],
    createdAt: "3 days ago",
  },
];

export const INITIAL_ATTRACTIONS: Attraction[] = [
  {
    id: "nohkalikai-falls",
    name: "Nohkalikai Falls",
    khasiName: "Ka Likai",
    category: "Waterfall",
    description:
      "India's tallest plunge waterfall (340m), cascading straight down into an emerald-green natural plunge pool surrounded by evergreen cliffs.",
    distanceFromSohra: "7.5 km",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    bestTime: "Monsoon & Post-Monsoon",
  },
  {
    id: "double-decker-bridge",
    name: "Double Decker Living Root Bridge",
    khasiName: "Jingkieng Nongriat",
    category: "Living Root Bridge",
    description:
      "A 200-year-old biological marvel grown across the Umshiang river from the living roots of Ficus elastica trees in Nongriat village.",
    distanceFromSohra: "18 km (start from Tyrna + 3,500 steps trek)",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    bestTime: "September to May (Safe trekking)",
  },
  {
    id: "seven-sisters-falls",
    name: "Seven Sisters Falls",
    khasiName: "Nohsngithiang Falls",
    category: "Waterfall",
    description:
      "Seven segmented roaring waterfalls plunging down the limestone plateau cliffs facing Bangladesh, illuminated beautifully at sunset.",
    distanceFromSohra: "4 km",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    bestTime: "Peak Monsoon (July - Sept)",
  },
  {
    id: "mawsmai-cave",
    name: "Mawsmai Cave",
    khasiName: "Krem Mawsmai",
    category: "Caves",
    description:
      "An illuminated limestone cave system with ancient stalactites and stalagmites, giving visitors a thrilling spelunking adventure.",
    distanceFromSohra: "6 km",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    bestTime: "All Year Round",
  },
  {
    id: "wei-sawdong-falls",
    name: "Wei Sawdong Three-Tier Falls",
    khasiName: "Wei Sawdong",
    category: "Waterfall",
    description:
      "A breathtaking three-level stepped waterfall with crystal clear turquoise pools tucked within a pristine forest gorge.",
    distanceFromSohra: "14 km",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    bestTime: "September to April",
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What is the best time to visit Cherrapunji (Sohra)?",
    answer: "Cherrapunji is spectacular year-round. For roaring waterfalls and dramatic misty canyon clouds, the monsoon season from June to September is magical. For trekking down to the Double Decker Living Root Bridge and clear sunny skies, October to April is ideal.",
    order: 1,
  },
  {
    id: "faq-2",
    question: "How do I book hotels through CherraStays without commission?",
    answer: "When you submit an inquiry through our portal, your request connects directly with the resort management and our local desk in Sohra. There are no middleman surcharges, ensuring you get direct front-desk tariffs along with prompt WhatsApp verification.",
    order: 2,
  },
  {
    id: "faq-3",
    question: "Are hotels in Cherrapunji safe for families and solo female travelers?",
    answer: "Yes, exceptionally so. Meghalaya is globally recognized for its matrilineal society, peaceful culture, and warm Khasi hospitality. All hotels in our collection are verified physical properties adhering to strict safety and hygiene benchmarks.",
    order: 3,
  },
  {
    id: "faq-4",
    question: "Can hotels arrange airport transfers from Guwahati or Shillong?",
    answer: "Yes. Our partner resorts and boutique stays coordinate reliable cab pickups and drop-offs from Guwahati Airport (GAU) and Shillong Airport (SHL) with verified local drivers.",
    order: 4,
  },
  {
    id: "faq-5",
    question: "Do hotels in Cherrapunji provide 24/7 hot water geysers?",
    answer: "Yes. Because Cherrapunji remains crisp and misty throughout the year, every stay in our curated portfolio is equipped with reliable hot water geysers in private bathrooms.",
    order: 5,
  },
];

export const INITIAL_STATS: SiteStats = {
  verifiedStays: "0",
  satisfactionRate: "4.8 / 5.0",
  tariffPledge: "100%",
  avgResponseTime: "20 Min",
};

