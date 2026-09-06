import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getStates = async (req: Request, res: Response) => {
  try {
    const states = await prisma.state.findMany({
      include: { destinations: true },
    });
    res.json({ success: true, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStateByCode = async (req: Request, res: Response) => {
  try {
    const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
    if (!code) return res.status(400).json({ success: false, message: 'Invalid code' });

    const state = await prisma.state.findUnique({
      where: { code: code.toUpperCase() },
      include: { destinations: { include: { attractions: true } } },
    });
    
    if (!state) return res.status(404).json({ success: false, message: 'State not found' });
    
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const { category, featured } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category as string;
    if (featured === 'true') filter.featured = true;

    const destinations = await prisma.destination.findMany({
      where: filter,
      include: { state: true },
    });
    
    res.json({ success: true, data: destinations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: { state: true, attractions: true, activities: true, cuisines: true, properties: true },
    });
    
    if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
    
    res.json({ success: true, data: destination });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const DEST_COORDS_MAP: Record<string, { lat: number; lng: number; name: string; state: string; landmark: string }> = {
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

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export const getNearbyDestinations = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radiusKm as string) || 150;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid lat and lng query parameters are required.' });
    }

    const allDestinations = Object.entries(DEST_COORDS_MAP).map(([id, item]) => {
      const distanceKm = haversineDist(lat, lng, item.lat, item.lng);
      return {
        id,
        name: item.name,
        state: item.state,
        landmark: item.landmark,
        lat: item.lat,
        lng: item.lng,
        distanceKm,
        distanceText: `${distanceKm} km away`,
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    const filtered = allDestinations.filter(d => d.distanceKm <= radiusKm);

    res.json({
      success: true,
      data: {
        userLocation: { lat, lng },
        radiusKm,
        destinations: filtered.length > 0 ? filtered : allDestinations.slice(0, 4),
        isExpanded: filtered.length === 0,
      }
    });
  } catch (error: any) {
    console.error('getNearbyDestinations error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve nearby destinations.' });
  }
};

