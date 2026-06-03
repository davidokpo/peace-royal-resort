import { google } from 'googleapis';

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

const bookingConfigs = {
  room: {
    type: 'room',
    label: 'Room booking',
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
  },
  garden: {
    type: 'garden',
    label: 'Garden booking',
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
  },
  wellness: {
    type: 'wellness',
    label: 'Wellness booking',
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
  },
  balcony: {
    type: 'balcony',
    label: 'Balcony booking',
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
  },
  restaurant: {
    type: 'restaurant',
    label: 'Restaurant order',
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
  },
  cafe: {
    type: 'cafe',
    label: 'Cafe order',
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
  },
  general: {
    type: 'general',
    label: 'Booking',
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
  },
};

const normalizeBookingType = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase();
  return typeAliases[normalized] || 'general';
};

const getPrivateKey = () =>
  (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();

const getSpreadsheetIdForType = (type) => {
  const normalizedType = normalizeBookingType(type);

  if (normalizedType === 'cafe') {
    return process.env.GOOGLE_SHEETS_CAFE_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  if (normalizedType === 'restaurant') {
    return process.env.GOOGLE_SHEETS_RESTAURANT_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  return process.env.GOOGLE_SHEETS_FRONTDESK_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
};

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

const parseNumber = (value) => {
  const numeric = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const mapRowToRecord = (headers, row, config, spreadsheetId, rowNumber) => {
  const record = {};

  headers.forEach((header, index) => {
    record[header] = row[index] ?? '';
  });

  return {
    config,
    spreadsheetId,
    rowNumber,
    record: {
      ...record,
      id: record.booking_id || '',
      type: config.type,
      email: record.email || '',
      total_price: parseNumber(record.total_price),
      payment_status: record.payment_status || 'pending',
      payment_method: record.payment_method || 'pay_on_ground',
      status: record[config.statusKey] || 'pending',
    },
  };
};

export const findBookingById = async (bookingId) => {
  if (!bookingId) {
    return null;
  }

  const sheets = await getSheetsClient();

  if (!sheets) {
    return null;
  }

  const seenSpreadsheets = new Set();

  for (const config of Object.values(bookingConfigs)) {
    const spreadsheetId = getSpreadsheetIdForType(config.type);

    if (!spreadsheetId || seenSpreadsheets.has(`${spreadsheetId}:${config.sheetName}`)) {
      continue;
    }

    seenSpreadsheets.add(`${spreadsheetId}:${config.sheetName}`);

    const titles = await getSheetTitles(sheets, spreadsheetId);
    if (!titles.has(config.sheetName)) {
      continue;
    }

    const columnResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${config.sheetName}!B:B`,
    });

    const rows = columnResponse.data.values || [];
    const rowIndex = rows.findIndex(([value]) => value === bookingId);

    if (rowIndex === -1) {
      continue;
    }

    const rowNumber = rowIndex + 1;
    const lastColumn = toColumnLetter(config.headers.length);
    const [headerResponse, rowResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${config.sheetName}!A1:${lastColumn}1`,
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${config.sheetName}!A${rowNumber}:${lastColumn}${rowNumber}`,
      }),
    ]);

    const headers = headerResponse.data.values?.[0] || config.headers;
    const row = rowResponse.data.values?.[0] || [];

    return mapRowToRecord(headers, row, config, spreadsheetId, rowNumber);
  }

  return null;
};

export const updateBookingPaymentState = async ({
  bookingId,
  paymentReference,
  paymentStatus = 'paid',
}) => {
  const sheets = await getSheetsClient();

  if (!sheets) {
    return null;
  }

  const found = await findBookingById(bookingId);

  if (!found) {
    return null;
  }

  const { config, spreadsheetId, rowNumber, record } = found;
  const nextStatus = paymentStatus === 'paid' ? 'confirmed' : 'pending';
  const updates = {
    payment_method: 'pay_online',
    paid: paymentStatus === 'paid' ? 'Paid online (Paystack)' : 'Awaiting online payment',
    payment_status: paymentStatus,
    payment_reference: paymentReference || '',
    [config.statusKey]: nextStatus,
  };

  const data = Object.entries(updates).map(([header, value]) => ({
    range: `${config.sheetName}!${toColumnLetter(config.headers.indexOf(header) + 1)}${rowNumber}`,
    values: [[value]],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });

  return {
    ...record,
    ...updates,
    status: nextStatus,
  };
};

export const getBookingLabel = (type) => bookingConfigs[normalizeBookingType(type)]?.label || bookingConfigs.general.label;
