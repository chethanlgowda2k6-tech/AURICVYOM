import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const INDIAN_STATE_CAPITALS = [
  { id: "bengaluru", city: "Bengaluru", state: "Karnataka", tagline: "Discover India's vibrant Garden City and tech capital", famousLandmarks: "Vidhana Soudha • Bangalore Palace • Cubbon Park", bgImage: "./images/destinations/bengaluru-vidhana-soudha.jpg", exploreLink: "destinations", region: "South India" },
  { id: "jaipur", city: "Jaipur", state: "Rajasthan", tagline: "Step into the pink city of royal palaces and forts", famousLandmarks: "Hawa Mahal • Amer Fort • City Palace", bgImage: "./images/destinations/jaipur-hawa-mahal.jpg", exploreLink: "destinations", region: "North India" },
  { id: "hyderabad", city: "Hyderabad", state: "Telangana", tagline: "Where historic Nizami heritage meets modern India", famousLandmarks: "Charminar • Golconda Fort • Chowmahalla Palace", bgImage: "./images/destinations/hyderabad-charminar.jpg", exploreLink: "destinations", region: "South India" },
  { id: "mumbai", city: "Mumbai", state: "Maharashtra", tagline: "The city of dreams, Bollywood, and coastal sunsets", famousLandmarks: "Gateway of India • Marine Drive • Taj Mahal Palace", bgImage: "./images/destinations/mumbai-gateway-of-india.jpg", exploreLink: "destinations", region: "West India" },
  { id: "chennai", city: "Chennai", state: "Tamil Nadu", tagline: "Experience Dravidian architecture and sweeping urban beaches", famousLandmarks: "Marina Beach • Kapaleeshwarar Temple • Fort St. George", bgImage: "./images/destinations/chennai-marina-beach.jpg", exploreLink: "destinations", region: "South India" },
  { id: "kolkata", city: "Kolkata", state: "West Bengal", tagline: "The cultural capital of art, literature, and colonial heritage", famousLandmarks: "Victoria Memorial • Howrah Bridge • Dakshineswar Kali", bgImage: "./images/destinations/kolkata-victoria-memorial.jpg", exploreLink: "destinations", region: "East India" },
  { id: "lucknow", city: "Lucknow", state: "Uttar Pradesh", tagline: "Immerse in Awadhi culture, kebabs, and Mughal architecture", famousLandmarks: "Bara Imambara • Rumi Darwaza • Chota Imambara", bgImage: "./images/destinations/lucknow-bara-imambara.jpg", exploreLink: "destinations", region: "North India" },
  { id: "panaji", city: "Panaji", state: "Goa", tagline: "Stroll through colorful Portuguese quarters and riverside promenades", famousLandmarks: "Fontainhas • Immaculate Conception Church • Miramar", bgImage: "./images/destinations/panaji-fontainhas.jpg", exploreLink: "destinations", region: "West India" },
  { id: "bhubaneswar", city: "Bhubaneswar", state: "Odisha", tagline: "The temple city of India with ancient Kalinga architecture", famousLandmarks: "Lingaraj Temple • Udayagiri Caves • Mukteshvara Temple", bgImage: "./images/destinations/bhubaneswar-lingaraj-temple.jpg", exploreLink: "destinations", region: "East India" },
  { id: "gandhinagar", city: "Gandhinagar", state: "Gujarat", tagline: "The green twin city of Ahmedabad on the Sabarmati river", famousLandmarks: "Akshardham Temple • Adalaj Stepwell • Sarita Udyan", bgImage: "./images/destinations/gandhinagar-akshardham.jpg", exploreLink: "destinations", region: "West India" },
  { id: "patna", city: "Patna", state: "Bihar", tagline: "Walk in the footprints of ancient Pataliputra on the Ganges", famousLandmarks: "Golghar • Mahavir Mandir • Ganga Ghats", bgImage: "./images/destinations/patna-golghar.jpg", exploreLink: "destinations", region: "East India" },
  { id: "ranchi", city: "Ranchi", state: "Jharkhand", tagline: "Discover cascading waterfalls and tranquil hill plateaus", famousLandmarks: "Jagannath Temple • Dassam Falls • Hundru Falls", bgImage: "./images/destinations/ranchi-jagannath-temple.jpg", exploreLink: "destinations", region: "East India" },
  { id: "raipur", city: "Raipur", state: "Chhattisgarh", tagline: "Explore lake sanctuaries and vibrant tribal heartlands", famousLandmarks: "Naya Raipur • Swami Vivekananda Sarovar • Purkhauti Muktangan", bgImage: "./images/destinations/raipur-naya-raipur.jpg", exploreLink: "destinations", region: "Central India" },
  { id: "chandigarh", city: "Chandigarh", state: "Punjab & Haryana", tagline: "Experience Le Corbusier's meticulously planned modernist city", famousLandmarks: "Rock Garden • Capitol Complex • Sukhna Lake", bgImage: "./images/destinations/chandigarh-rock-garden.jpg", exploreLink: "destinations", region: "North India" },
  { id: "guwahati", city: "Dispur (Guwahati)", state: "Assam", tagline: "The gateway to Northeast India along the Brahmaputra", famousLandmarks: "Kamakhya Temple • Umananda Island • Assam State Museum", bgImage: "./images/destinations/guwahati-kamakhya-temple.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "thiruvananthapuram", city: "Thiruvananthapuram", state: "Kerala", tagline: "The evergreen city of India with ancient gold vaults", famousLandmarks: "Padmanabhaswamy Temple • Napier Museum • Kovalam", bgImage: "./images/destinations/thiruvananthapuram-padmanabhaswamy.jpg", exploreLink: "destinations", region: "South India" },
  { id: "shimla", city: "Shimla", state: "Himachal Pradesh", tagline: "The British summer capital draped in Himalayan snow", famousLandmarks: "The Ridge • Christ Church • Mall Road", bgImage: "./images/destinations/shimla-christ-church.jpg", exploreLink: "destinations", region: "North India" },
  { id: "gangtok", city: "Gangtok", state: "Sikkim", tagline: "A peaceful Himalayan sanctuary looking over Kanchenjunga", famousLandmarks: "Rumtek Monastery • MG Marg • Tsomgo Lake", bgImage: "./images/destinations/gangtok-rumtek-monastery.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "bhopal", city: "Bhopal", state: "Madhya Pradesh", tagline: "The city of lakes with royal mosques and historic museums", famousLandmarks: "Upper Lake • Taj-ul-Masajid • Bharat Bhavan", bgImage: "./images/destinations/bhopal-upper-lake.jpg", exploreLink: "destinations", region: "Central India" },
  { id: "dehradun", city: "Dehradun", state: "Uttarakhand", tagline: "A scenic valley town nestled in the Doon valley foothills", famousLandmarks: "Forest Research Institute • Robber's Cave • Sahastradhara", bgImage: "./images/destinations/dehradun-forest-research-institute.jpg", exploreLink: "destinations", region: "North India" },
  { id: "shillong", city: "Shillong", state: "Meghalaya", tagline: "The Scotland of the East with pine forests and waterfalls", famousLandmarks: "Shillong Peak • Umiam Lake • Elephant Falls", bgImage: "./images/destinations/shillong-shillong-peak.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "itanagar", city: "Itanagar", state: "Arunachal Pradesh", tagline: "A beautiful hillside capital wrapped in lush greenery", famousLandmarks: "Ita Fort • Theravada Gompa • Ganga Lake", bgImage: "./images/destinations/itanagar-ita-fort.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "imphal", city: "Imphal", state: "Manipur", tagline: "A historic valley featuring floating lakes and ancient ruins", famousLandmarks: "Kangla Fort • Loktak Lake • Ima Keithel", bgImage: "./images/destinations/imphal-kangla-fort.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "aizawl", city: "Aizawl", state: "Mizoram", tagline: "A stunning city set on the steep ridges of Mizo hills", famousLandmarks: "Durtlang Hills • Solomon's Temple • KV Paradise", bgImage: "./images/destinations/aizawl-durtlang-hills.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "kohima", city: "Kohima", state: "Nagaland", tagline: "A historic mountain town honoring Naga tribal heritage", famousLandmarks: "Naga Heritage Village • Kohima War Cemetery • Japfu Peak", bgImage: "./images/destinations/kohima-naga-heritage-village.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "agartala", city: "Agartala", state: "Tripura", tagline: "A laid-back cultural hub adorned with royal palaces", famousLandmarks: "Ujjayanta Palace • Neermahal • Sepahijala", bgImage: "./images/destinations/agartala-ujjayanta-palace.jpg", exploreLink: "destinations", region: "Northeast India" },
  { id: "amaravati", city: "Amaravati", state: "Andhra Pradesh", tagline: "A visionary capital inspired by ancient Buddhist heritage", famousLandmarks: "Dhyana Buddha Statue • Undavalli Caves • Krishna River", bgImage: "./images/destinations/amaravati-dhyana-buddha.jpg", exploreLink: "destinations", region: "South India" },
  { id: "srinagar", city: "Srinagar", state: "Jammu & Kashmir", tagline: "Paradise on earth defined by lakes, houseboats and gardens", famousLandmarks: "Dal Lake Shikara • Mughal Gardens • Shankaracharya Temple", bgImage: "./images/destinations/srinagar-dal-lake.jpg", exploreLink: "destinations", region: "North India" },
  { id: "delhi", city: "New Delhi", state: "National Capital", tagline: "The heart of India where millennia of empires collide", famousLandmarks: "India Gate • Red Fort • Qutub Minar", bgImage: "./images/destinations/delhi-india-gate.jpg", exploreLink: "destinations", region: "North India" }
];

async function main() {
  console.log('Seeding states and capitals...');

  // Create ADMIN user
  const adminPassword = "hashedpassword"; // Should be properly hashed using bcrypt
  await prisma.user.upsert({
    where: { email: 'admin@auricvyom.com' },
    update: {},
    create: {
      name: 'Auric Admin',
      email: 'admin@auricvyom.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Seed states and capitals
  let index = 0;
  for (const cap of INDIAN_STATE_CAPITALS) {
    const stateCode = cap.state.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() + index++;
    
    let state = await prisma.state.findUnique({ where: { name: cap.state } });
    
    if (!state) {
      state = await prisma.state.create({
        data: {
          name: cap.state,
          code: stateCode,
          capital: cap.city,
          region: cap.region,
          description: cap.tagline,
        }
      });
    }

    await prisma.destination.upsert({
      where: { name: cap.city },
      update: {},
      create: {
        id: cap.id,
        name: cap.city,
        stateId: state.id,
        city: cap.city,
        description: cap.tagline,
        heroImage: cap.bgImage,
        category: "TRENDING",
        featured: true,
      }
    });
  }

  console.log('Seeding curated luxury properties...');
  const sampleProperties = [
    {
      id: "stay-rambagh-jaipur",
      name: "Rambagh Palace — The Jewel of Jaipur",
      destinationCity: "Jaipur",
      propertyType: "Palace",
      starRating: 5.0,
      pricePerNight: 55000,
      currency: "INR",
      location: "Bhawani Singh Road, Jaipur, Rajasthan",
      description: "Former residence of the Maharaja of Jaipur, featuring 47 acres of manicured gardens, hand-carved marble corridors, and world-renowned Rajput hospitality.",
      cancellationWindowDays: 7,
      cancellationPolicyDescription: "Free cancellation up to 7 days before check-in. 50% refund thereafter.",
      featured: true,
      rooms: [
        { id: "room-rambagh-1", name: "Palace Chamber with Garden Vista", pricePerNight: 55000, capacity: 2 },
        { id: "room-rambagh-2", name: "Maharani Grand Presidential Suite", pricePerNight: 125000, capacity: 3 }
      ]
    },
    {
      id: "stay-taj-lake-palace-udaipur",
      name: "Taj Lake Palace — Floating Island Sanctuary",
      destinationCity: "Jaipur",
      propertyType: "Palace",
      starRating: 4.98,
      pricePerNight: 62000,
      currency: "INR",
      location: "Lake Pichola, Udaipur, Rajasthan",
      description: "Floating like a white marble vision in the center of Lake Pichola, built in 1746 by Maharana Jagat Singh II.",
      cancellationWindowDays: 7,
      cancellationPolicyDescription: "Free cancellation up to 7 days before check-in. 50% refund thereafter.",
      featured: true,
      rooms: [
        { id: "room-lake-1", name: "Luxury Lake View Palace Chamber", pricePerNight: 62000, capacity: 2 }
      ]
    },
    {
      id: "stay-tamara-coorg",
      name: "The Tamara Coorg — Canopy Luxury Retreat",
      destinationCity: "Bengaluru",
      propertyType: "Resort",
      starRating: 4.96,
      pricePerNight: 28500,
      currency: "INR",
      location: "Kabbinakad Estate, Coorg, Karnataka",
      description: "Perched 3,500 feet above sea level amidst 180 acres of organic coffee, cardamom, and pepper plantations.",
      cancellationWindowDays: 5,
      cancellationPolicyDescription: "Free cancellation up to 5 days before check-in. 50% refund thereafter.",
      featured: true,
      rooms: [
        { id: "room-tamara-1", name: "Luxury Wooden Treehouse Villa", pricePerNight: 28500, capacity: 2 }
      ]
    }
  ];

  for (const prop of sampleProperties) {
    const { rooms, destinationCity, ...propData } = prop;
    const dest = await prisma.destination.findFirst({ where: { city: destinationCity } }) || await prisma.destination.findFirst();
    if (!dest) continue;

    await prisma.property.upsert({
      where: { id: prop.id },
      update: { ...propData, destinationId: dest.id },
      create: { ...propData, destinationId: dest.id }
    });

    for (const r of rooms) {
      await prisma.room.upsert({
        where: { id: r.id },
        update: { ...r, propertyId: prop.id },
        create: { ...r, propertyId: prop.id }
      });
    }
  }

  // Seed Administrator Account
  const bcryptMod = await import('bcrypt');
  const hashedAdminPass = await bcryptMod.default.hash('AdminPassword123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@auricvyom.com' },
    update: { role: 'ADMIN', passwordHash: hashedAdminPass },
    create: {
      name: 'Auric Operations Manager',
      email: 'admin@auricvyom.com',
      passwordHash: hashedAdminPass,
      role: 'ADMIN',
      phone: '+91 98801 99999',
    }
  });

  console.log('Database seeding completed successfully (Destinations, Stays, Rooms, and Administrator seeded).');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
