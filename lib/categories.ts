export interface TravelCategory {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  title: string;
  description: string;
  targetKeywords: string[];
  heroBadge: string;
  starFilter?: number;
}

export const CHERRAPUNJI_TRAVEL_CATEGORIES: TravelCategory[] = [
  {
    id: "honeymoon-places-cherrapunji",
    name: "Honeymoon & Romantic Getaways",
    shortName: "Honeymoon",
    slug: "honeymoon-places-cherrapunji",
    title: "Best Honeymoon Places & Romantic Resorts in Cherrapunji",
    description: "Perched high above mystical cloud-filled gorges, romantic suites with private balconies and canyon views.",
    targetKeywords: [
      "best honeymoon places in cherrapunji",
      "romantic resorts in cherrapunji",
      "couples stay sohra",
    ],
    heroBadge: "Romantic Getaways & Suites",
  },
  {
    id: "family-stays-cherrapunji",
    name: "Family & Kid-Friendly Stays",
    shortName: "Family Stays",
    slug: "family-stays-cherrapunji",
    title: "Best Family Stays & Cottages in Cherrapunji",
    description: "Spacious multi-bed suites, private pine cottages, safe open lawns, and family dining.",
    targetKeywords: [
      "family stay in cherrapunji",
      "family cottage in cherrapunji",
      "family friendly hotels sohra",
    ],
    heroBadge: "Family Friendly & Cottages",
  },
  {
    id: "waterfall-cliff-view-hotels-cherrapunji",
    name: "Cliffside & Waterfall Views",
    shortName: "Waterfall & Cliff View",
    slug: "waterfall-cliff-view-hotels-cherrapunji",
    title: "Hotels with Waterfall & Cliffside Views in Cherrapunji",
    description: "Wake up directly to roaring cascades and sheer limestone canyon edges overlooking Seven Sisters Falls.",
    targetKeywords: [
      "hotels with waterfall view cherrapunji",
      "cliff view resort cherrapunji",
      "canyon view stays cherrapunji",
    ],
    heroBadge: "Direct Canyon & Waterfall Vistas",
  },
  {
    id: "luxury-resorts-cherrapunji",
    name: "Luxury 4 & 5-Star Resorts",
    shortName: "Luxury Resorts",
    slug: "luxury-resorts-cherrapunji",
    title: "Luxury Resorts in Cherrapunji | 4-Star & 5-Star Stays",
    description: "Indulge in premier mountain hospitality with infinity pools, fine dining, and spa treatments.",
    targetKeywords: [
      "luxury resort in cherrapunji",
      "5 star hotel cherrapunji",
      "best luxury resorts meghalaya",
    ],
    heroBadge: "Elite Comfort & Premium Dining",
  },
  {
    id: "budget-homestays-cherrapunji",
    name: "Budget & Backpacker Homestays",
    shortName: "Budget Homestays",
    slug: "budget-homestays-cherrapunji",
    title: "Best Budget Homestays & Backpacker Stays in Cherrapunji",
    description: "Clean, comfortable, and pocket-friendly accommodations with warm local Khasi families.",
    targetKeywords: [
      "budget hotel in cherrapunji",
      "cheap homestay in cherrapunji",
      "homestays in cherrapunji under 2000",
    ],
    heroBadge: "Affordable & Authentic Stays",
  },
  {
    id: "nature-pine-cottages-cherrapunji",
    name: "Nature & Boutique Pine Cottages",
    shortName: "Pine Cottages",
    slug: "nature-pine-cottages-cherrapunji",
    title: "Nature & Boutique Pine Cottages in Cherrapunji",
    description: "Rustic stone cottages amidst fragrant pine woods and natural mountain streams.",
    targetKeywords: [
      "pine cottages cherrapunji",
      "nature cottages sohra",
      "wooden cottages cherrapunji",
    ],
    heroBadge: "Pine Woods & Stone Architecture",
  },
  {
    id: "living-root-bridge-trek-stays-cherrapunji",
    name: "Trekking & Adventure Hub",
    shortName: "Trekker Stays",
    slug: "living-root-bridge-trek-stays-cherrapunji",
    title: "Hotels & Stays Near Double Decker Living Root Bridge",
    description: "Strategic basecamps for hikers exploring the 3,500-step trek down to Nongriat and Rainbow Falls.",
    targetKeywords: [
      "stay near double decker living root bridge",
      "hotels near tyrna trek",
      "trekking stay sohra",
    ],
    heroBadge: "Trailhead & Adventure Bases",
  },
  {
    id: "5-star-resorts-cherrapunji",
    name: "5 Star Resorts in Cherrapunji",
    shortName: "5 Star Resorts",
    slug: "5-star-resorts-cherrapunji",
    title: "Best 5 Star Resorts in Cherrapunji (2026 Direct Rates)",
    description: "Experience world-class luxury perched on dramatic cliff edges with infinity pools and five-star mountain hospitality.",
    targetKeywords: [
      "best 5 star resorts in cherrapunji",
      "5 star hotels in cherra",
      "5 star resort cherrapunji",
    ],
    heroBadge: "5 Star Luxury Resorts",
    starFilter: 5,
  },
  {
    id: "4-star-resorts-cherrapunji",
    name: "4 Star Resorts in Cherrapunji",
    shortName: "4 Star Resorts",
    slug: "4-star-resorts-cherrapunji",
    title: "Best 4 Star Resorts in Cherrapunji (2026 Direct Rates)",
    description: "Indulge in premium 4-star comfort amidst whispering pine groves and rolling mountain mist.",
    targetKeywords: [
      "best 4 star resorts in cherrapunji",
      "4 star hotels in cherra",
      "4 star resort cherrapunji",
    ],
    heroBadge: "4 Star Premium Resorts",
    starFilter: 4,
  },
  {
    id: "3-star-resorts-cherrapunji",
    name: "3 Star Resorts & Hotels in Cherrapunji",
    shortName: "3 Star Resorts",
    slug: "3-star-resorts-cherrapunji",
    title: "Best 3 Star Resorts & Hotels in Cherrapunji (2026 Direct Rates)",
    description: "Highly rated 3-star boutique resorts and cliff cottages offering breathtaking canyon views and warm hospitality.",
    targetKeywords: [
      "best 3 star resorts in cherrapunji",
      "3 star hotels in cherrapunji",
      "3 star hotels in cherra",
    ],
    heroBadge: "3 Star Comfort Stays",
    starFilter: 3,
  },
  {
    id: "2-star-budget-stays-cherrapunji",
    name: "2 Star & Budget Stays in Cherrapunji",
    shortName: "2 Star Stays",
    slug: "2-star-budget-stays-cherrapunji",
    title: "Best 2 Star & Budget Stays in Cherrapunji (2026 Direct Rates)",
    description: "Clean, comfortable, and centrally situated 2-star hotels close to Sohra markets and taxi stands.",
    targetKeywords: [
      "2 star hotels in cherrapunji",
      "2 star stays in cherra",
      "budget hotels cherrapunji",
    ],
    heroBadge: "2 Star Budget Stays",
    starFilter: 2,
  },
  {
    id: "1-star-backpacker-stays-cherrapunji",
    name: "1 Star & Backpacker Stays in Cherrapunji",
    shortName: "1 Star Stays",
    slug: "1-star-backpacker-stays-cherrapunji",
    title: "Best 1 Star & Backpacker Stays in Cherrapunji (2026 Direct Rates)",
    description: "Honest, affordable village guest accommodations for solo hikers and backpackers.",
    targetKeywords: [
      "1 star hotels in cherrapunji",
      "backpacker stays cherra",
    ],
    heroBadge: "1 Star Backpacker Stays",
    starFilter: 1,
  },
];
