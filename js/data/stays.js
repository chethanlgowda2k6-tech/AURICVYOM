// AURICVYOM Stays & Hotels Marketplace Database (Pan-India Master Collection)

export const STAYS = [
  // ==========================================
  // RAJASTHAN
  // ==========================================
  {
    id: "stay-rambagh-jaipur",
    name: "Rambagh Palace — The Jewel of Jaipur",
    destinationId: "jaipur",
    destinationName: "Jaipur, Rajasthan",
    category: "Royal Heritage Palace",
    propertyType: "Luxury",
    pricePerNight: 55000,
    priceDisplay: "₹55,000 / night",
    taxesAndFees: 9900,
    rating: 4.99,
    reviewsCount: 840,
    cleanlinessRating: 5.00,
    locationRating: 4.98,
    serviceRating: 5.00,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Indoor & Outdoor Swimming Pool", "Free High-Speed Wi-Fi",
      "Air Conditioning", "Valet Parking", "Jiva Grande Spa", "Fine Dining Suvarna Mahal", "Peacock Gardens"
    ],
    description: "Former residence of the Maharaja of Jaipur, featuring 47 acres of manicured gardens, hand-carved marble corridors, and world-renowned Rajput hospitality.",
    roomTypes: [
      {
        id: "room-rambagh-palace-room",
        name: "Palace Chamber with Garden Vista",
        price: 55000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Four-Poster Antique Bed", "Italian Marble Bath", "Personal Royal Butler", "High Tea on Verandah"]
      },
      {
        id: "room-rambagh-grand-suite",
        name: "Maharani Grand Presidential Suite",
        price: 125000,
        bedType: "1 Master King Bed + Dressing Salon",
        maxGuests: 3,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Private Garden Terrace", "Chauffeured Vintage Car Transfer", "Gold-Accented Decor", "Curated Royal Dining"]
      }
    ],
    houseRules: [
      "Check-in from 2:00 PM | Check-out until 12:00 PM",
      "Government photo ID required for all guests",
      "Formal evening dress code in Suvarna Mahal restaurant",
      "Pets not permitted on palace grounds"
    ],
    cancellationPolicy: "Free cancellation up to 7 days prior to arrival. 1 night charge within 7 days."
  },
  {
    id: "stay-taj-lake-palace-udaipur",
    name: "Taj Lake Palace, Udaipur",
    destinationId: "udaipur",
    destinationName: "Udaipur, Rajasthan",
    category: "Floating Island Palace",
    propertyType: "Luxury",
    pricePerNight: 62000,
    priceDisplay: "₹62,000 / night",
    taxesAndFees: 11160,
    rating: 4.98,
    reviewsCount: 720,
    cleanlinessRating: 4.99,
    locationRating: 5.00,
    serviceRating: 4.98,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Private Speedboat Transfers", "Lake-Facing Pool", "Jiva Spa Boat",
      "Air Conditioning", "Valet Parking", "Rooftop Mewar Dining", "Free High-Speed Wi-Fi"
    ],
    description: "Built in 1746 on Lake Pichola, this white-marble marvel appears to float serenely on the shimmering waters, offering panoramic sunset views of Udaipur's City Palace.",
    roomTypes: [
      {
        id: "room-lake-palace-luxury",
        name: "Luxury Lake View Chamber",
        price: 62000,
        bedType: "1 Four-Poster King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Direct Lake Pichola Views", "Traditional Mewar Frescoes", "Complimentary Heritage Walk", "Champagne Check-in"]
      },
      {
        id: "room-lake-palace-royal-suite",
        name: "Grand Royal Suite with Lake Balcony",
        price: 110000,
        bedType: "1 King Bed + Lounge",
        maxGuests: 3,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Private Jharokha Balcony", "Jacuzzi overlooking City Palace", "Personal Butler", "Private Sunset Boat Charter"]
      }
    ],
    houseRules: [
      "Check-in from 2:00 PM | Check-out until 12:00 PM",
      "Accessible exclusively by private hotel speedboat from Jetty",
      "Valid passport or government photo ID required",
      "Commercial photography requires prior palace permit"
    ],
    cancellationPolicy: "Free cancellation up to 5 days before check-in. 1 night penalty thereafter."
  },
  {
    id: "stay-umaid-bhawan-jodhpur",
    name: "Umaid Bhawan Palace, Jodhpur",
    destinationId: "jodhpur",
    destinationName: "Jodhpur, Rajasthan",
    category: "Art Deco Palace",
    propertyType: "Hotels",
    pricePerNight: 58000,
    priceDisplay: "₹58,000 / night",
    taxesAndFees: 10440,
    rating: 4.97,
    reviewsCount: 560,
    cleanlinessRating: 4.99,
    locationRating: 4.96,
    serviceRating: 4.98,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Subterranean Zodiac Pool", "Jiva Grande Spa", "Vintage Car Drive",
      "Air Conditioning", "Valet Parking", "Pillared Verandah Dining", "Free Wi-Fi"
    ],
    description: "Perched atop Chittar Hill overlooking the Blue City, this golden sandstone masterpiece is one of the world's largest private royal residences.",
    roomTypes: [
      {
        id: "room-umaid-palace-room",
        name: "Palace Room with Royal Courtyard View",
        price: 58000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        features: ["Art Deco Interiors", "Royal Palace Museum Access", "Private Sommelier Tasting", "Marble Bath"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 7 days before check-in."
  },

  // ==========================================
  // MAHARASHTRA
  // ==========================================
  {
    id: "stay-taj-mahal-palace-mumbai",
    name: "The Taj Mahal Palace, Mumbai",
    destinationId: "mumbai",
    destinationName: "Mumbai, Maharashtra",
    category: "Iconic Heritage Landmark",
    propertyType: "Hotels",
    pricePerNight: 36000,
    priceDisplay: "₹36,000 / night",
    taxesAndFees: 6480,
    rating: 4.97,
    reviewsCount: 1450,
    cleanlinessRating: 4.98,
    locationRating: 5.00,
    serviceRating: 4.97,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Harbour-Facing Pool", "Jiva Spa", "10 Acclaimed Restaurants",
      "Air Conditioning", "Valet Parking", "Sea Lounge Afternoon Tea", "Free High-Speed Wi-Fi"
    ],
    description: "Standing opposite the Gateway of India since 1903, an emblem of timeless grandeur, historic architecture, and unmatched Arabian Sea views.",
    roomTypes: [
      {
        id: "room-taj-palace-sea-view",
        name: "Palace Wing Luxury Sea Facing Room",
        price: 36000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Arabian Sea & Gateway Views", "Heritage Wood Paneling", "Luxury Bath Amenities", "Personal Concierge"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 48 hours prior to arrival."
  },
  {
    id: "stay-machan-lonavala",
    name: "The Machan Treehouse Sanctuary",
    destinationId: "lonavala",
    destinationName: "Lonavala / Western Ghats, Maharashtra",
    category: "Eco Luxury Treehouse",
    propertyType: "Unique",
    pricePerNight: 22000,
    priceDisplay: "₹22,000 / night",
    taxesAndFees: 3960,
    rating: 4.93,
    reviewsCount: 380,
    cleanlinessRating: 4.92,
    locationRating: 4.98,
    serviceRating: 4.91,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Forest Canopy Deck", "Outdoor Open-Sky Bathtub",
      "Air Conditioning", "Free Parking", "Guided Nature Trails", "Stargazing Telescope", "Wi-Fi"
    ],
    description: "Exclusive treehouses rising 30 to 45 feet above the Sahyadri rainforest, offering 100% off-grid luxury and panoramic valley sunrises.",
    roomTypes: [
      {
        id: "room-canopy-machan",
        name: "Canopy Treehouse with Forest Jacuzzi",
        price: 22000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        features: ["Private Forest Stargazing Deck", "Outdoor Soaking Tub", "Complimentary High Tea", "Guided Trail"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 72 hours before check-in."
  },

  // ==========================================
  // DELHI & NCR
  // ==========================================
  {
    id: "stay-the-imperial-delhi",
    name: "The Imperial New Delhi",
    destinationId: "delhi",
    destinationName: "New Delhi, Delhi NCR",
    category: "Heritage Art Deco Sanctuary",
    propertyType: "Hotels",
    pricePerNight: 28000,
    priceDisplay: "₹28,000 / night",
    taxesAndFees: 5040,
    rating: 4.95,
    reviewsCount: 910,
    cleanlinessRating: 4.97,
    locationRating: 4.98,
    serviceRating: 4.96,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Imperial Spa", "Outdoor Swimming Pool", "Art Galleries",
      "Air Conditioning", "Valet Parking", "Fine Dining Spice Route", "Free High-Speed Wi-Fi"
    ],
    description: "Nestled on Janpath in the heart of Lutyens' Delhi, housing India’s largest private collection of British and Indian 18th-century art.",
    roomTypes: [
      {
        id: "room-imperial-heritage",
        name: "Heritage Room with Garden Views",
        price: 28000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["High Ceilings & Teak Furniture", "French Linen Bedding", "Marble Bathroom", "Art Tour Access"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 48 hours prior."
  },

  // ==========================================
  // GOA
  // ==========================================
  {
    id: "stay-taj-exotica-goa",
    name: "Taj Exotica Resort & Spa, Goa",
    destinationId: "goa",
    destinationName: "Benaulim, South Goa",
    category: "Mediterranean Beachfront Haven",
    propertyType: "Resort",
    pricePerNight: 34000,
    priceDisplay: "₹34,000 / night",
    taxesAndFees: 6120,
    rating: 4.96,
    reviewsCount: 810,
    cleanlinessRating: 4.98,
    locationRating: 4.99,
    serviceRating: 4.96,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Direct Beach Access", "Golf Course & Putting Green", "Jiva Spa",
      "Air Conditioning", "Valet Parking", "Fresh Seafood Grill", "Free High-Speed Wi-Fi"
    ],
    description: "Spread across 56 acres of lush gardens along Benaulim Beach, featuring Mediterranean villa architecture, palm-fringed lawns, and private sea-facing plunge pools.",
    roomTypes: [
      {
        id: "room-exotica-villa-sea",
        name: "Luxury Sea View Villa with Verandah",
        price: 34000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        features: ["Private Garden Balcony", "Arabian Sea Views", "Direct Beach Walkway", "Sundowner Cocktails"]
      },
      {
        id: "room-exotica-plunge-pool",
        name: "Presidential Villa with Private Plunge Pool",
        price: 68000,
        bedType: "2 King Bedrooms",
        maxGuests: 4,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Private Heated Plunge Pool", "Dedicated Butler", "Outdoor Dining Pavilion", "Spa Vouchers Included"]
      }
    ],
    houseRules: ["Check-in from 3:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 5 days before arrival."
  },

  // ==========================================
  // KERALA
  // ==========================================
  {
    id: "stay-kumarakom-lake-resort",
    name: "Kumarakom Lake Resort & Heritage Villas",
    destinationId: "kumarakom",
    destinationName: "Kumarakom (Vembanad Lake), Kerala",
    category: "Backwater Heritage Sanctuary",
    propertyType: "Resort",
    pricePerNight: 29500,
    priceDisplay: "₹29,500 / night",
    taxesAndFees: 5310,
    rating: 4.97,
    reviewsCount: 650,
    cleanlinessRating: 4.98,
    locationRating: 5.00,
    serviceRating: 4.97,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "250m Meandering Pool", "Ayurmana Ayurvedic Spa", "Sunset Lake Cruise",
      "Air Conditioning", "Valet Parking", "Ettukettu Seafood Dining", "Free Wi-Fi"
    ],
    description: "Reconstructed ancestral 16th-century Mana mansions alongside Lake Vembanad, featuring private courtyard open-air bathrooms and traditional houseboats.",
    roomTypes: [
      {
        id: "room-kumarakom-pool-villa",
        name: "Heritage Villa with Direct Meandering Pool Access",
        price: 29500,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        features: ["Step Directly into Meandering Pool", "Open-Air Kerala Courtyard Bath", "Daily Sunset Boat Cruise", "Tea & Snacks by the Lake"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 72 hours prior."
  },
  {
    id: "stay-brunton-boatyard-kochi",
    name: "Brunton Boatyard — CGH Earth",
    destinationId: "kochi",
    destinationName: "Fort Kochi, Kerala",
    category: "Colonial Harbor Homestay",
    propertyType: "Homestays",
    pricePerNight: 19500,
    priceDisplay: "₹19,500 / night",
    taxesAndFees: 3510,
    rating: 4.94,
    reviewsCount: 320,
    cleanlinessRating: 4.96,
    locationRating: 5.00,
    serviceRating: 4.95,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Harbor-View Swimming Pool", "Ayurvedic Treatments", "Historical Walk",
      "Air Conditioning", "Free Wi-Fi", "History84 Dining", "Sunset Dolphin Cruise"
    ],
    description: "Built on the site of a Victorian shipyard in Fort Kochi, blending Portuguese, Dutch, and British colonial aesthetics with views of traditional Chinese fishing nets.",
    roomTypes: [
      {
        id: "room-brunton-sea-face",
        name: "Sea Facing Colonial Suite",
        price: 19500,
        bedType: "1 Four-Poster King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Kochi Harbor Views", "Teak Wood Interiors", "Complimentary Sunset Cruise", "Organic Farm-to-Table Meals"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 48 hours before check-in."
  },

  // ==========================================
  // JAMMU & KASHMIR & LADAKH
  // ==========================================
  {
    id: "stay-lalit-grand-palace-srinagar",
    name: "The Lalit Grand Palace Srinagar",
    destinationId: "srinagar",
    destinationName: "Srinagar, Jammu & Kashmir",
    category: "Himalayan Lakefront Palace",
    propertyType: "Luxury",
    pricePerNight: 38000,
    priceDisplay: "₹38,000 / night",
    taxesAndFees: 6840,
    rating: 4.96,
    reviewsCount: 490,
    cleanlinessRating: 4.97,
    locationRating: 5.00,
    serviceRating: 4.96,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Heated Indoor Pool", "Rejuve Spa", "Private Chinar Lawns",
      "Central Heating & AC", "Valet Parking", "Kashmiri Wazwan Dining", "Free Wi-Fi"
    ],
    description: "Built in 1910 by Maharaja Pratap Singh, ringed by ancient Chinar trees overlooking Dal Lake and the snow-dusted Zabarwan mountain ranges.",
    roomTypes: [
      {
        id: "room-lalit-lake-view",
        name: "Palace Deluxe Room with Dal Lake View",
        price: 38000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Dal Lake & Mountain Views", "Handwoven Kashmiri Carpets", "Fireplace Heating", "Shikara Ride Access"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 5 days prior."
  },
  {
    id: "stay-sukoon-dal-lake",
    name: "Sukoon Luxury Eco-Houseboat",
    destinationId: "srinagar",
    destinationName: "Dal Lake, Srinagar, Jammu & Kashmir",
    category: "Heritage Cedar Houseboat",
    propertyType: "Unique",
    pricePerNight: 24000,
    priceDisplay: "₹24,000 / night",
    taxesAndFees: 4320,
    rating: 4.98,
    reviewsCount: 310,
    cleanlinessRating: 4.99,
    locationRating: 5.00,
    serviceRating: 4.98,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast & Dinner Included", "Rooftop Sundeck", "Private Shikara Transfers",
      "Heated Rooms", "Free Wi-Fi", "Kahwa Tea on Arrival", "Stargazing Telescope"
    ],
    description: "Kashmir’s first eco-luxury houseboat moored on the tranquil waters of Dal Lake, carved entirely from fragrant cedar with handcrafted Kashmiri pinjrakari woodwork.",
    roomTypes: [
      {
        id: "room-sukoon-suite",
        name: "Kashmir Cedar Suite with Water Balcony",
        price: 24000,
        bedType: "1 Four-Poster King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        features: ["Direct Water Views", "Carved Walnut Woodwork", "Gourmet Kashmiri Wazwan", "Private Morning Shikara Ride"]
      }
    ],
    houseRules: ["Check-in from 1:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 72 hours before arrival."
  },

  // ==========================================
  // HIMACHAL PRADESH
  // ==========================================
  {
    id: "stay-wildflower-hall-shimla",
    name: "Wildflower Hall, An Oberoi Resort",
    destinationId: "shimla",
    destinationName: "Shimla, Himachal Pradesh",
    category: "Alpine Mountain Sanctuary",
    propertyType: "Resort",
    pricePerNight: 42000,
    priceDisplay: "₹42,000 / night",
    taxesAndFees: 7560,
    rating: 4.99,
    reviewsCount: 580,
    cleanlinessRating: 5.00,
    locationRating: 4.99,
    serviceRating: 4.99,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Open-Air Heated Whirlpool", "Oberoi Spa", "Forest Ice Skating Rink",
      "Central Heating & AC", "Valet Parking", "The Restaurant with Valley Views", "Free Wi-Fi"
    ],
    description: "Perched 8,250 feet above sea level amidst 22 acres of protected pine and cedar forests, once the private highland home of Lord Kitchener.",
    roomTypes: [
      {
        id: "room-wildflower-mountain",
        name: "Premier Mountain View Room",
        price: 42000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        features: ["Snowy Himalayan Peak Views", "Deep Soaking Marble Tub", "Outdoor Heated Jacuzzi Access", "Forest Nature Trails"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 5 days before check-in."
  },

  // ==========================================
  // UTTARAKHAND
  // ==========================================
  {
    id: "stay-ananda-himalayas-rishikesh",
    name: "Ananda in the Himalayas — Holistic Wellness",
    destinationId: "rishikesh",
    destinationName: "Rishikesh / Dehradun, Uttarakhand",
    category: "Holistic Wellness Palace",
    propertyType: "Luxury",
    pricePerNight: 52000,
    priceDisplay: "₹52,000 / night",
    taxesAndFees: 9360,
    rating: 4.98,
    reviewsCount: 460,
    cleanlinessRating: 4.99,
    locationRating: 4.98,
    serviceRating: 4.99,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "All Ayurvedic Meals Included", "24,000 sq ft Wellness Spa", "Yoga & Meditation Pavilions",
      "Air Conditioning", "Valet Parking", "Ganga Valley Views", "Free High-Speed Wi-Fi"
    ],
    description: "Located on a 100-acre Maharaja’s palace estate overlooking the spiritual town of Rishikesh and the peaceful Ganges river valley.",
    roomTypes: [
      {
        id: "room-ananda-palace-view",
        name: "Palace View Room with Ganga Valley Deck",
        price: 52000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Ganges Valley Panoramic Balcony", "Daily Ayurvedic Doctor Consultation", "Inclusive Daily Yoga & Pranayama", "Organic Spa Cuisine"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM", "Adults only sanctuary (ages 14+)"],
    cancellationPolicy: "Free cancellation up to 7 days before arrival."
  },

  // ==========================================
  // UTTAR PRADESH
  // ==========================================
  {
    id: "stay-oberoi-amarvilas-agra",
    name: "The Oberoi Amarvilas — Taj Mahal View",
    destinationId: "agra",
    destinationName: "Agra, Uttar Pradesh",
    category: "Mughal Architecture Sanctuary",
    propertyType: "Luxury",
    pricePerNight: 48000,
    priceDisplay: "₹48,000 / night",
    taxesAndFees: 8640,
    rating: 4.99,
    reviewsCount: 1120,
    cleanlinessRating: 5.00,
    locationRating: 5.00,
    serviceRating: 4.99,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Direct Taj Mahal Views from every room", "Mughal Terraced Pool",
      "Air Conditioning", "Valet Parking", "Oberoi Spa", "Private Electric Golf Buggies to Taj", "Free Wi-Fi"
    ],
    description: "Located just 600 meters from the Taj Mahal, with fountains, terraced lawns, reflecting pools, and unobstructed monument views from every single guest room.",
    roomTypes: [
      {
        id: "room-amarvilas-premier-taj",
        name: "Premier Taj Mahal View Room with Private Balcony",
        price: 48000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Direct Unobstructed Taj Mahal View", "Private Balcony with Seating", "Butler Service", "VIP Express Entry to Taj Mahal"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 48 hours prior."
  },
  {
    id: "stay-brijrama-palace-varanasi",
    name: "BrijRama Palace, Darbhanga Ghat",
    destinationId: "varanasi",
    destinationName: "Varanasi, Uttar Pradesh",
    category: "Heritage River Palace",
    propertyType: "Unique",
    pricePerNight: 26000,
    priceDisplay: "₹26,000 / night",
    taxesAndFees: 4680,
    rating: 4.95,
    reviewsCount: 420,
    cleanlinessRating: 4.97,
    locationRating: 5.00,
    serviceRating: 4.95,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Private Riverboat Transfers", "Rooftop Aarti Deck",
      "Air Conditioning", "Vegetarian Fine Dining Darbhanga", "Live Classical Sitar", "Free Wi-Fi"
    ],
    description: "One of Varanasi's oldest heritage palaces directly on the sacred Darbhanga Ghat, built in 1812 with stone carvings and an authentic historical lift.",
    roomTypes: [
      {
        id: "room-brijrama-ghat-view",
        name: "Maharaja Ganga View Room",
        price: 26000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        features: ["Front-Row Ganges River View", "Private Evening Aarti Viewing Deck", "Pure Vegetarian Gourmet Cuisine", "Bajra Boat Transfer"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM", "Strictly non-alcoholic & vegetarian property"],
    cancellationPolicy: "Free cancellation up to 72 hours before check-in."
  },

  // ==========================================
  // TELANGANA
  // ==========================================
  {
    id: "stay-taj-falaknuma-hyderabad",
    name: "Taj Falaknuma Palace — Palace in the Clouds",
    destinationId: "hyderabad",
    destinationName: "Hyderabad, Telangana",
    category: "Nizam Royal Palace",
    propertyType: "Luxury",
    pricePerNight: 54000,
    priceDisplay: "₹54,000 / night",
    taxesAndFees: 9720,
    rating: 4.99,
    reviewsCount: 780,
    cleanlinessRating: 5.00,
    locationRating: 4.98,
    serviceRating: 5.00,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Horse-Drawn Carriage Arrival", "Jiva Spa", "101-Seater Dining Hall",
      "Air Conditioning", "Valet Parking", "Nizam's Private Library", "Free High-Speed Wi-Fi"
    ],
    description: "Elevated 2,000 feet above Hyderabad, the former residence of the Nizam features Venetian chandeliers, Italian marble staircases, and royal ceremonial carriage arrivals.",
    roomTypes: [
      {
        id: "room-falaknuma-palace",
        name: "Palace Room with Courtyard Balcony",
        price: 54000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Horse-Drawn Carriage Ride", "Rose Petal Shower Welcome", "Historian Guided Palace Tour", "Sufi Music by the Pool"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 5 days before check-in."
  },

  // ==========================================
  // WEST BENGAL & NORTHEAST
  // ==========================================
  {
    id: "stay-glenburn-tea-estate",
    name: "Glenburn Tea Estate & Boutique Sanctuary",
    destinationId: "darjeeling",
    destinationName: "Darjeeling, West Bengal",
    category: "Colonial Tea Plantation Lodge",
    propertyType: "Homestays",
    pricePerNight: 35000,
    priceDisplay: "₹35,000 / night",
    taxesAndFees: 6300,
    rating: 4.98,
    reviewsCount: 290,
    cleanlinessRating: 4.99,
    locationRating: 5.00,
    serviceRating: 4.99,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "All Gourmet Meals & High Teas Included", "Kanchenjunga Mountain Views", "Tea Tasting Sessions",
      "Fireplaces in Rooms", "Free Wi-Fi", "Private River Campsite", "Guided Tea Factory Tours"
    ],
    description: "A 1,600-acre working tea estate established by Scottish planters in 1859, overlooking the Rungeet River and the snowy peaks of Mount Kanchenjunga.",
    roomTypes: [
      {
        id: "room-glenburn-suite",
        name: "Planter's Suite with Kanchenjunga Panorama",
        price: 35000,
        bedType: "1 Four-Poster King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
        features: ["Kanchenjunga Sunrise View", "Hand-Embroidered Linens", "Fresh Tea Tasting by Master Planter", "Bonfire Dinners"]
      }
    ],
    houseRules: ["Check-in from 1:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 7 days before check-in."
  },
  {
    id: "stay-diphlu-river-lodge-assam",
    name: "Diphlu River Lodge, Kaziranga",
    destinationId: "kaziranga",
    destinationName: "Kaziranga (Guwahati), Assam",
    category: "Eco Safari Wildlife Lodge",
    propertyType: "Unique",
    pricePerNight: 23000,
    priceDisplay: "₹23,000 / night",
    taxesAndFees: 4140,
    rating: 4.95,
    reviewsCount: 240,
    cleanlinessRating: 4.96,
    locationRating: 5.00,
    serviceRating: 4.96,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "All Meals & Safari Briefings Included", "Overlooking Kaziranga National Park", "Riverbank Dining Deck",
      "Air Conditioning", "Free Wi-Fi", "Naturalist Escorted Safaris", "Tribal Dance Evenings"
    ],
    description: "Bamboo and thatch eco-cottages on stilts separating paddy fields from the Kaziranga jungle, where rhinos and wild elephants roam freely across the river.",
    roomTypes: [
      {
        id: "room-diphlu-river-cottage",
        name: "Riverbank Thatch Cottage on Stilts",
        price: 23000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Private River Balcony", "Kaziranga Jungle Views", "Assamese Gourmet Meals", "Private Naturalist Guide"]
      }
    ],
    houseRules: ["Check-in from 1:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 5 days before check-in."
  },

  // ==========================================
  // KARNATAKA
  // ==========================================
  {
    id: "stay-tamara-coorg",
    name: "The Tamara Coorg — Luxury Rainforest Resort",
    destinationId: "coorg",
    destinationName: "Coorg (Kodagu), Karnataka",
    category: "Luxury Rainforest Villa",
    propertyType: "Villas",
    pricePerNight: 24500,
    priceDisplay: "₹24,500 / night",
    taxesAndFees: 4410,
    rating: 4.96,
    reviewsCount: 420,
    cleanlinessRating: 4.98,
    locationRating: 4.99,
    serviceRating: 4.97,
    image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Infinity Swimming Pool", "Free High-Speed Wi-Fi",
      "Air Conditioning", "Valet Parking", "Forest Spa", "Fine Dining Restaurant", "Bar / Lounge"
    ],
    description: "Suspended on stilts over 180 acres of organic coffee and cardamom plantations, offering private valley decks and elevated dining under the rainforest canopy.",
    roomTypes: [
      {
        id: "room-tamara-luxury-villa",
        name: "Luxury Rainforest Cottage with Valley Deck",
        price: 24500,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        features: ["Private Forest Balcony", "Bathtub with Valley View", "Espresso Machine", "Complimentary High Tea"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 72 hours before check-in."
  },
  {
    id: "stay-leela-palace-bengaluru",
    name: "The Leela Palace Bengaluru",
    destinationId: "bengaluru",
    destinationName: "Bengaluru, Karnataka",
    category: "Mysore Royal Palace Hotel",
    propertyType: "Hotels",
    pricePerNight: 26000,
    priceDisplay: "₹26,000 / night",
    taxesAndFees: 4680,
    rating: 4.96,
    reviewsCount: 980,
    cleanlinessRating: 4.98,
    locationRating: 4.97,
    serviceRating: 4.96,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Outdoor Lagoon Pool", "Spa by ESPA", "9 Acres of Royal Gardens",
      "Air Conditioning", "Valet Parking", "Jamavar Indian Dining", "Free Wi-Fi"
    ],
    description: "Inspired by the architectural opulence of the Mysore Royal Palace, featuring copper domes, ornate plasterwork, and lush lagoon courtyards.",
    roomTypes: [
      {
        id: "room-leela-palace-deluxe",
        name: "Royal Premier Room with Balcony",
        price: 26000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        features: ["Private Garden Balcony", "Italian Marble Bath", "Butler on Call", "Lagoon Pool Access"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 12:00 PM"],
    cancellationPolicy: "Free cancellation up to 48 hours prior."
  },
  {
    id: "stay-evolve-back-kabini",
    name: "Evolve Back, Kuruba Safari Lodge, Kabini",
    destinationId: "kabini",
    destinationName: "Kabini, Nagarhole, Karnataka",
    category: "Heritage Safari Lodge",
    propertyType: "Resort",
    pricePerNight: 32000,
    priceDisplay: "₹32,000 / night",
    taxesAndFees: 5760,
    rating: 4.98,
    reviewsCount: 380,
    cleanlinessRating: 4.99,
    locationRating: 5.00,
    serviceRating: 4.98,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80"
    ],
    amenities: [
      "Breakfast Included", "Infinity Swimming Pool", "Free High-Speed Wi-Fi",
      "Air Conditioning", "Valet Parking", "Forest Spa", "Fine Dining Restaurant", "Pet Friendly"
    ],
    description: "Inspired by tribal Kuruba architecture, featuring private open-air Jacuzzis, infinity pools, and direct Kabini river frontage for safari cruises.",
    roomTypes: [
      {
        id: "room-evolve-jacuzzi-hut",
        name: "Safari Hut with Private Open-Air Jacuzzi",
        price: 32000,
        bedType: "1 King Bed",
        maxGuests: 2,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        features: ["Courtyard Jacuzzi", "Kabini River Views", "All Meals Included", "Evening Cultural Performance"]
      }
    ],
    houseRules: ["Check-in from 2:00 PM | Check-out until 11:00 AM"],
    cancellationPolicy: "Free cancellation up to 5 days before check-in."
  }
];

