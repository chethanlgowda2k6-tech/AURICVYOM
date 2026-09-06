// AuricVyom Centralized WhatsApp Messaging Service (Twilio & Meta Cloud API Abstraction)

interface WhatsAppOptions {
  toPhone: string;
  message: string;
  ctaLink?: string;
  mediaUrl?: string;
}

class WhatsAppService {
  private accountSid: string | null;
  private authToken: string | null;
  private fromWhatsAppNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  }

  async sendWhatsAppMessage(options: WhatsAppOptions): Promise<{ success: boolean; sid?: string; simulated?: boolean }> {
    const { toPhone, message, ctaLink, mediaUrl } = options;
    const formattedTo = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone.startsWith('+') ? toPhone : '+91' + toPhone.replace(/\D/g, '')}`;

    if (this.accountSid && this.authToken) {
      try {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const bodyContent = ctaLink ? `${message}\n\n👉 Reserve on AuricVyom: ${ctaLink}` : message;

        const params = new URLSearchParams({
          To: formattedTo,
          From: this.fromWhatsAppNumber,
          Body: bodyContent,
          ...(mediaUrl ? { MediaUrl: mediaUrl } : {}),
        });

        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
          body: params.toString(),
        });

        if (res.ok) {
          const data = await res.json() as any;
          console.log(`[WhatsAppService] Live WhatsApp dispatched to ${formattedTo} (SID: ${data.sid})`);
          return { success: true, sid: data.sid };
        } else {
          const errText = await res.text();
          console.warn(`[WhatsAppService] Live WhatsApp API notice (using sandbox fallback):`, errText);
        }
      } catch (err) {
        console.warn(`[WhatsAppService] Network error sending WhatsApp:`, err);
      }
    }

    // High-Fidelity Simulation Logger
    console.log(`\n======================================================`);
    console.log(`🟢 [AURICVYOM WHATSAPP DISPATCH - SIMULATED / SANDBOX]`);
    console.log(`To: ${formattedTo}`);
    console.log(`From: ${this.fromWhatsAppNumber}`);
    console.log(`------------------------------------------------------`);
    console.log(`Message:`);
    console.log(message);
    if (ctaLink) console.log(`CTA Link: ${ctaLink}`);
    if (mediaUrl) console.log(`Media Attached: ${mediaUrl}`);
    console.log(`======================================================\n`);

    return { success: true, sid: 'sim_wa_' + Date.now(), simulated: true };
  }

  async sendDailyStayInspiration(toPhone: string, user: any, stay: any, slot: 'morning' | 'afternoon' | 'evening') {
    const firstName = user?.name ? user.name.split(' ')[0] : 'Noble Traveler';
    const propertyName = stay?.name || 'Rambagh Palace Jaipur';
    const location = stay?.location || stay?.destinationName || 'India';
    const price = stay?.pricePerNight ? `₹${stay.pricePerNight.toLocaleString('en-IN')}` : '₹28,500';

    let header = '';
    let body = '';

    if (slot === 'morning') {
      header = `🌅 *Good Morning from AuricVyom, ${firstName}!*`;
      body = `Awaken to royal splendor. Picture having morning breakfast on the lush peacock lawns of *${propertyName}* in ${location}.\n\n✨ Exclusive Diamond Member Suite: ${price}/night\n✨ Complimentary VIP Airport Escort & High Tea included.`;
    } else if (slot === 'afternoon') {
      header = `☀️ *Midday Wanderlust with AuricVyom, ${firstName}!*`;
      body = `Need a rejuvenating escape from the routine? Retreat to *${propertyName}* in ${location}.\n\n🌿 Private plunge pools, artisanal Ayurvedic spa, and Michelin-inspired dining await.\n✨ Starting from ${price}/night.`;
    } else {
      header = `🌙 *Evening Sanctuary Reflection, ${firstName}!*`;
      body = `Your weekend getaway is one click away. Unwind under starry skies at *${propertyName}* in ${location}.\n\n👑 10-Minute Instant Room Lock & Best Rate Guarantee active on your account.\n✨ Member Rate: ${price}/night.`;
    }

    const fullMessage = `${header}\n\n${body}\n\n💬 Reply 'CONCIERGE' for bespoke assistance.`;
    const ctaLink = `http://localhost:3000/#stays`;

    return this.sendWhatsAppMessage({
      toPhone,
      message: fullMessage,
      ctaLink,
      mediaUrl: stay?.image,
    });
  }
}

export const whatsappService = new WhatsAppService();
