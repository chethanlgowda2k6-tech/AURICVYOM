import { Request, Response } from 'express';

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const { from, to, date, passengers } = req.query;
    
    // Abstracting Flight Search API (e.g., Amadeus / Skyscanner Mock)
    const mockFlights = [
      {
        id: `fl_${Math.random().toString(36).substring(7)}`,
        airline: 'Air India',
        flightNumber: 'AI-809',
        departure: { airport: from || 'DEL', time: '10:00 AM' },
        arrival: { airport: to || 'BOM', time: '12:15 PM' },
        duration: '2h 15m',
        price: 5500,
        currency: 'INR'
      }
    ];

    res.json({ success: true, data: mockFlights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const searchTrains = async (req: Request, res: Response) => {
  try {
    const { from, to, date } = req.query;
    
    // Abstracting IRCTC API Mock
    const mockTrains = [
      {
        id: `tr_${Math.random().toString(36).substring(7)}`,
        trainName: 'Vande Bharat Express',
        trainNumber: '22436',
        departure: { station: from || 'NDLS', time: '06:00 AM' },
        arrival: { station: to || 'BSB', time: '02:00 PM' },
        duration: '8h 00m',
        classes: ['CC', 'EC'],
        price: 1800,
        currency: 'INR'
      }
    ];

    res.json({ success: true, data: mockTrains });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
