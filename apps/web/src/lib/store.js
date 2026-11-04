// Mock data layer. Collections live in localStorage so edits made in the admin panel show on the
// public site. Replace the bodies of these functions with fetch() calls once the Express API exists.
import { useMemo, useSyncExternalStore } from 'react';
import * as seed from '../data/seed';

const defaults = {
  achievements: seed.achievements,
  testimonials: seed.testimonials,
  plans: seed.plans,
  leads: seed.leads,
  team: seed.team,
  settings: seed.settings,
};

const listeners = new Set();
const cache = {};
const key = (name) => `hv:${name}`;

function read(name) {
  if (cache[name]) return cache[name];
  let value;
  try {
    const raw = localStorage.getItem(key(name));
    value = raw ? JSON.parse(raw) : undefined;
  } catch {
    value = undefined;
  }
  cache[name] = value ?? defaults[name];
  return cache[name];
}

function write(name, value) {
  cache[name] = value;
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    /* storage unavailable: keep in-memory only */
  }
  listeners.forEach((l) => l());
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// Another tab changed the data (an admin moving a lead, say): drop our copy so this tab shows it straight away.
window.addEventListener('storage', (e) => {
  if (e.key && !e.key.startsWith('hv:')) return;
  if (e.key) delete cache[e.key.slice(3)];
  else Object.keys(cache).forEach((n) => delete cache[n]);
  listeners.forEach((l) => l());
});

export const useCollection = (name) => useSyncExternalStore(subscribe, () => read(name));

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const db = {
  create: (name, doc) => {
    const created = { _id: uid(), createdAt: new Date().toISOString(), ...doc };
    write(name, [created, ...read(name)]);
    return created;
  },
  update: (name, id, patch) => write(name, read(name).map((d) => (d._id === id ? { ...d, ...patch } : d))),
  remove: (name, id) => write(name, read(name).filter((d) => d._id !== id)),
  setObject: (name, patch) => write(name, { ...read(name), ...patch }),
  reset: () => {
    Object.keys(defaults).forEach((n) => {
      delete cache[n];
      try { localStorage.removeItem(key(n)); } catch { /* noop */ }
    });
    listeners.forEach((l) => l());
  },
};

// ---- admin auth (mock). The real API will issue a JWT. ----
const AUTH_KEY = 'hv:session';
const ADMIN = { email: 'admin@hapivet.com', password: 'hapivet123' };

export const auth = {
  login(email, password) {
    if (email.trim().toLowerCase() === ADMIN.email && password === ADMIN.password) {
      try { localStorage.setItem(AUTH_KEY, JSON.stringify({ email: ADMIN.email, at: Date.now() })); } catch { /* noop */ }
      listeners.forEach((l) => l());
      return true;
    }
    return false;
  },
  logout() {
    try { localStorage.removeItem(AUTH_KEY); } catch { /* noop */ }
    listeners.forEach((l) => l());
  },
  get() {
    try { return localStorage.getItem(AUTH_KEY); } catch { return null; }
  },
};

export const useAuth = () => useSyncExternalStore(subscribe, auth.get);

// ---- customer sign-in (mock). Any mobile number works and the code is always 123456. ----
const USER_KEY = 'hv:user';
const PROFILES_KEY = 'hv:profiles'; // by mobile number, so an edited name survives signing out
export const DEMO_OTP = '123456';

const readProfiles = () => {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || {}; } catch { return {}; }
};

function saveUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(PROFILES_KEY, JSON.stringify({ ...readProfiles(), [user.phone]: user }));
  } catch { /* noop */ }
  listeners.forEach((l) => l());
}

export const userAuth = {
  login(phone, code) {
    if (code !== DEMO_OTP) return false;
    saveUser(readProfiles()[phone] || { phone, name: 'HapiVet User', email: `user${phone.slice(-4)}@example.com` });
    return true;
  },
  logout() {
    try { localStorage.removeItem(USER_KEY); } catch { /* noop */ }
    listeners.forEach((l) => l());
  },
  update(patch) {
    const raw = userAuth.get();
    if (raw) saveUser({ ...JSON.parse(raw), ...patch });
  },
  get() {
    try { return localStorage.getItem(USER_KEY); } catch { return null; }
  },
};

export const useUser = () => {
  const raw = useSyncExternalStore(subscribe, userAuth.get);
  return useMemo(() => (raw ? JSON.parse(raw) : null), [raw]);
};
