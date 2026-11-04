// Demo slots. They come from HapiVet's Cal.com event, the same source as the calendar on hapivet.com/demo,
// so the times here match the live site. Bookings themselves stay in the mock store until the API exists.
import { useEffect, useState } from 'react';

export const EVENT = {
  team: 'HapiVet AI',
  title: 'HapiVet In-Depth Walkthrough',
  description: 'A 30-minute conversation to review your current PIMS experience, understand your pain points and feature requests, and assess whether HapiVet AI is the right fit for your practice.',
  minutes: 30,
  location: 'Online Meeting',
};

export const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;

const SLOTS_URL = 'https://api.cal.com/v2/slots';

// The event's weekly availability in minutes after midnight, read off Cal.com. Only used if Cal.com can't be reached.
const TEAM_ZONE = 'America/New_York';
const WEEKLY = {
  1: [[750, 840], [930, 1140], [1260, 1320], [1380, 1440]],
  2: [[0, 180], [840, 900], [1110, 1320], [1380, 1440]],
  3: [[0, 180], [750, 840], [930, 1140], [1260, 1320], [1380, 1440]],
  4: [[0, 180], [750, 900], [1020, 1320], [1380, 1440]],
  5: [[0, 180], [900, 1380]],
  6: [[1020, 1380]],
};

export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
export const allZones = () => (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : []);

export const dayKey = (when, timeZone) => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(when));
export const monthOf = (when, timeZone) => dayKey(when, timeZone).slice(0, 7);

export function addMonths(month, n) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
}

// The month laid out for a Sunday-first grid: blanks, then one "YYYY-MM-DD" per day.
export function monthCells(month) {
  const [y, m] = month.split('-').map(Number);
  const blanks = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [...Array(blanks).fill(null), ...Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
}

const groupByDay = (slots, month, timeZone) => {
  const days = {};
  slots.forEach((iso) => {
    const day = dayKey(iso, timeZone);
    if (day.startsWith(month)) (days[day] ||= []).push(iso);
  });
  return days;
};

async function fromCal(month, timeZone) {
  const [y, m] = month.split('-').map(Number);
  const query = new URLSearchParams({
    teamSlug: 'hapivet',
    eventTypeSlug: 'demo',
    start: `${month}-01`,
    end: new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10),
    timeZone,
  });
  const res = await fetch(`${SLOTS_URL}?${query}`, { headers: { 'cal-api-version': '2024-09-04' } });
  if (!res.ok) throw new Error(`Cal.com answered ${res.status}`);
  const { data } = await res.json();
  return groupByDay(Object.values(data).flat().map((s) => new Date(s.start).toISOString()), month, timeZone);
}

const zoneOffset = (ms, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(ms);
  const p = Object.fromEntries(parts.map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(ms / 60000) * 60000;
};

function fromWeekly(month, timeZone) {
  const [y, m] = month.split('-').map(Number);
  const slots = [];
  // Runs a day past each end of the month: a slot can land on a neighbouring date in the viewer's zone.
  for (let d = 0; d <= 32; d += 1) {
    const midnight = Date.UTC(y, m - 1, d);
    (WEEKLY[new Date(midnight).getUTCDay()] || []).forEach(([from, to]) => {
      for (let min = from; min < to; min += EVENT.minutes) {
        const wall = midnight + min * 60000;
        slots.push(new Date(wall - zoneOffset(wall, TEAM_ZONE)).toISOString());
      }
    });
  }
  return groupByDay(slots, month, timeZone);
}

const loaded = new Map();

// The month's slots by day, or null while they load.
export function useMonthSlots(month, timeZone) {
  const key = `${month}|${timeZone}`;
  const [state, setState] = useState(null);
  useEffect(() => {
    let live = true;
    if (!loaded.has(key)) loaded.set(key, fromCal(month, timeZone).catch(() => fromWeekly(month, timeZone)));
    loaded.get(key).then((days) => { if (live) setState({ key, days }); });
    return () => { live = false; };
  }, [key, month, timeZone]);
  return state?.key === key ? state.days : null;
}

export function formatTime(when, timeZone, hour12 = true) {
  const opts = hour12 ? { hour: 'numeric', minute: '2-digit', hour12: true } : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  return new Date(when).toLocaleTimeString('en-US', { ...opts, timeZone }).replace(/\s/g, '').toLowerCase();
}

export const formatDate = (when, timeZone) => new Date(when).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone });
export const formatShortDate = (when, timeZone) => new Date(when).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone });
export const formatStamp = (when) => new Date(when).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const zoneName = (timeZone) => new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'long' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value ?? timeZone;

export const slotEnd = (when) => new Date(new Date(when).getTime() + EVENT.minutes * 60000).toISOString();

// "Wed 4th" for the times column, from a "YYYY-MM-DD" key.
export function dayHeading(key) {
  const date = new Date(`${key}T12:00:00Z`);
  const n = date.getUTCDate();
  const teen = n % 100 > 10 && n % 100 < 14;
  const ordinal = !teen && ['th', 'st', 'nd', 'rd'][n % 10] ? ['th', 'st', 'nd', 'rd'][n % 10] : 'th';
  return { weekday: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }), day: `${n}${ordinal}` };
}
