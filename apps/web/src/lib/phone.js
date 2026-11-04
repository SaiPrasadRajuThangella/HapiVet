import { browserZone } from './slots';

export const DIAL_CODES = [['+1', 'US'], ['+91', 'IN'], ['+44', 'UK'], ['+61', 'AU'], ['+971', 'AE'], ['+65', 'SG'], ['+49', 'DE'], ['+33', 'FR']];

export const defaultDial = () => (/Calcutta|Kolkata/.test(browserZone()) ? '+91' : '+1');

export const digitsOnly = (value) => value.replace(/\D/g, '');

// Loose on purpose: any mobile number signs in for now.
export const isValidNumber = (digits) => digits.length >= 7 && digits.length <= 15;

// "+919876543210" back into its dial code and number.
export function splitPhone(phone) {
  if (!phone) return { dial: defaultDial(), number: '' };
  const match = DIAL_CODES.map(([d]) => d).sort((a, b) => b.length - a.length).find((d) => phone.startsWith(d));
  return match ? { dial: match, number: phone.slice(match.length) } : { dial: defaultDial(), number: digitsOnly(phone) };
}

export function formatPhone(phone) {
  const { dial, number } = splitPhone(phone);
  return number ? `${dial} ${number}` : '';
}
