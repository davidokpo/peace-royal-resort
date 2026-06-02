import { SKIP_ONLINE_PAYMENT } from './paymentCheckout.js';

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const normalizeApiBaseUrl = (value = '/api') => {
  const trimmed = trimTrailingSlash(value || '/api');

  if (!trimmed) {
    return '/api';
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\.?\/+/, '')}`;
};

const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

const apiBaseUrl = normalizeApiBaseUrl(rawApiBase);
const hasReachableApiBase =
  apiBaseUrl &&
  !/localhost|127\.0\.0\.1/i.test(apiBaseUrl);

export const submitBookingRequest = async ({
  endpoint,
  payload,
}) => {
  if (!hasReachableApiBase) {
    throw new Error('Booking API is not configured');
  }

  // While online payment is disabled, force every booking to "pay on ground"
  // so the Google Sheet and confirmation page reflect the actual flow.
  if (SKIP_ONLINE_PAYMENT) {
    if (payload.data && typeof payload.data === 'object') {
      payload = { ...payload, data: { ...payload.data, payment_method: 'pay_on_ground' } };
    } else {
      payload = { ...payload, payment_method: 'pay_on_ground' };
    }
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  const record = result?.booking || result?.order;

  if (!response.ok || !record?.id) {
    throw new Error(result?.error || result?.message || 'Unable to save request');
  }

  return {
    mode: 'api',
    record,
  };
};
