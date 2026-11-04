import mongoose from 'mongoose';
import { STATUSES } from '../domain.js';

const schema = new mongoose.Schema({
  type: { type: String, enum: ['demo', 'contact'], default: 'demo' },
  status: { type: String, enum: STATUSES, default: 'new' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  clinic: { type: String, required: true },
  jobTitle: { type: String, default: '' },
  city: { type: String, default: '' },
  size: { type: String, default: '' },
  message: { type: String, default: '' },
  guests: { type: [String], default: [] },
  slot: Date,
  // The time while this lead holds it. Unique, so two bookings can't take one time; a lost lead lets go.
  slotLock: Date,
  timeZone: { type: String, default: '' },
  userPhone: { type: String, default: '' }, // the account it belongs to
  note: { type: String, default: '' }, // shown to the customer
  meetingLink: { type: String, default: '' },
  lostReason: { type: String, default: '' },
  history: { type: [{ _id: false, status: String, at: Date }], default: [] },
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => {
      delete ret.slotLock;
      return ret;
    },
  },
});

schema.pre('validate', function holdSlot() {
  this.slotLock = this.slot && this.status !== 'lost' ? this.slot : undefined;
});

schema.index({ slotLock: 1 }, { unique: true, sparse: true });
schema.index({ userPhone: 1 });
schema.index({ phone: 1 });

export const Lead = mongoose.model('Lead', schema);
