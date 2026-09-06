// AURICVYOM RAG Knowledge Store Service
// Pre-indexes site content, properties, destinations, booking policies, and FAQs with source attribution

export interface KnowledgeChunk {
  id: string;
  title: string;
  category: 'policy' | 'property' | 'destination' | 'promo' | 'faq';
  content: string;
  keywords: string[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}

class KnowledgeStoreService {
  private chunks: KnowledgeChunk[] = [];

  constructor() {
    this.initKnowledgeBase();
  }

  private initKnowledgeBase() {
    this.chunks = [
      // 1. Booking & Cancellation Policies
      {
        id: 'policy-cancellation-engine',
        title: 'Sanctuary Cancellation Guarantee & Refund Policy',
        category: 'policy',
        keywords: ['cancellation', 'refund', 'cancel', 'policy', 'money back', 'free cancellation', 'window'],
        content: `AuricVyom operates a transparent, tiered Sanctuary Cancellation Policy for all luxury stays and villas:
- 100% Refund (Free Cancellation): Valid if cancelled 7 or more days prior to the scheduled check-in date.
- 50% Refund: Valid if cancelled between 1 to 6 days prior to scheduled check-in date.
- 0% Refund (Non-refundable): If cancelled within 24 hours of scheduled check-in or after check-in has passed.
Refunds are credited back to the guest's original payment method within 3 to 5 business days.`
      },
      {
        id: 'policy-room-hold-lock',
        title: 'Real-Time 10-Minute Room Availability Locking',
        category: 'policy',
        keywords: ['hold', 'lock', 'room lock', 'concurrency', 'double booking', '10 minutes', 'timer', 'availability'],
        content: `AuricVyom features real-time room availability locking to prevent double-booking:
- When a traveler initiates checkout (Step 1 of the booking flow), an exclusive short-lived hold of 10 minutes is placed on that room.
- While the hold is active, no other user can book or checkout that room for overlapping dates.
- If the checkout is completed or abandoned/closed, the hold is either converted into a confirmed reservation or immediately released back to the general inventory pool.`
      },
      {
        id: 'policy-verified-reviews',
        title: 'Verified Stay Review Gating & Authenticity',
        category: 'policy',
        keywords: ['review', 'verified stay', 'rating', 'feedback', 'stars', 'gating'],
        content: `To maintain absolute trust and integrity across the platform:
- Only authenticated guests with a completed or confirmed booking for that specific property can submit a review.
- Reviews submitted by verified guests receive the golden '⭐ Verified Luxury Stay' badge. Unauthenticated or unbooked attempts are rejected with HTTP 403 Forbidden.`
      },

      // 2. Promo Codes & Discounts
      {
        id: 'promo-auric10',
        title: 'Bespoke Welcome Promo Code: AURIC10',
        category: 'promo',
        keywords: ['promo', 'coupon', 'discount', 'auric10', 'offer', 'deal', 'promo code'],
        content: `Active Promo Code: AURIC10
- Benefit: 10% instant bespoke discount across all luxury suites, heritage palaces, and private villas on AuricVyom.
- Usage: Enter 'AURIC10' during Step 4 of the reservation checkout flow and click 'Apply'.`
      },

      // 3. Multi-Currency Display
      {
        id: 'faq-multi-currency',
        title: 'Multi-Currency Support for International Guests',
        category: 'faq',
        keywords: ['currency', 'usd', 'eur', 'gbp', 'inr', 'rupee', 'dollar', 'euro', 'exchange', 'price format'],
        content: `AuricVyom supports dynamic real-time multi-currency display:
- Supported Currencies: INR (₹ Indian Rupee), USD ($ US Dollar), EUR (€ Euro), and GBP (£ British Pound).
- Guests can switch currencies instantly using the top-right navbar currency selector. Base transactions are settled securely.`
      },

      // 4. Automated 3x Daily Notifications
      {
        id: 'faq-3x-notifications',
        title: 'Automated 3x Daily WhatsApp & Gmail Sanctuary Alerts',
        category: 'faq',
        keywords: ['whatsapp', 'gmail', 'notifications', 'sms', 'daily', 'schedule', 'alerts', '3 times'],
        content: `AuricVyom dispatches personalized luxury inspiration to registered travelers 3 times daily:
- 09:00 AM IST: Morning Sanctuary Inspiration (palatial breakfast views & heritage estates).
- 02:00 PM IST: Midday Curated Stays (private pool villas & coastal retreats).
- 08:00 PM IST: Evening Luxury Getaways (weekend escapes & member-rate unlocks).
Delivered to the traveler's registered WhatsApp phone number (+91) and primary Gmail.`
      },

      // 5. Featured Properties & Sanctuaries
      {
        id: 'property-rambagh-jaipur',
        title: 'Rambagh Palace — The Jewel of Jaipur',
        category: 'property',
        keywords: ['rambagh', 'jaipur', 'rajasthan', 'palace', 'maharaja', 'jiva spa', 'peacock'],
        content: `Rambagh Palace Jaipur:
- Location: Bhawani Singh Road, Jaipur, Rajasthan.
- Category: Heritage Palace (5-Star Luxury).
- Base Nightly Rate: ₹55,000 / night (plus 18% GST).
- Key Highlights: Former residence of the Maharaja of Jaipur, 47 acres of manicured royal gardens, 24/7 personal butler service, Jiva Grande Spa, Rajput fine dining at Suvarna Mahal.
- Available Suites: Palace Garden Suite, Historical Royal Chamber, Grand Presidential Suite.
- Cancellation Window: Free cancellation up to 7 days before arrival.`
      },
      {
        id: 'property-taj-lake-palace',
        title: 'Taj Lake Palace — Floating Marble Island Udaipur',
        category: 'property',
        keywords: ['taj lake palace', 'udaipur', 'lake pichola', 'rajasthan', 'floating palace', 'marble'],
        content: `Taj Lake Palace Udaipur:
- Location: Lake Pichola, Udaipur, Rajasthan.
- Category: Romantic Heritage Palace (5-Star Luxury).
- Base Nightly Rate: ₹62,000 / night (plus 18% GST).
- Key Highlights: Built in 1746 on a 4-acre island in Lake Pichola, private boat transfers, marble courtyards, Jharokha views of City Palace.
- Available Suites: Luxury Lake View Suite, Royal Palace Suite, Grand Royal Suite.
- Cancellation Window: Free cancellation up to 7 days before arrival.`
      },
      {
        id: 'property-tamara-coorg',
        title: 'The Tamara Coorg — Canopy Luxury Retreat',
        category: 'property',
        keywords: ['tamara', 'coorg', 'karnataka', 'coffee', 'plantation', 'treehouse', 'waterfall', 'nature'],
        content: `The Tamara Coorg:
- Location: Kabbinakad Estate, Coorg, Karnataka.
- Category: Nature & Wellness Highland Resort.
- Base Nightly Rate: ₹28,500 / night (plus 18% GST).
- Key Highlights: Perched 3,500 feet above sea level amidst 180 acres of organic coffee, cardamom, and pepper plantations, private natural waterfalls, wooden canopy treehouse villas, Ayurvedic wellness.
- Available Suites: Luxury Wooden Treehouse Villa, Eden Lotus Villa with private plunge pool.
- Cancellation Window: Free cancellation up to 5 days before arrival.`
      },
      {
        id: 'property-taj-exotica-goa',
        title: 'Taj Exotica Resort & Spa — Benaulim Coastal Villa Sanctuary',
        category: 'property',
        keywords: ['taj exotica', 'goa', 'benaulim', 'coastal', 'beach', 'villa', 'plunge pool'],
        content: `Taj Exotica Resort & Spa Goa:
- Location: Calwaddo, Benaulim, South Goa.
- Category: Coastal Luxury Resort & Private Villas.
- Base Nightly Rate: ₹32,000 / night (plus 18% GST).
- Key Highlights: 56 acres of Mediterranean-inspired grounds overlooking the Arabian Sea, private plunge pool villas, direct beach access, Jiva Spa.
- Available Suites: Premium Sea View Villa, Luxury Villa with Private Plunge Pool.
- Cancellation Window: Free cancellation up to 7 days before arrival.`
      },
      {
        id: 'property-wildflower-hall-shimla',
        title: 'Wildflower Hall — Luxury Himalayan Mountain Retreat',
        category: 'property',
        keywords: ['wildflower hall', 'shimla', 'himachal', 'himalayas', 'mountains', 'oberoi', 'snow', 'pine forest'],
        content: `Wildflower Hall Shimla:
- Location: Chharabra, Shimla, Himachal Pradesh.
- Category: Mountain Sanctuary & Alpine Estate.
- Base Nightly Rate: ₹38,000 / night (plus 18% GST).
- Key Highlights: Set 8,250 feet above sea level in 22 acres of cedar and pine forest, former residence of Lord Kitchener, outdoor heated infinity whirlpool with panoramic Himalayan peaks.
- Cancellation Window: Free cancellation up to 7 days before arrival.`
      },

      // 6. State Capitals & Major Destinations of India
      {
        id: 'destination-bengaluru',
        title: 'Bengaluru — The Garden City & Silicon Capital of India',
        category: 'destination',
        keywords: ['bengaluru', 'bangalore', 'karnataka', 'vidhana soudha', 'cubbon park', 'south india'],
        content: `Bengaluru, Karnataka:
- Famous Landmarks: Vidhana Soudha, Bangalore Palace, Cubbon Park, Tipu Sultan's Summer Palace.
- Region: South India.
- Highlights: Lush botanical gardens, cosmopolitan microbreweries, majestic neo-Dravidian architecture.`
      },
      {
        id: 'destination-jaipur',
        title: 'Jaipur — The Pink City of Royal Forts & Palaces',
        category: 'destination',
        keywords: ['jaipur', 'rajasthan', 'hawa mahal', 'amer fort', 'city palace', 'pink city', 'north india'],
        content: `Jaipur, Rajasthan:
- Famous Landmarks: Hawa Mahal, Amer Fort, City Palace, Jantar Mantar.
- Region: North India.
- Highlights: Regal Rajput palaces, vibrant bazaars, hand block-printing, palatial heritage dining.`
      },
      {
        id: 'destination-mumbai',
        title: 'Mumbai — The Maximum City of Coastal Sunsets',
        category: 'destination',
        keywords: ['mumbai', 'bombay', 'maharashtra', 'gateway of india', 'marine drive', 'taj mahal palace'],
        content: `Mumbai, Maharashtra:
- Famous Landmarks: Gateway of India, Marine Drive, Taj Mahal Palace Hotel, Chhatrapati Shivaji Maharaj Terminus.
- Region: West India.
- Highlights: Art deco promenades, Arabian Sea sunsets, culinary gastronomy, Bollywood heritage.`
      },
      {
        id: 'destination-srinagar',
        title: 'Srinagar — Paradise on Earth with Dal Lake & Shikaras',
        category: 'destination',
        keywords: ['srinagar', 'kashmir', 'jammu and kashmir', 'dal lake', 'shikara', 'mughal gardens'],
        content: `Srinagar, Jammu & Kashmir:
- Famous Landmarks: Dal Lake Shikaras, Mughal Gardens (Shalimar & Nishat Bagh), Shankaracharya Temple.
- Region: North India.
- Highlights: Floating luxury houseboats, snow-capped peaks, saffron harvests, Kashmiri Wazwan cuisine.`
      },
      {
        id: 'destination-panaji',
        title: 'Panaji — Portuguese Heritage Quarters & Riverside Promenades',
        category: 'destination',
        keywords: ['panaji', 'goa', 'fontainhas', 'miramar', 'mandovi', 'west india'],
        content: `Panaji, Goa:
- Famous Landmarks: Fontainhas Latin Quarter, Our Lady of the Immaculate Conception Church, Miramar Beach.
- Region: West India.
- Highlights: Colonial Portuguese architecture, riverside casinos, artisanal bakeries, coastal serenity.`
      }
    ];
  }

  search(query: string, topK = 4): SearchResult[] {
    const qTerms = query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    if (qTerms.length === 0) return [];

    const scoredResults: SearchResult[] = this.chunks.map(chunk => {
      let score = 0;
      const lowerContent = chunk.content.toLowerCase();
      const lowerTitle = chunk.title.toLowerCase();

      for (const term of qTerms) {
        // Keyword match
        if (chunk.keywords.some(k => k.toLowerCase().includes(term) || term.includes(k.toLowerCase()))) {
          score += 15;
        }
        // Title match
        if (lowerTitle.includes(term)) {
          score += 10;
        }
        // Content match count
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = (lowerContent.match(regex) || []).length;
        score += matches * 2;
      }

      return { chunk, score };
    });

    return scoredResults
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  getAllChunks(): KnowledgeChunk[] {
    return this.chunks;
  }
}

export const knowledgeStore = new KnowledgeStoreService();
