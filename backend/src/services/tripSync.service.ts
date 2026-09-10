import { Response } from 'express';

export type TripEventType =
  | 'ITINERARY_ITEM_ADDED'
  | 'ITINERARY_ITEM_UPDATED'
  | 'ITINERARY_ITEM_DELETED'
  | 'PLACE_ADDED'
  | 'PLACE_DELETED'
  | 'POLL_CREATED'
  | 'POLL_VOTED'
  | 'POLL_CLOSED'
  | 'POLL_AUTO_RESOLVED'
  | 'EXPENSE_ADDED'
  | 'EXPENSE_UPDATED'
  | 'EXPENSE_DELETED'
  | 'MEMBER_JOINED'
  | 'OWNERSHIP_TRANSFERRED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_LEFT'
  | 'NEW_CHAT_MESSAGE'
  | 'TRIP_UPDATED'
  | 'EMERGENCY_SOS'
  | 'AUTOMATION_DISPATCH';

class TripSyncService {
  private activeConnections: Map<string, Set<Response>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Registers a client response for Server-Sent Events (SSE) for a specific trip.
   */
  public addClient(tripId: string, res: Response, userId?: string): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    if (!this.activeConnections.has(tripId)) {
      this.activeConnections.set(tripId, new Set());
    }

    const tripClients = this.activeConnections.get(tripId)!;
    tripClients.add(res);

    // Initial connection confirmation
    res.write(`event: connected\ndata: ${JSON.stringify({ tripId, userId, timestamp: new Date().toISOString() })}\n\n`);

    res.on('close', () => {
      tripClients.delete(res);
      if (tripClients.size === 0) {
        this.activeConnections.delete(tripId);
      }
    });
  }

  /**
   * Broadcasts a real-time event to all connected trip members.
   */
  public broadcast(tripId: string, eventType: TripEventType, payload: any): void {
    const tripClients = this.activeConnections.get(tripId);
    if (!tripClients || tripClients.size === 0) return;

    const eventPayload = `event: ${eventType}\ndata: ${JSON.stringify({
      eventType,
      payload,
      timestamp: new Date().toISOString()
    })}\n\n`;

    tripClients.forEach(client => {
      try {
        client.write(eventPayload);
      } catch (err) {
        console.warn(`[TripSyncService] Failed to write event to client for trip ${tripId}:`, err);
        tripClients.delete(client);
      }
    });
  }

  /**
   * Periodic SSE heartbeat comment to prevent proxy and browser timeouts.
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.activeConnections.forEach((clients) => {
        clients.forEach((client) => {
          try {
            client.write(': heartbeat\n\n');
          } catch (e) {
            clients.delete(client);
          }
        });
      });
    }, 20000);
  }

  public getSubscriberCount(tripId: string): number {
    return this.activeConnections.get(tripId)?.size || 0;
  }
}

export const tripSyncService = new TripSyncService();
