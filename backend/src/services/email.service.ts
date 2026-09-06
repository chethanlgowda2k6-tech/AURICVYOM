// AuricVyom Centralized Email Notification Service (SendGrid Abstraction)

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private apiKey: string | null;
  private fromEmail: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || null;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'concierge@auricvyom.com';
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    const { to, subject, html, text } = options;

    if (this.apiKey) {
      try {
        // Live SendGrid API request
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: this.fromEmail, name: 'AuricVyom Bespoke Concierge' },
            subject,
            content: [
              { type: 'text/html', value: html },
              ...(text ? [{ type: 'text/plain', value: text }] : []),
            ],
          }),
        });

        if (res.ok) {
          console.log(`[EmailService] Live email dispatched to ${to} (${subject})`);
          return { success: true, messageId: res.headers.get('x-message-id') || 'sg_' + Date.now() };
        } else {
          const errText = await res.text();
          console.warn(`[EmailService] SendGrid API failed, falling back to simulated dispatch:`, errText);
        }
      } catch (err) {
        console.warn(`[EmailService] Network error sending via SendGrid:`, err);
      }
    }

    // High-Fidelity Simulation Logger (for local development and demo testing)
    console.log(`\n======================================================`);
    console.log(`📨 [AURICVYOM EMAIL DISPATCH - SIMULATED / SANDBOX]`);
    console.log(`To: ${to}`);
    console.log(`From: ${this.fromEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`------------------------------------------------------`);
    console.log(`Summary: ${text || 'HTML Email Body Delivered'}`);
    console.log(`======================================================\n`);

    return { success: true, messageId: 'sim_email_' + Date.now(), simulated: true };
  }

  async sendBookingConfirmation(booking: any, user: any, property: any) {
    const subject = `👑 Your Bespoke Journey is Confirmed: ${booking.voucherCode || 'AV-PASS'}`;
    const html = `
      <div style="background:#080c14; color:#ffffff; font-family: 'Playfair Display', Georgia, serif; padding: 40px 24px; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #d4af37; font-size: 28px; margin: 0;">AuricVyom</h1>
          <p style="color: #cbd5e1; font-size: 14px; margin-top: 4px; letter-spacing: 2px;">BESPOKE INDIAN JOURNEYS</p>
        </div>
        
        <div style="background: rgba(212,175,55,0.08); border: 1px solid #d4af37; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="color: #10b981; font-weight: bold; font-size: 13px; letter-spacing: 1px;">● RESERVATION CONFIRMED</span>
          <h2 style="color: #ffffff; font-size: 20px; margin: 8px 0;">Voucher Pass: ${booking.voucherCode || 'AV-82910'}</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0;">Lead Guest: <strong>${user.name || 'Noble Traveler'}</strong></p>
        </div>

        <div style="margin-bottom: 24px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          <p><strong>Sanctuary:</strong> ${property?.name || 'Luxury Estate'}</p>
          <p><strong>Location:</strong> ${property?.location || 'India'}</p>
          <p><strong>Dates:</strong> ${booking.startDate || '2026-10-01'} to ${booking.endDate || '2026-10-04'}</p>
          <p><strong>Total Amount:</strong> ₹${(booking.totalAmount || 0).toLocaleString('en-IN')} (All Taxes Included)</p>
          <p><strong>Cancellation Policy:</strong> ${property?.cancellationPolicyDescription || 'Free cancellation until 7 days prior'}</p>
        </div>

        <div style="border-top: 1px solid rgba(212,175,55,0.3); padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>Need private airport escort or itinerary adjustments? Reply directly to your VIP Concierge desk.</p>
          <p>© 2026 AuricVyom Travel Technologies Private Limited.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Your AuricVyom reservation ${booking.voucherCode} at ${property?.name || 'Luxury Stay'} is confirmed for ₹${(booking.totalAmount || 0).toLocaleString('en-IN')}.`,
    });
  }

  async sendBookingCancellation(booking: any, user: any, cancellation: any) {
    const subject = `Notice of Cancellation: ${booking.voucherCode || 'Reservation'}`;
    const html = `
      <div style="background:#080c14; color:#ffffff; font-family: 'Playfair Display', Georgia, serif; padding: 40px 24px; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 12px;">
        <h2 style="color: #d4af37;">AuricVyom — Cancellation Receipt</h2>
        <p>Dear ${user.name || 'Traveler'},</p>
        <p>Your reservation <strong>${booking.voucherCode}</strong> has been cancelled as requested.</p>
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Total Paid:</strong> ₹${(booking.totalAmount || 0).toLocaleString('en-IN')}</p>
          <p><strong>Eligible Refund:</strong> ₹${(cancellation.refundAmount || 0).toLocaleString('en-IN')} (${cancellation.refundPercentage || 100}%)</p>
          <p><strong>Reason / Terms:</strong> ${cancellation.reason || 'Requested by guest'}</p>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Refunds are processed back to original payment method within 3-5 business days.</p>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Your AuricVyom reservation ${booking.voucherCode} has been cancelled. Refund amount: ₹${(cancellation.refundAmount || 0).toLocaleString('en-IN')}.`,
    });
  }

  async sendPasswordReset(email: string, token: string) {
    const subject = `🔒 AuricVyom Password Recovery Token`;
    const resetUrl = `http://localhost:3000/#reset-password`;
    const html = `
      <div style="background:#080c14; color:#ffffff; font-family: sans-serif; padding: 40px 24px; max-width: 600px; margin: 0 auto; border: 1px solid #d4af37; border-radius: 12px;">
        <h2 style="color: #d4af37;">Password Reset Request</h2>
        <p>We received a request to reset your AuricVyom account credentials.</p>
        <div style="background: rgba(212,175,55,0.1); border: 1px solid #d4af37; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; color: #cbd5e1; text-transform: uppercase;">Your Security Reset Token:</span>
          <div style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 4px; margin-top: 6px;">${token}</div>
        </div>
        <p style="font-size: 13px; color: #cbd5e1;">Enter this token on the reset page or click below:</p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #d4af37, #aa851d); color: #07090e; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text: `Your AuricVyom password reset token is: ${token}`,
    });
  }

  async sendDailyInspirationEmail(user: any, stay: any, slot: 'morning' | 'afternoon' | 'evening') {
    const firstName = user?.name ? user.name.split(' ')[0] : 'Noble Traveler';
    const propertyName = stay?.name || 'Rambagh Palace Jaipur';
    const location = stay?.location || stay?.destinationName || 'Jaipur, Rajasthan';
    const price = stay?.pricePerNight ? `₹${stay.pricePerNight.toLocaleString('en-IN')}` : '₹28,500';
    const imageUrl = stay?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

    let subject = '';
    let subtitle = '';

    if (slot === 'morning') {
      subject = `🌅 Morning Vistas & Royal Sanctuaries for ${firstName}`;
      subtitle = `Begin your day with visions of Rajput majesty and mountain mist.`;
    } else if (slot === 'afternoon') {
      subject = `☀️ Midday Escape: Private Villas & Coastal Sanctuaries`;
      subtitle = `Discover tranquil pools, organic tea estates, and wellness retreats.`;
    } else {
      subject = `🌙 Evening Inspiration: Stargazing in the Himalayas with AuricVyom`;
      subtitle = `Reserve this weekend's royal passage with instant room locking.`;
    }

    const html = `
      <div style="background:#080c14; color:#ffffff; font-family: 'Playfair Display', Georgia, serif; padding: 40px 24px; max-width: 600px; margin: 0 auto; border: 1.5px solid #d4af37; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #d4af37; font-size: 28px; margin: 0; letter-spacing: 2px;">AuricVyom</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase;">Bespoke Luxury India Collection</p>
        </div>

        <div style="margin-bottom: 24px; text-align: center;">
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 6px;">${subject}</h2>
          <p style="font-size: 14px; color: #cbd5e1; font-family: sans-serif; margin: 0;">${subtitle}</p>
        </div>

        <div style="border-radius: 8px; overflow: hidden; margin-bottom: 20px; border: 1px solid rgba(212,175,55,0.3);">
          <img src="${imageUrl}" alt="${propertyName}" style="width: 100%; height: 260px; object-fit: cover; display: block;" />
        </div>

        <div style="background: rgba(212,175,55,0.06); border: 1px solid #d4af37; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #ffffff; font-size: 18px;">${propertyName}</h3>
            <span style="color: #d4af37; font-weight: bold; font-size: 16px;">${price}<span style="font-size: 12px; color: #94a3b8;">/night</span></span>
          </div>
          <p style="color: #d4af37; font-size: 13px; margin: 0 0 10px 0; font-family: sans-serif;">📍 ${location}</p>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; font-family: sans-serif;">
            ${stay?.description || 'Curated royal heritage estate featuring palatial dining, personal butler service, and sprawling gardens.'}
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="http://localhost:3000/#stays" style="background: linear-gradient(135deg, #d4af37, #aa851d); color: #07090e; padding: 14px 32px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 30px; display: inline-block; font-family: sans-serif; box-shadow: 0 4px 15px rgba(212,175,55,0.3);">
            Reserve on AuricVyom ›
          </a>
        </div>

        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: center; font-size: 12px; color: #64748b; font-family: sans-serif; line-height: 1.5;">
          <p>You are receiving this daily luxury digest because your AuricVyom membership is active.<br/>To adjust your 3x daily notification preferences, visit your account dashboard.</p>
          <p>© 2026 AuricVyom Technologies. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `${subject}: ${propertyName} in ${location}. Member rate ${price}/night. Reserve at http://localhost:3000/#stays`,
    });
  }
}

export const emailService = new EmailService();

