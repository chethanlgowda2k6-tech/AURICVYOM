import { Request, Response } from 'express';
import prisma from '../utils/prisma';

let cachedProperties: any = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

export const clearPropertiesCache = () => {
  cachedProperties = null;
  lastCacheTime = 0;
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { destinationId, type, featured } = req.query;
    
    // Serve from fast in-memory cache if general catalog query
    const now = Date.now();
    if (!destinationId && !type && !featured && cachedProperties && (now - lastCacheTime < CACHE_TTL_MS)) {
      res.json({ success: true, data: cachedProperties, cached: true });
      return;
    }

    const filter: any = {};
    if (destinationId) filter.destinationId = destinationId as string;
    if (type) filter.propertyType = type as string;
    if (featured === 'true') filter.featured = true;

    const properties = await prisma.property.findMany({
      where: filter,
      include: { images: true, rooms: true, amenities: { include: { amenity: true } }, destination: true },
    });
    
    if (!destinationId && !type && !featured) {
      cachedProperties = properties;
      lastCacheTime = now;
    }

    res.json({ success: true, data: properties });
  } catch (error: any) {
    // If database connection is momentarily saturated, fallback to cached data if available
    if (cachedProperties) {
      res.json({ success: true, data: cachedProperties, fallback: true });
      return;
    }
    console.error('getProperties error:', error?.message || error);
    res.status(500).json({ success: false, message: error?.message || 'Internal server error' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const property = await prisma.property.findUnique({
      where: { id },
      include: { images: true, rooms: true, amenities: { include: { amenity: true } }, destination: true, reviews: true },
    });
    
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const DESTINATION_COORDS: Record<string, { lat: number; lng: number; name: string; state: string; landmark: string }> = {
  'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur', state: 'Rajasthan', landmark: 'Hawa Mahal' },
  'ajmer': { lat: 26.4499, lng: 74.6399, name: 'Ajmer', state: 'Rajasthan', landmark: 'Ajmer Sharif' },
  'pushkar': { lat: 26.4897, lng: 74.5511, name: 'Pushkar', state: 'Rajasthan', landmark: 'Brahma Temple & Sacred Lake' },
  'udaipur': { lat: 24.5854, lng: 73.7125, name: 'Udaipur', state: 'Rajasthan', landmark: 'Lake Pichola' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, name: 'Jodhpur', state: 'Rajasthan', landmark: 'Mehrangarh Fort' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, name: 'Bengaluru', state: 'Karnataka', landmark: 'Vidhana Soudha' },
  'mysuru': { lat: 12.2958, lng: 76.6394, name: 'Mysuru', state: 'Karnataka', landmark: 'Mysore Palace' },
  'coorg': { lat: 12.3375, lng: 75.8069, name: 'Coorg', state: 'Karnataka', landmark: 'Abbey Falls' },
  'chikmagalur': { lat: 13.3161, lng: 75.7720, name: 'Chikmagalur', state: 'Karnataka', landmark: 'Mullayanagiri Peak' },
  'hampi': { lat: 15.3350, lng: 76.4600, name: 'Hampi', state: 'Karnataka', landmark: 'Stone Chariot' },
  'panaji': { lat: 15.4909, lng: 73.8278, name: 'Panaji', state: 'Goa', landmark: 'Fontainhas' },
  'mumbai': { lat: 18.9220, lng: 72.8347, name: 'Mumbai', state: 'Maharashtra', landmark: 'Gateway of India' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune', state: 'Maharashtra', landmark: 'Shaniwar Wada' },
  'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi', state: 'Delhi NCR', landmark: 'India Gate' },
  'agra': { lat: 27.1751, lng: 78.0421, name: 'Agra', state: 'Uttar Pradesh', landmark: 'Taj Mahal' },
  'varanasi': { lat: 25.3176, lng: 82.9739, name: 'Varanasi', state: 'Uttar Pradesh', landmark: 'Kashi Vishwanath Ghats' },
  'shimla': { lat: 31.1048, lng: 77.1734, name: 'Shimla', state: 'Himachal Pradesh', landmark: 'The Ridge & Mall' },
  'manali': { lat: 32.2432, lng: 77.1892, name: 'Manali', state: 'Himachal Pradesh', landmark: 'Solang Valley' },
  'srinagar': { lat: 34.0837, lng: 74.7973, name: 'Srinagar', state: 'Jammu & Kashmir', landmark: 'Dal Lake' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata', state: 'West Bengal', landmark: 'Victoria Memorial' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai', state: 'Tamil Nadu', landmark: 'Marina Beach' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad', state: 'Telangana', landmark: 'Charminar' },
  'kochi': { lat: 9.9312, lng: 76.2673, name: 'Kochi', state: 'Kerala', landmark: 'Fort Kochi' },
  'munnar': { lat: 10.0889, lng: 77.0595, name: 'Munnar', state: 'Kerala', landmark: 'Tea Gardens' }
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const getNearbyProperties = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radiusKm as string) || 150;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
    }

    const properties = await prisma.property.findMany({
      include: { images: true, rooms: true, destination: true },
    });

    // Compute distance for all properties based on their destination coordinates or location keywords
    const propertiesWithDistance = properties.map(p => {
      let pLat = 26.9124;
      let pLng = 75.7873;

      const destKey = Object.keys(DESTINATION_COORDS).find(k => 
        p.location.toLowerCase().includes(k) || 
        p.destination?.name.toLowerCase().includes(k) ||
        p.name.toLowerCase().includes(k)
      );

      if (destKey && DESTINATION_COORDS[destKey]) {
        pLat = DESTINATION_COORDS[destKey].lat;
        pLng = DESTINATION_COORDS[destKey].lng;
      }

      const distanceKm = haversineDistance(lat, lng, pLat, pLng);
      return {
        ...p,
        distanceKm,
        distanceText: `${distanceKm} km away`,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    // Compute nearby destinations sorted by distance
    const nearbyDestinations = Object.entries(DESTINATION_COORDS).map(([id, item]) => {
      const distanceKm = haversineDistance(lat, lng, item.lat, item.lng);
      return {
        id,
        name: item.name,
        state: item.state,
        landmark: item.landmark,
        lat: item.lat,
        lng: item.lng,
        distanceKm,
        distanceText: `${distanceKm} km`,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const filteredProperties = propertiesWithDistance.filter(p => p.distanceKm <= radiusKm);
    const filteredDestinations = nearbyDestinations.filter(d => d.distanceKm <= radiusKm);

    res.json({
      success: true,
      data: {
        userLocation: { lat, lng },
        radiusKm,
        properties: filteredProperties.length > 0 ? filteredProperties : propertiesWithDistance.slice(0, 4),
        nearbyDestinations: filteredDestinations.length > 0 ? filteredDestinations : nearbyDestinations.slice(0, 4),
        isExpanded: filteredDestinations.length === 0,
      }
    });
  } catch (error: any) {
    console.error('getNearbyProperties error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve nearby properties.' });
  }
};

