// Mock data layer. Collections live in localStorage so edits made in the admin panel show on the
// public site. Replace the bodies of these functions with fetch() calls once the Express API exists.
import { useSyncExternalStore } from 'react';
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

export const useCollection = (name) => useSyncExternalStore(subscribe, () => read(name));

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const db = {
  create: (name, doc) => write(name, [{ _id: uid(), createdAt: new Date().toISOString(), ...doc }, ...read(name)]),
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
