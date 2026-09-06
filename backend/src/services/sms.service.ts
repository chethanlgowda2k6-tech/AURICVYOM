// AuricVyom Centralized SMS Notification Service (Twilio Abstraction)

interface SMSOptions {
  to: string;
  body: string;
}

class SMSService {
  private accountSid: string | null;
  private authToken: string | null;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';
  }

  async sendSMS(options: SMSOptions): Promise<{ success: boolean; sid?: string; simulated?: boolean }> {
    const { to, body } = options;

    if (this.accountSid && this.authToken) {
      try {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const params = new URLSearchParams({
          To: to,
          From: this.fromNumber,
          Body: body,
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
          console.log(`[SMSService] Live SMS sent to ${to} (SID: ${data.sid})`);
          return { success: true, sid: data.sid };
        } else {
          const errText = await res.text();
          console.warn(`[SMSService] Twilio API failed, using simulated logger:`, errText);
        }
      } catch (err) {
        console.warn(`[SMSService] Network error sending via Twilio:`, err);
      }
    }

    // High-Fidelity Simulation Logger
    console.log(`\n======================================================`);
    console.log(`📱 [AURICVYOM SMS DISPATCH - SIMULATED / SANDBOX]`);
    console.log(`To: ${to}`);
    console.log(`Message: ${body}`);
    console.log(`======================================================\n`);

    return { success: true, sid: 'sim_sms_' + Date.now(), simulated: true };
  }

  async sendBookingConfirmationSMS(phone: string, booking: any, property: any) {
    const propertyName = property?.name || 'Sanctuary';
    const body = `Namaste! Your AuricVyom escape to ${propertyName} is confirmed. Voucher: ${booking.voucherCode || 'AV-PASS'}. Concierge desk is at your service.`;
    return this.sendSMS({ to: phone, body });
  }

  async sendCheckInReminderSMS(phone: string, booking: any, property: any) {
    const body = `Reminder: Your check-in at ${property?.name || 'Sanctuary'} is scheduled for tomorrow at ${property?.checkInTime || '14:00'}. Travel safe with AuricVyom.`;
    return this.sendSMS({ to: phone, body });
  }
}

export const smsService = new SMSService();
