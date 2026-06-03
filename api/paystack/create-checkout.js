import { findBookingById, getBookingLabel } from '../_lib/bookingSheets.js';
import { applySecurityHeaders, enforceRateLimit } from '../_lib/security.js';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const getPaystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const getPublicSiteUrl = (req) => {
  const configured =
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configured) {
    const normalized = configured.startsWith('http') ? configured : `https://${configured}`;
    return normalized.replace(/\/+$/, '');
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';

  return host ? `${proto}://${host}` : '';
};

const readJsonBody = async (req) => {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      return JSON.parse(req.body.toString('utf8'));
    }

    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }

    if (typeof req.body === 'object') {
      return req.body;
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!enforceRateLimit({ req, res, key: 'paystack-create-checkout', limit: 20, windowMs: 15 * 60 * 1000 })) {
    return;
  }

  try {
    const { bookingId } = await readJsonBody(req);

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const paystackSecretKey = getPaystackSecretKey();

    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
    }

    const bookingMatch = await findBookingById(bookingId);

    if (!bookingMatch) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { config, record } = bookingMatch;

    if (!record.total_price || record.total_price <= 0) {
      return res.status(400).json({ error: 'Stored booking amount is invalid' });
    }

    if (!record.email) {
      return res.status(400).json({ error: 'Stored booking email is missing' });
    }

    if (record.payment_status === 'paid') {
      return res.status(409).json({ error: 'This booking has already been paid for' });
    }

    const siteUrl = getPublicSiteUrl(req);
    const callbackUrl = siteUrl ? `${siteUrl}/payment-success` : '/payment-success';
    const amount = record.total_price;
    const productName = getBookingLabel(config.type);

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        email: record.email,
        currency: 'NGN',
        callback_url: callbackUrl,
        metadata: {
          bookingId,
          productName,
        },
      }),
    });

    const responseText = await response.text();
    let payload = null;

    try {
      payload = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('Paystack initialization returned non-JSON:', responseText);
      return res.status(502).json({
        error: 'Invalid response from Paystack',
        detail: responseText?.slice(0, 300) || parseError.message,
      });
    }

    if (!response.ok || !payload?.status || !payload?.data?.authorization_url) {
      console.error('Paystack initialization failed:', payload);
      return res.status(400).json({
        error: payload?.message || 'Failed to initialize Paystack checkout',
        detail: payload,
      });
    }

    return res.status(200).json({
      url: payload.data.authorization_url,
      reference: payload.data.reference,
    });
  } catch (error) {
    console.error('Paystack checkout request crashed:', error.message, error.stack);
    return res.status(500).json({
      error: 'Unable to reach Paystack checkout service',
      detail: error.message,
    });
  }
}
