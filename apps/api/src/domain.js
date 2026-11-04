// The path a lead takes. It can drop out to Lost from any stage before Won.
export const STAGES = ['new', 'accepted', 'contacted', 'demo-booked', 'won'];
export const STATUSES = [...STAGES, 'lost'];

// How far a lead got. For a lost lead that is the stage it was at before, which is also where it reopens.
export function reachedStage(lead) {
  if (lead.status !== 'lost') return lead.status;
  return [...lead.history].reverse().find((h) => h.status !== 'lost')?.status ?? 'new';
}

// One stage at a time, forwards or back. Lost reopens where it left off.
export function canMove(lead, to) {
  if (lead.status === 'lost') return to === reachedStage(lead);
  if (to === 'lost') return lead.status !== 'won';
  return Math.abs(STAGES.indexOf(lead.status) - STAGES.indexOf(to)) === 1;
}
