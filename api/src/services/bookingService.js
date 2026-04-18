import { google } from 'googleapis';
import logger from '../utils/logger.js';
import { createStoredRecord, updateStoredRecord } from './localBookingStore.js';

const DEFAULT_SHEET_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Bookings_Raw';

const getPrivateKey = () =>
  (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
    .trim();

const getSheetsClient = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
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

const buildStoredBooking = (payload = {}) => {
  const bookingId = payload.clientBookingRef || payload.id || `PR-${Date.now()}`;
  const now = new Date().toISOString();

  return {
    id: bookingId,
    createdAt: payload.createdAt || now,
    updatedAt: now,
    type: payload.type || 'Room',
    payment_status: payload.payment_status || 'pending',
    booking_status: payload.booking_status || 'pending',
    payment_reference: payload.payment_reference || '',
    ...payload,
    clientBookingRef: payload.clientBookingRef || bookingId,
  };
};

const buildSheetRow = (booking) => [
  new Date(booking.createdAt || Date.now()).toLocaleString(),
  booking.clientBookingRef || booking.id,
  booking.type || 'Room',
  booking.room_type || booking.package || 'Standard',
  booking.guest_name || booking.customerName || booking.customer_name || booking.name || 'Unknown',
  booking.email || booking.customerEmail || booking.customer_email || 'N/A',
  booking.phone || booking.customerPhone || booking.customer_phone || '',
  booking.check_in_date || booking.checkIn || booking.booking_date || '',
  booking.check_out_date || booking.checkOut || '',
  booking.preferredDate || booking.preferred_date || '',
  booking.preferredTime || booking.preferred_time || booking.booking_time || '',
  booking.guestCount || booking.guest_count || booking.participants_count || '',
  '',
  '',
  '',
  '',
  '',
  booking.total_price || booking.amount || booking.totalPrice || 0,
  booking.payment_status || 'pending',
  booking.booking_status || 'pending',
  booking.payment_reference || '',
  'Website',
];

const appendBookingToSheet = async (booking) => {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!sheets || !spreadsheetId) {
    logger.info('Google Sheets is not configured. Skipping sync.');
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${DEFAULT_SHEET_NAME}!A:V`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [buildSheetRow(booking)] },
  });
};

const updateSheetPaymentState = async (bookingId, paymentReference, paymentStatus, bookingStatus) => {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!sheets || !spreadsheetId) {
    return;
  }

  const lookupRange = `${DEFAULT_SHEET_NAME}!B:B`;
  const lookupResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: lookupRange,
  });

  const rows = lookupResponse.data.values || [];
  const rowIndex = rows.findIndex(([value]) => value === bookingId);

  if (rowIndex === -1) {
    logger.warn(`Google Sheets row not found for booking ${bookingId}`);
    return;
  }

  const sheetRowNumber = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${DEFAULT_SHEET_NAME}!S${sheetRowNumber}:U${sheetRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[paymentStatus, bookingStatus, paymentReference || '']],
    },
  });
};

const syncLocalBooking = async (booking) => {
  try {
    await createStoredRecord(booking);
    return true;
  } catch (error) {
    logger.warn('Local booking store unavailable:', error.message);
    return false;
  }
};

export const createBooking = async (payload) => {
  logger.info('Incoming booking data received.');

  const booking = buildStoredBooking(payload);
  const localBackupSaved = await syncLocalBooking(booking);
  let googleSheetsSaved = false;

  try {
    await appendBookingToSheet(booking);
    googleSheetsSaved = true;
  } catch (error) {
    logger.error('Google Sheets sync failed:', error.message);
  }

  if (!googleSheetsSaved && !localBackupSaved) {
    throw new Error('Booking could not be stored in Google Sheets or the local backup.');
  }

  return {
    success: true,
    message: googleSheetsSaved ? 'Booking confirmed' : 'Booking saved with local backup',
    booking: {
      ...booking,
      status: booking.booking_status,
      sync: {
        googleSheets: googleSheetsSaved,
        localBackup: localBackupSaved,
      },
    },
  };
};

export const markBookingPaid = async (bookingId, paymentReference) => {
  const paymentUpdate = {
    payment_status: 'paid',
    booking_status: 'confirmed',
    payment_reference: paymentReference || '',
    updatedAt: new Date().toISOString(),
  };

  let updatedBooking = null;

  try {
    updatedBooking = await updateStoredRecord(bookingId, paymentUpdate);
    if (!updatedBooking) {
      logger.warn(`Local booking ${bookingId} not found during payment confirmation.`);
    }
  } catch (error) {
    logger.warn(`Local booking store update failed for ${bookingId}:`, error.message);
  }

  const bookingSnapshot = updatedBooking || {
    id: bookingId,
    ...paymentUpdate,
  };

  try {
    await updateSheetPaymentState(
      bookingId,
      paymentReference,
      bookingSnapshot.payment_status,
      bookingSnapshot.booking_status,
    );
  } catch (error) {
    logger.error(`Failed to sync payment update for ${bookingId}:`, error.message);
  }

  return bookingSnapshot;
};

