import { findBookingById, updateBookingPaymentState } from '../_lib/bookingSheets.js';
import { applySecurityHeaders, enforceRateLimit } from '../_lib/security.js';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const getPaystackSecretKey = () => process.env.PAYSTACK_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
  applySecurityHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!enforceRateLimit({ req, res, key: 'paystack-verify', limit: 60, windowMs: 15 * 60 * 1000 })) {
    return;
  }

  try {
    const reference = req.query?.reference || req.query?.trxref;
    const paystackSecretKey = getPaystackSecretKey();

    if (!reference) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Paystack secret key is not configured on the server' });
    }

    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.status || !payload?.data) {
      console.error('Paystack verification failed:', payload);
      return res.status(400).json({
        error: payload?.message || 'Failed to verify Paystack transaction',
        detail: payload,
      });
    }

    const transaction = payload.data;
    const bookingId = transaction?.metadata?.bookingId;
    const storedBooking = bookingId ? await findBookingById(bookingId) : null;
    const transactionAmount = Number(transaction.amount || 0) / 100;
    const amountMatches =
      storedBooking?.record?.total_price
        ? Number(storedBooking.record.total_price) === transactionAmount
        : false;

    if (bookingId && (!storedBooking || !amountMatches)) {
      return res.status(409).json({
        error: 'Payment could not be matched to a stored booking amount',
      });
    }

    const verified = transaction.status === 'success' && amountMatches;
    const updatedBooking = verified && bookingId
      ? await updateBookingPaymentState({
          bookingId,
          paymentReference: transaction.reference,
          paymentStatus: 'paid',
        })
      : null;

    return res.status(200).json({
      verified,
      status: transaction.status,
      reference: transaction.reference,
      bookingId,
      booking: updatedBooking,
      gatewayResponse: transaction.gateway_response,
    });
  } catch (error) {
    console.error('Paystack verification request crashed:', error.message, error.stack);
    return res.status(500).json({
      error: 'Unable to verify Paystack transaction',
      detail: error.message,
    });
  }
}
