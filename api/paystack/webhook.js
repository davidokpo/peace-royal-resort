import crypto from 'node:crypto';
import { findBookingById, updateBookingPaymentState } from '../_lib/bookingSheets.js';
import { applySecurityHeaders } from '../_lib/security.js';

const getPaystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

const readRawBody = async (req) => {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      return req.body.toString('utf8');
    }

    if (typeof req.body === 'string') {
      return req.body;
    }

    return JSON.stringify(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
};

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = getPaystackSecretKey();
  const signature = req.headers['x-paystack-signature'];

  if (!secretKey || !signature) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  try {
    const rawBody = await readRawBody(req);
    const expectedSignature = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(401).json({ error: 'Webhook signature mismatch' });
    }

    const event = rawBody ? JSON.parse(rawBody) : {};

    if (event?.event !== 'charge.success') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const transaction = event.data || {};
    const bookingId = transaction?.metadata?.bookingId;
    const amount = Number(transaction.amount || 0) / 100;

    if (!bookingId) {
      return res.status(200).json({ received: true, ignored: true });
    }

    const bookingMatch = await findBookingById(bookingId);

    if (!bookingMatch || Number(bookingMatch.record.total_price) !== amount) {
      return res.status(409).json({ error: 'Webhook amount does not match stored booking' });
    }

    await updateBookingPaymentState({
      bookingId,
      paymentReference: transaction.reference,
      paymentStatus: 'paid',
    });

    return res.status(200).json({ received: true, bookingId });
  } catch (error) {
    console.error('Paystack webhook failed:', error.message, error.stack);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
