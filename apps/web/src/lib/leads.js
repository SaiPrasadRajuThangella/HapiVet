// The lead pipeline. The admin panel moves leads through it; My Demo Bookings shows customers where theirs is.
import { useMemo } from 'react';
import { db, useCollection } from './store';

// The path a lead takes. It can drop out to Lost from any of them.
export const STAGES = ['new', 'accepted', 'contacted', 'demo-booked', 'won'];
export const STATUSES = [...STAGES, 'lost'];

const LABELS = { new: 'New', accepted: 'Accepted', contacted: 'Contacted', 'demo-booked': 'Demo booked', won: 'Won', lost: 'Lost' };
export const statusLabel = (s) => LABELS[s] || s;

// What the customer sees instead of the sales wording.
const CUSTOMER_LABELS = { new: 'Request received', accepted: 'Accepted', contacted: 'In touch', 'demo-booked': 'Demo booked', won: 'On board', lost: 'Closed' };
export const customerLabel = (s) => CUSTOMER_LABELS[s] || s;

// The button that moves a lead on from each status.
export const NEXT_STEP = {
  new: { to: 'accepted', label: 'Accept lead' },
  accepted: { to: 'contacted', label: 'Mark as contacted' },
  contacted: { to: 'demo-booked', label: 'Mark as demo booked' },
  'demo-booked': { to: 'won', label: 'Mark as won' },
};

export const historyOf = (lead) => (lead.history?.length ? lead.history : [{ status: 'new', at: lead.createdAt }]);

export const stageTime = (lead, status) => [...historyOf(lead)].reverse().find((h) => h.status === status)?.at;

// How far a lead got. For a lost lead that is the stage it was at before, which is also where it reopens.
export const reachedStage = (lead) => {
  if (lead.status !== 'lost') return lead.status;
  return [...historyOf(lead)].reverse().find((h) => h.status !== 'lost')?.status ?? 'new';
};

export function moveLead(lead, status, patch = {}) {
  db.update('leads', lead._id, { ...patch, status, history: [...historyOf(lead), { status, at: new Date().toISOString() }] });
}

// Demo bookings belong to the number they were booked from, or the number given on the form.
const isMine = (lead, user) => lead.type !== 'contact' && (lead.userPhone === user.phone || lead.phone === user.phone);

export function useMyBookings(user) {
  const leads = useCollection('leads');
  return useMemo(() => leads.filter((l) => isMine(l, user)), [leads, user]);
}
