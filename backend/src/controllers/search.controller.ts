import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query parameter is required' });
    }

    // Search across destinations, properties, and states
    const [destinations, properties, states] = await Promise.all([
      prisma.destination.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.property.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      prisma.state.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { capital: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 3
      })
    ]);

    res.json({ 
      success: true, 
      data: {
        destinations,
        properties,
        states
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
