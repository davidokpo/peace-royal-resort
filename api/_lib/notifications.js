import nodemailer from 'nodemailer';

const formatNaira = (amount) => {
  const num = Number(amount || 0);
  if (Number.isNaN(num) || num <= 0) return '0.00';
  return num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const toListString = (items) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items
    .map((item) => {
      if (typeof item === 'string') return item;
      if (!item || typeof item !== 'object') return '';
      const parts = [item.name || item.id || 'Item'];
      if (item.quantity) parts.push(`x${item.quantity}`);
      if (item.price) parts.push(`(₦${Number(item.price).toLocaleString('en-NG')})`);
      return parts.join(' ');
    })
    .filter(Boolean)
    .join('; ');
};

export const extractBookingSummary = (booking = {}, type = 'general') => {
  const name =
    booking.guest_name ||
    booking.customer_name ||
    booking.participant_name ||
    booking.name ||
    'Guest';

  const phone = booking.phone || 'Not provided';
  const email = booking.email || 'Not provided';
  const bookingId = booking.id || booking.clientBookingRef || 'N/A';
  const paymentMethod =
    booking.payment_method === 'pay_online' ? 'Pay Online (Paystack)' : 'Pay on Ground';
  const totalNaira = formatNaira(booking.total_price || booking.subtotal_price);

  let categoryLabel = 'Booking';
  let schedule = 'N/A';
  let details = '';

  switch (type) {
    case 'room':
      categoryLabel = `Room: ${booking.room_type || 'Standard Suite'}`;
      schedule = `${booking.check_in_date || 'N/A'} to ${booking.check_out_date || 'N/A'}`;
      details = `Breakfast: ${booking.complimentary_breakfast ? 'Included' : 'No'}`;
      break;

    case 'wellness':
      categoryLabel = `Wellness: ${booking.package_name || 'Spa Package'}`;
      schedule = `${booking.booking_date || 'N/A'} at ${booking.booking_time || 'N/A'}`;
      details = `Participants: ${booking.participants_count || 1}`;
      break;

    case 'garden':
      categoryLabel = `Garden: ${booking.event_type || 'Outdoor Event'}`;
      schedule = `${booking.preferred_date || 'N/A'} at ${booking.preferred_time || 'N/A'}`;
      details = `Guest count: ${booking.guest_count || 1}`;
      break;

    case 'balcony':
      categoryLabel = `Balcony: ${booking.breakfast_package || 'Private Balcony'}`;
      schedule = `${booking.booking_date || 'N/A'} at ${booking.booking_time || 'N/A'}`;
      details = `Guests: ${booking.guest_count || 1}`;
      break;

    case 'restaurant':
      categoryLabel = `Restaurant: ${booking.delivery_type || 'Dine-in'}`;
      schedule = new Date().toLocaleDateString('en-GB');
      details = `Items: ${toListString(booking.menu_items || booking.items || [])}`;
      break;

    case 'cafe':
      categoryLabel = `Cafe: ${booking.delivery_type || 'Dine-in'}`;
      schedule = new Date().toLocaleDateString('en-GB');
      details = `Items: ${toListString(booking.beverage_items || booking.items || [])}`;
      break;

    default:
      categoryLabel = 'General Reservation';
      schedule = booking.date || 'N/A';
  }

  const requests =
    booking.special_requests ||
    booking.dietary_requirements ||
    booking.allergies ||
    '';

  return {
    bookingId,
    name,
    phone,
    email,
    categoryLabel,
    schedule,
    details,
    requests,
    paymentMethod,
    totalNaira,
    type,
    createdAt: booking.createdAt || new Date().toISOString(),
  };
};

/**
 * 1. TELEGRAM INSTANT NOTIFICATION
 * Completely free forever via Telegram Bot API.
 */
export const sendTelegramAlert = async (summary) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { skipped: true, reason: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set' };
  }

  const text = [
    `🛎️ <b>NEW BOOKING — PEACE ROYAL RESORT</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🏷️ <b>Service:</b> ${summary.categoryLabel}`,
    `👤 <b>Guest:</b> ${summary.name}`,
    `📞 <b>Phone:</b> <a href="tel:${summary.phone}">${summary.phone}</a>`,
    `✉️ <b>Email:</b> ${summary.email}`,
    `📅 <b>Schedule:</b> ${summary.schedule}`,
    summary.details ? `📋 <b>Details:</b> ${summary.details}` : null,
    summary.requests ? `📝 <b>Requests:</b> ${summary.requests}` : null,
    `💰 <b>Total:</b> ₦${summary.totalNaira}`,
    `💳 <b>Payment:</b> ${summary.paymentMethod}`,
    `🔖 <b>Ref:</b> <code>${summary.bookingId}</code>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Tap the phone number above to call the guest right away.</i>`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    return { success: data.ok, data };
  } catch (err) {
    console.error('Telegram notification error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 2. EMAIL NOTIFICATION (Resend API or SMTP)
 * Free tier via Resend (3,000/mo) or Gmail App Password SMTP (500/day).
 */
export const sendEmailAlert = async (summary) => {
  const toEmail = process.env.NOTIFICATION_EMAIL_TO;
  const fromEmail =
    process.env.NOTIFICATION_EMAIL_FROM || 'Peace Royal Resort <onboarding@resend.dev>';
  const resendApiKey = process.env.RESEND_API_KEY;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f0; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e0d8; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { background: #4a154b; color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.85; text-transform: uppercase; letter-spacing: 1.5px; }
    .badge { display: inline-block; background: #c5a059; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-top: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 28px 24px; color: #222222; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0ede8; font-size: 14px; }
    .label { color: #777777; font-weight: 500; }
    .value { font-weight: 600; text-align: right; color: #111111; }
    .total-row { display: flex; justify-content: space-between; padding: 16px 0; margin-top: 12px; font-size: 18px; font-weight: 700; color: #4a154b; border-top: 2px solid #4a154b; }
    .btn-wrap { text-align: center; margin: 24px 0 8px; }
    .btn { display: inline-block; background: #4a154b; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { background: #faf8f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeebe5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">New Reservation</div>
      <h1>Peace Royal Resort</h1>
      <p>Booking ID: ${summary.bookingId}</p>
    </div>
    <div class="content">
      <div class="row"><span class="label">Service</span><span class="value">${summary.categoryLabel}</span></div>
      <div class="row"><span class="label">Guest Name</span><span class="value">${summary.name}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value"><a href="tel:${summary.phone}" style="color: #4a154b; text-decoration: none;">${summary.phone}</a></span></div>
      <div class="row"><span class="label">Email</span><span class="value">${summary.email}</span></div>
      <div class="row"><span class="label">Schedule</span><span class="value">${summary.schedule}</span></div>
      ${summary.details ? `<div class="row"><span class="label">Details</span><span class="value">${summary.details}</span></div>` : ''}
      ${summary.requests ? `<div class="row"><span class="label">Requests</span><span class="value">${summary.requests}</span></div>` : ''}
      <div class="row"><span class="label">Payment Status</span><span class="value">${summary.paymentMethod}</span></div>
      <div class="total-row"><span>Total Amount</span><span>₦${summary.totalNaira}</span></div>

      <div class="btn-wrap">
        <a href="tel:${summary.phone}" class="btn">📞 Call Guest Immediately</a>
      </div>
    </div>
    <div class="footer">
      Peace Royal Resort • +234 906 196 7954 • All rights reserved
    </div>
  </div>
</body>
</html>
`;

  // Path A: Resend API (Recommended on Vercel)
  if (resendApiKey && toEmail) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [toEmail],
          subject: `🛎️ New Booking: ${summary.categoryLabel} - ${summary.name}`,
          html,
        }),
      });

      const data = await res.json();
      return { success: res.ok, data };
    } catch (err) {
      console.error('Resend email error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Path B: Standard SMTP (Gmail App Password, etc.)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass && toEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `🛎️ New Booking: ${summary.categoryLabel} - ${summary.name}`,
        html,
      });

      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('SMTP email error:', err.message);
      return { success: false, error: err.message };
    }
  }

  return { skipped: true, reason: 'No email service configured (set RESEND_API_KEY or SMTP credentials)' };
};

/**
 * Dispatches all notification channels in parallel without blocking client response.
 */
export const notifyBookingChannels = async (booking, type) => {
  const summary = extractBookingSummary(booking, type);

  const [telegramResult, emailResult] = await Promise.allSettled([
    sendTelegramAlert(summary),
    sendEmailAlert(summary),
  ]);

  if (telegramResult.status === 'fulfilled' && telegramResult.value?.error) {
    console.warn('Telegram alert skipped or failed:', telegramResult.value);
  }
  if (emailResult.status === 'fulfilled' && emailResult.value?.error) {
    console.warn('Email alert skipped or failed:', emailResult.value);
  }

  return { summary, telegramResult, emailResult };
};
