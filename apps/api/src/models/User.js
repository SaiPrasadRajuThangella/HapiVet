import mongoose from 'mongoose';

// A customer. Signing in with a mobile number creates one; the email is sample data for now,
// because sign-in only asks for the number.
const schema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, default: 'HapiVet User', trim: true },
  email: { type: String, default() { return `user${this.phone.slice(-4)}@example.com`; } },
  lastLoginAt: Date,
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret) => ({ phone: ret.phone, name: ret.name, email: ret.email }),
  },
});

export const User = mongoose.model('User', schema);
