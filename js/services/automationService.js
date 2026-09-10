/**
 * AuricVyom & VyomTogether Automation Client Service
 * Coordinates browser geolocation, SOS triggers, morning briefings,
 * real-time SSE automation events, and printable Digital Memory Journal export.
 */

class AutomationService {
  constructor() {
    this.apiBase = window.AURICVYOM_API_BASE || "http://localhost:5001/api/v1";
  }

  getAuthHeaders() {
    const token = (window.authService && window.authService.getStoredToken)
      ? window.authService.getStoredToken()
      : localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * Captures high-accuracy browser geolocation with a timeout fallback.
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve({});
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        (err) => {
          console.warn("[AutomationService] Geolocation unavailable or permission denied:", err.message);
          resolve({});
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  }

  /**
   * 1-Click Emergency SOS Broadcast with live GPS coordinates.
   */
  async triggerSOS(tripId, customAddress = "") {
    try {
      const coords = await this.getCurrentLocation();
      const payload = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: customAddress
      };

      const res = await fetch(`${this.apiBase}/automations/trips/${tripId}/sos`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[AutomationService] triggerSOS error:", err);
      return { success: false, message: "Network error triggering SOS" };
    }
  }

  /**
   * Fetch active automation statuses for a trip.
   */
  async fetchTripStatus(tripId) {
    try {
      const res = await fetch(`${this.apiBase}/automations/trips/${tripId}/status`, {
        headers: this.getAuthHeaders()
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error("[AutomationService] fetchTripStatus error:", err);
      return null;
    }
  }

  /**
   * Preview or trigger on-demand morning squad briefing.
   */
  async triggerMorningBriefing(tripId) {
    try {
      const res = await fetch(`${this.apiBase}/automations/trips/${tripId}/morning-briefing`, {
        method: "POST",
        headers: this.getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error("[AutomationService] triggerMorningBriefing error:", err);
      return { success: false, message: "Failed to trigger morning briefing" };
    }
  }

  /**
   * Trigger post-trip debt settlement reminders on WhatsApp.
   */
  async triggerSettlementReminders(tripId) {
    try {
      const res = await fetch(`${this.apiBase}/automations/trips/${tripId}/settlement-reminders`, {
        method: "POST",
        headers: this.getAuthHeaders()
      });
      return await res.json();
    } catch (err) {
      console.error("[AutomationService] triggerSettlementReminders error:", err);
      return { success: false, message: "Failed to dispatch settlement reminders" };
    }
  }

  /**
   * Exports an aesthetic, printable Digital Memory Journal & Itinerary Voucher for the squad.
   */
  openPrintableMemoryJournal(trip) {
    if (!trip) return;

    const startDate = new Date(trip.startDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const endDate = new Date(trip.endDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    const membersList = (trip.members || [])
      .map(m => `
        <div style="display:inline-flex; align-items:center; gap:8px; background:#18181b; border:1px solid #27272a; padding:6px 12px; border-radius:20px; font-size:12px; margin:4px;">
          <span>${m.role === 'OWNER' ? '👑' : '👤'}</span>
          <span style="font-weight:600; color:#f4f4f5;">${m.user?.name || 'Traveler'}</span>
          <span style="color:#a1a1aa; font-size:10px;">(${m.role})</span>
        </div>
      `)
      .join("");

    // Group itinerary by day
    const itemsByDay = {};
    (trip.itineraryItems || []).forEach(item => {
      const d = item.dayNumber || 1;
      if (!itemsByDay[d]) itemsByDay[d] = [];
      itemsByDay[d].push(item);
    });

    const itineraryHtml = Object.keys(itemsByDay).length > 0
      ? Object.keys(itemsByDay).sort((a,b) => Number(a) - Number(b)).map(day => `
          <div style="margin-bottom:20px;">
            <h4 style="color:#d4af37; font-size:15px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; border-bottom:1px solid #27272a; padding-bottom:4px;">
              Day ${day} Schedule
            </h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${itemsByDay[day].map(it => `
                <div style="display:flex; align-items:baseline; justify-content:space-between; background:#18181b; padding:10px 14px; border-radius:8px; border-left:3px solid #d4af37;">
                  <div>
                    <div style="font-weight:600; color:#fafafa; font-size:14px;">${it.title}</div>
                    ${it.description ? `<div style="font-size:12px; color:#a1a1aa; margin-top:2px;">${it.description}</div>` : ''}
                  </div>
                  <div style="font-size:12px; color:#d4af37; font-weight:600; white-space:nowrap; margin-left:12px;">
                    ${it.startTime || 'Scheduled'}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")
      : `<p style="color:#71717a; font-style:italic;">No formal scheduled itinerary items recorded yet.</p>`;

    // Expenses summary
    const totalExpenses = (trip.expenses || []).reduce((sum, e) => sum + (e.deletedAt ? 0 : e.amount), 0);

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AuricVyom & VyomTogether — ${trip.name} Memory Journal</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          body {
            background: #09090b;
            color: #e4e4e7;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #111114;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          }
          .brand-header {
            text-align: center;
            border-bottom: 1px solid #27272a;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .brand-title {
            font-family: 'Cinzel', serif;
            color: #d4af37;
            font-size: 28px;
            letter-spacing: 2px;
            margin: 0 0 6px 0;
          }
          .brand-subtitle {
            color: #a1a1aa;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .trip-hero {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 30px;
            background: linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(24,24,27,0.4) 100%);
            border: 1px solid rgba(212,175,55,0.25);
            padding: 24px;
            border-radius: 12px;
          }
          .print-btn {
            background: linear-gradient(135deg, #d4af37, #aa820a);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
            font-size: 13px;
            transition: opacity 0.2s;
          }
          .print-btn:hover { opacity: 0.9; }
          @media print {
            body { background: #fff; color: #000; padding: 0; }
            .container { border: none; box-shadow: none; padding: 20px; max-width: 100%; }
            .no-print { display: none !important; }
            .brand-title { color: #854d0e; }
            .trip-hero { border: 1px solid #ccc; background: #fafafa; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="no-print" style="text-align: right; margin-bottom: 20px;">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>

          <div class="brand-header">
            <div class="brand-title">AURICVYOM & VYOMTOGETHER</div>
            <div class="brand-subtitle">Official Collaborative Expedition Journal & Itinerary Voucher</div>
          </div>

          <div class="trip-hero">
            <div>
              <div style="font-size:12px; color:#d4af37; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Expedition Summary</div>
              <h1 style="font-family:'Cinzel', serif; font-size:26px; color:#fff; margin:6px 0 8px 0;">${trip.name}</h1>
              <div style="color:#d4d4d8; font-size:14px;">📍 Destination: <strong>${trip.destination}</strong></div>
              <div style="color:#a1a1aa; font-size:13px; margin-top:4px;">🗓️ Dates: ${startDate} — ${endDate}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px; color:#a1a1aa;">Invite Passcode</div>
              <div style="font-family:monospace; font-size:20px; font-weight:700; color:#d4af37; letter-spacing:2px;">${trip.inviteCode}</div>
              <div style="font-size:12px; color:#a1a1aa; margin-top:6px;">Total Squad Spend: <strong style="color:#fff;">₹${Math.round(totalExpenses).toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <div style="margin-bottom:30px;">
            <h3 style="font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#a1a1aa; margin-bottom:10px;">Traveler Squad Roster</h3>
            <div>${membersList}</div>
          </div>

          <div style="margin-bottom:30px;">
            <h3 style="font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#a1a1aa; margin-bottom:16px;">Curated Itinerary & Timeline</h3>
            ${itineraryHtml}
          </div>

          <div style="border-top:1px solid #27272a; padding-top:20px; font-size:11px; color:#71717a; text-align:center;">
            AuricVyom 24/7 Luxury Travel Concierge &bull; Diamond Status Verification ID: ${trip.id} &bull; Generated dynamically via VyomTogether Intelligent Automation Engine.
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  }
}

export const automationService = new AutomationService();
if (typeof window !== "undefined") {
  window.automationService = automationService;
}
