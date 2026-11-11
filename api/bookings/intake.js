import { google } from 'googleapis';
import { applySecurityHeaders, enforceRateLimit } from '../_lib/security.js';
import { verifyTurnstileToken } from '../_lib/turnstile.js';
import { validateBookingPayload } from '../_lib/validation.js';
import { notifyBookingChannels } from '../_lib/notifications.js';

const ORDER_TYPES = new Set(['restaurant', 'cafe']);

const typeAliases = {
  room: 'room',
  rooms: 'room',
  garden: 'garden',
  wellness: 'wellness',
  balcony: 'balcony',
  restaurant: 'restaurant',
  cafe: 'cafe',
  general: 'general',
};

const normalizeBookingType = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return typeAliases[normalized] || 'general';
};

const getPaymentMethod = (booking = {}) => booking.payment_method || 'pay_on_ground';

const getPaidDisplay = (booking = {}) => {
  const paymentMethod = getPaymentMethod(booking);

  if (booking.payment_status === 'paid' && paymentMethod === 'pay_online') {
    return 'Paid online (Paystack)';
  }

  if (paymentMethod === 'pay_on_ground') {
    return 'Pay on ground';
  }

  if (paymentMethod === 'pay_online') {
    return 'Awaiting online payment';
  }

  return 'Pending';
};

const toListString = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return items
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      if (!item || typeof item !== 'object') {
        return '';
      }

      const parts = [item.name || item.id || 'Item'];

      if (item.quantity) {
        parts.push(`x${item.quantity}`);
      }

      if (item.price) {
        parts.push(`N${Number(item.price).toLocaleString('en-NG')}`);
      }

      if (item.options && typeof item.options === 'object') {
        const optionsText = Object.entries(item.options)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
          .join(', ');

        if (optionsText) {
          parts.push(`(${optionsText})`);
        }
      }

      return parts.join(' ');
    })
    .filter(Boolean)
    .join('; ');
};

const toCateringString = (catering = {}) => {
  const selected = Object.entries(catering)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([name]) => name.replace(/([A-Z])/g, ' $1').trim());

  return selected.length > 0 ? selected.join(', ') : 'None';
};

const getNightCount = (booking = {}) => {
  if (!booking.check_in_date || !booking.check_out_date) {
    return '';
  }

  const checkIn = new Date(booking.check_in_date);
  const checkOut = new Date(booking.check_out_date);
  const diff = checkOut - checkIn;

  if (Number.isNaN(diff) || diff <= 0) {
    return '';
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const bookingConfigs = {
  room: {
    type: 'room',
    label: 'Room Booking',
    sheetName: 'Room Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'guest_name',
      'email',
      'phone',
      'room_type',
      'check_in_date',
      'check_out_date',
      'nights',
      'subtotal_price',
      'tax_rate',
      'tax_amount',
      'total_price',
      'complimentary_breakfast',
      'identity_document_name',
      'special_requests',
      'payment_method',
      'paid',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.guest_name || '',
      booking.email || '',
      booking.phone || '',
      booking.room_type || '',
      booking.check_in_date || '',
      booking.check_out_date || '',
      getNightCount(booking),
      booking.subtotal_price || '',
      booking.tax_rate || '',
      booking.tax_amount || '',
      booking.total_price || '',
      booking.complimentary_breakfast ? 'Yes' : 'No',
      booking.identity_document_name || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  garden: {
    type: 'garden',
    label: 'Garden Booking',
    sheetName: 'Garden Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'event_type',
      'guest_count',
      'preferred_date',
      'preferred_time',
      'catering',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customerName || booking.customer_name || '',
      booking.customerEmail || booking.customer_email || '',
      booking.customerPhone || booking.customer_phone || '',
      booking.eventType || booking.event_type || '',
      booking.guestCount || booking.guest_count || '',
      booking.preferredDate || booking.preferred_date || '',
      booking.preferredTime || booking.preferred_time || '',
      toCateringString(booking.catering),
      booking.specialRequests || booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.totalPrice || booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  wellness: {
    type: 'wellness',
    label: 'Wellness Booking',
    sheetName: 'Wellness Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'participant_name',
      'email',
      'phone',
      'package_name',
      'booking_date',
      'booking_time',
      'participants_count',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.participant_name || '',
      booking.email || '',
      booking.phone || '',
      booking.class_type || '',
      booking.booking_date || '',
      booking.booking_time || '',
      booking.participants_count || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  balcony: {
    type: 'balcony',
    label: 'Balcony Booking',
    sheetName: 'Balcony Bookings',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'guest_name',
      'email',
      'phone',
      'booking_date',
      'booking_time',
      'breakfast_package',
      'guest_count',
      'special_requests',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.guest_name || '',
      booking.email || '',
      booking.phone || '',
      booking.booking_date || '',
      booking.booking_time || '',
      booking.breakfast_package || '',
      booking.guest_count || '',
      booking.special_requests || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.booking_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  restaurant: {
    type: 'restaurant',
    label: 'Restaurant Order',
    sheetName: 'Restaurant Orders',
    statusKey: 'order_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'delivery_type',
      'delivery_address',
      'menu_items',
      'allergies',
      'dietary_requirements',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'order_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customer_name || '',
      booking.email || '',
      booking.phone || '',
      booking.delivery_type || '',
      booking.delivery_address || '',
      toListString(booking.menu_items),
      booking.allergies || '',
      booking.dietary_requirements || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.order_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  cafe: {
    type: 'cafe',
    label: 'Cafe Order',
    sheetName: 'Cafe Orders',
    statusKey: 'order_status',
    headers: [
      'created_at',
      'booking_id',
      'customer_name',
      'email',
      'phone',
      'delivery_type',
      'beverage_items',
      'allergies',
      'special_requests',
      'friday_game_night',
      'board_game_selection',
      'player_count',
      'game_time_slot',
      'reserved_table_number',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'order_status',
      'payment_reference',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.customer_name || '',
      booking.email || '',
      booking.phone || '',
      booking.delivery_type || '',
      toListString(booking.beverage_items),
      booking.allergies || '',
      booking.special_requests || '',
      booking.friday_game_night ? 'Yes' : 'No',
      booking.board_game_selection || '',
      booking.player_count || '',
      booking.game_time_slot || '',
      booking.reserved_table_number || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || '',
      booking.payment_status || 'pending',
      booking.order_status || 'pending',
      booking.payment_reference || '',
    ],
  },
  general: {
    type: 'general',
    label: 'General Booking',
    sheetName: process.env.GOOGLE_SHEETS_TAB_NAME || 'Bookings_Raw',
    statusKey: 'booking_status',
    headers: [
      'created_at',
      'booking_id',
      'booking_type',
      'name',
      'email',
      'phone',
      'preferred_date',
      'preferred_time',
      'payment_method',
      'paid',
      'total_price',
      'payment_status',
      'booking_status',
      'payment_reference',
      'raw_payload',
    ],
    rowBuilder: (booking) => [
      booking.createdAt || '',
      booking.clientBookingRef || booking.id || '',
      booking.type || '',
      booking.guest_name ||
        booking.customer_name ||
        booking.customerName ||
        booking.participant_name ||
        '',
      booking.email || booking.customer_email || booking.customerEmail || '',
      booking.phone || booking.customer_phone || booking.customerPhone || '',
      booking.preferredDate || booking.preferred_date || booking.booking_date || booking.check_in_date || '',
      booking.preferredTime || booking.preferred_time || booking.booking_time || '',
      getPaymentMethod(booking),
      getPaidDisplay(booking),
      booking.total_price || booking.totalPrice || '',
      booking.payment_status || 'pending',
      booking.booking_status || booking.order_status || 'pending',
      booking.payment_reference || '',
      JSON.stringify(booking),
    ],
  },
};

const getBookingTypeConfig = (bookingOrType) => {
  const type =
    typeof bookingOrType === 'string'
      ? normalizeBookingType(bookingOrType)
      : normalizeBookingType(bookingOrType?.type || bookingOrType?.booking_type);

  return bookingConfigs[type] || bookingConfigs.general;
};

const getBookingStatusKey = (bookingOrType) => getBookingTypeConfig(bookingOrType).statusKey;

const getPrivateKey = () =>
  (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();

const getSheetsClient = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

// Every booking type is recorded as its own tab inside the single main
// booking spreadsheet (the one with the Room/Garden/Cafe tabs). Restaurant,
// cafe, etc. all land here rather than in separate spreadsheet files, so the
// front desk has one place to look. The per-category *_SPREADSHEET_ID env
// vars are intentionally no longer used.
const getSpreadsheetIdForType = () => process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const toColumnLetter = (columnNumber) => {
  let value = columnNumber;
  let label = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
};

const sanitizeSpreadsheetCell = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  const stringValue = String(value);
  return /^[=+\-@]/.test(stringValue.trimStart()) ? `'${stringValue}` : stringValue;
};

const getSheetTitles = async (sheets, spreadsheetId) => {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  return new Set(
    (metadata.data.sheets || [])
      .map((sheet) => sheet.properties?.title)
      .filter(Boolean),
  );
};

const ensureSheetExists = async (sheets, spreadsheetId, sheetName) => {
  const titles = await getSheetTitles(sheets, spreadsheetId);

  if (titles.has(sheetName)) {
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  });
};

const ensureSheetHeader = async (sheets, spreadsheetId, config) => {
  await ensureSheetExists(sheets, spreadsheetId, config.sheetName);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${config.sheetName}!A1:${toColumnLetter(config.headers.length)}1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [config.headers],
    },
  });
};

const createId = (prefix = 'BK') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const createBookingId = (type) => {
  const prefixMap = {
    room: 'ROOM',
    wellness: 'WELL',
    cafe: 'CAFE',
    restaurant: 'FOOD',
    garden: 'GARDEN',
    balcony: 'BAL',
    general: 'BOOK',
  };

  return createId(prefixMap[type] || 'BOOK');
};

const buildStoredBooking = (payload = {}, explicitType) => {
  const normalizedType = normalizeBookingType(explicitType || payload.type || payload.booking_type);
  const bookingId = payload.clientBookingRef || payload.id || createBookingId(normalizedType);
  const now = new Date().toISOString();
  const statusKey = getBookingStatusKey(normalizedType);
  const paymentMethod = payload.payment_method || 'pay_on_ground';

  const booking = {
    ...payload,
    id: bookingId,
    createdAt: payload.createdAt || now,
    updatedAt: now,
    type: normalizedType,
    booking_type: normalizedType,
    payment_method: paymentMethod,
    payment_status: payload.payment_status || 'pending',
    payment_reference: payload.payment_reference || '',
    clientBookingRef: payload.clientBookingRef || bookingId,
  };

  booking.booking_status =
    payload.booking_status ||
    (statusKey === 'booking_status' ? booking.booking_status || 'pending' : booking.booking_status || '');

  booking.order_status =
    payload.order_status ||
    (statusKey === 'order_status' ? booking.order_status || 'pending' : booking.order_status || '');

  booking.paid = payload.paid || getPaidDisplay(booking);

  return booking;
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

  if (!enforceRateLimit({ req, res, key: 'booking-intake', limit: 20, windowMs: 15 * 60 * 1000 })) {
    return;
  }

  try {
    const body = await readJsonBody(req);
    const bookingData = body.data || body;
    const type = body.bookingType || bookingData.type || bookingData.booking_type || 'general';
    const captchaToken = body.captchaToken || bookingData.captchaToken || '';
    const captchaVerification = await verifyTurnstileToken({ token: captchaToken, req });

    if (!captchaVerification.success) {
      return res.status(400).json({
        success: false,
        error: captchaVerification.error,
        details: captchaVerification.details || [],
      });
    }

    const validationErrors = validateBookingPayload({ type, data: bookingData });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: validationErrors[0],
        details: validationErrors,
      });
    }

    const booking = buildStoredBooking(bookingData, type);
    const config = getBookingTypeConfig(booking);

    // 1. Record to Google Sheets (if configured)
    let sheetRecorded = false;
    try {
      const sheets = await getSheetsClient();
      const spreadsheetId = getSpreadsheetIdForType(booking);

      if (sheets && spreadsheetId) {
        await ensureSheetHeader(sheets, spreadsheetId, config);
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: `${config.sheetName}!A:${toColumnLetter(config.headers.length)}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [config.rowBuilder(booking).map(sanitizeSpreadsheetCell)],
          },
        });
        sheetRecorded = true;
      } else {
        console.warn('Google Sheets is not configured (missing credentials or spreadsheet ID)');
      }
    } catch (sheetErr) {
      console.error('Google Sheets append error:', sheetErr.message);
    }

    // 2. Dispatch instant notifications (Telegram & Email)
    await notifyBookingChannels(booking, type);

    return res.status(201).json({
      success: true,
      message: sheetRecorded ? 'Booking stored in Google Sheets and notifications sent' : 'Booking received and notifications sent',
      booking: {
        ...booking,
        status: booking[config.statusKey] || 'pending',
      },
    });
  } catch (error) {
    console.error('Booking intake failed:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to store booking in Google Sheets',
      error: error.message,
    });
  }
}
