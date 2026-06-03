const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trim = (value) => String(value || '').trim();
const toNumber = (value) => Number(value);

const requireString = (errors, label, value, { max = 250 } = {}) => {
  const normalized = trim(value);

  if (!normalized) {
    errors.push(`${label} is required`);
    return;
  }

  if (normalized.length > max) {
    errors.push(`${label} is too long`);
  }
};

const requireEmail = (errors, value) => {
  const normalized = trim(value);

  if (!normalized) {
    errors.push('Email is required');
    return;
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    errors.push('Email is invalid');
  }
};

const requirePositiveNumber = (errors, label, value, { integer = false, min = 1 } = {}) => {
  const numeric = toNumber(value);

  if (!Number.isFinite(numeric) || numeric < min) {
    errors.push(`${label} must be ${integer ? 'a valid whole number' : 'a valid number'}`);
    return;
  }

  if (integer && !Number.isInteger(numeric)) {
    errors.push(`${label} must be a valid whole number`);
  }
};

const requireDate = (errors, label, value) => {
  const normalized = trim(value);

  if (!normalized) {
    errors.push(`${label} is required`);
    return;
  }

  if (Number.isNaN(new Date(normalized).getTime())) {
    errors.push(`${label} is invalid`);
  }
};

const requireOneOf = (errors, label, value, allowedValues) => {
  const normalized = trim(value);

  if (!allowedValues.includes(normalized)) {
    errors.push(`${label} is invalid`);
  }
};

const validateRoom = (data, errors) => {
  requireString(errors, 'Guest name', data.guest_name);
  requireEmail(errors, data.email);
  requireString(errors, 'Phone', data.phone, { max: 40 });
  requireString(errors, 'Room type', data.room_type, { max: 80 });
  requireDate(errors, 'Check-in date', data.check_in_date);
  requireDate(errors, 'Check-out date', data.check_out_date);
  requirePositiveNumber(errors, 'Total price', data.total_price);

  if (data.check_in_date && data.check_out_date) {
    const checkIn = new Date(data.check_in_date);
    const checkOut = new Date(data.check_out_date);

    if (!Number.isNaN(checkIn.getTime()) && !Number.isNaN(checkOut.getTime()) && checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }
  }
};

const validateGarden = (data, errors) => {
  requireString(errors, 'Customer name', data.customerName || data.customer_name);
  requireEmail(errors, data.customerEmail || data.customer_email || data.email);
  requireString(errors, 'Phone', data.customerPhone || data.customer_phone || data.phone, { max: 40 });
  requireString(errors, 'Event type', data.eventType || data.event_type, { max: 80 });
  requireDate(errors, 'Preferred date', data.preferredDate || data.preferred_date);
  requireString(errors, 'Preferred time', data.preferredTime || data.preferred_time, { max: 40 });
  requirePositiveNumber(errors, 'Guest count', data.guestCount || data.guest_count, { integer: true });
  requirePositiveNumber(errors, 'Total price', data.totalPrice || data.total_price);
};

const validateWellness = (data, errors) => {
  requireString(errors, 'Participant name', data.participant_name);
  requireEmail(errors, data.email);
  requireString(errors, 'Phone', data.phone, { max: 40 });
  requireString(errors, 'Package', data.class_type, { max: 80 });
  requireDate(errors, 'Booking date', data.booking_date);
  requireString(errors, 'Booking time', data.booking_time, { max: 40 });
  requirePositiveNumber(errors, 'Participants count', data.participants_count, { integer: true });
  requirePositiveNumber(errors, 'Total price', data.total_price);
};

const validateBalcony = (data, errors) => {
  requireString(errors, 'Guest name', data.guest_name);
  requireEmail(errors, data.email);
  requireString(errors, 'Phone', data.phone, { max: 40 });
  requireDate(errors, 'Booking date', data.booking_date);
  requireString(errors, 'Booking time', data.booking_time, { max: 40 });
  requireString(errors, 'Breakfast package', data.breakfast_package, { max: 120 });
  requirePositiveNumber(errors, 'Guest count', data.guest_count, { integer: true });
  requirePositiveNumber(errors, 'Total price', data.total_price);
};

const validateRestaurant = (data, errors) => {
  requireString(errors, 'Customer name', data.customer_name);
  requireEmail(errors, data.email);
  requireString(errors, 'Phone', data.phone, { max: 40 });
  requireOneOf(errors, 'Delivery type', data.delivery_type, ['delivery', 'pickup']);

  if (!Array.isArray(data.menu_items) || data.menu_items.length === 0) {
    errors.push('At least one menu item is required');
  }

  if (trim(data.delivery_type) === 'delivery') {
    requireString(errors, 'Delivery address', data.delivery_address, { max: 120 });
  }

  requirePositiveNumber(errors, 'Total price', data.total_price);
};

const validateCafe = (data, errors) => {
  requireString(errors, 'Customer name', data.customer_name);
  requireEmail(errors, data.email);
  requireString(errors, 'Phone', data.phone, { max: 40 });
  requireOneOf(errors, 'Delivery type', data.delivery_type, ['delivery', 'pickup']);

  if (!Array.isArray(data.beverage_items) || data.beverage_items.length === 0) {
    errors.push('At least one cafe item is required');
  }

  if (data.friday_game_night) {
    requireString(errors, 'Board game selection', data.board_game_selection, { max: 60 });
    requireString(errors, 'Game time slot', data.game_time_slot, { max: 40 });
    requirePositiveNumber(errors, 'Player count', data.player_count, { integer: true, min: 1 });

    if (Number(data.player_count) > 6) {
      errors.push('Player count must be 6 or fewer');
    }
  }

  requirePositiveNumber(errors, 'Total price', data.total_price);
};

const validators = {
  room: validateRoom,
  garden: validateGarden,
  wellness: validateWellness,
  balcony: validateBalcony,
  restaurant: validateRestaurant,
  cafe: validateCafe,
};

export const validateBookingPayload = ({ type, data }) => {
  const errors = [];
  const validator = validators[type];
  const paymentMethod = trim(data.payment_method || 'pay_on_ground');

  if (!validator) {
    errors.push('Unsupported booking type');
  } else {
    validator(data, errors);
  }

  if (paymentMethod !== 'pay_on_ground' && paymentMethod !== 'pay_online') {
    errors.push('Payment method is invalid');
  }

  return errors;
};
