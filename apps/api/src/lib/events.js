// Tells open pages that leads changed, so they fetch again straight away. Runs in one process,
// which is all a single Render instance needs; several instances would need Redis or similar.
import { EventEmitter } from 'node:events';

const bus = new EventEmitter();
bus.setMaxListeners(0);

export const ADMIN_CHANNEL = 'admin';
export const customerChannel = (phone) => `customer:${phone}`;

export function publishLead(lead) {
  bus.emit(ADMIN_CHANNEL);
  new Set([lead.userPhone, lead.phone].filter(Boolean)).forEach((phone) => bus.emit(customerChannel(phone)));
}

export const publishAll = (channel) => bus.emit(channel);

export function listen(channel, fn) {
  bus.on(channel, fn);
  return () => bus.off(channel, fn);
}
