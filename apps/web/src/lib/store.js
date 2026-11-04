// Data layer. Everything lives in the API. The seed only fills the page until the first response
// arrives, and the last response is kept in localStorage so returning visitors don't see it.
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import * as seed from '../data/seed';

// Empty in development: Vite forwards /api to the local API.
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const defaults = {
  achievements: seed.achievements,
  testimonials: seed.testimonials,
  plans: seed.plans,
  team: seed.team,
  settings: seed.settings,
  leads: [],
};

// Leads hold people's details, so they never go in localStorage.
const isPublic = (name) => name !== 'leads';

const listeners = new Set();
const cache = {};
const key = (name) => `hv:${name}`;
const notify = () => listeners.forEach((l) => l());

// Left behind by the mock version of this site.
try { ['hv:leads', 'hv:profiles'].forEach((k) => localStorage.removeItem(k)); } catch { /* noop */ }

function read(name) {
  if (cache[name]) return cache[name];
  let value;
  if (isPublic(name)) {
    try {
      const raw = localStorage.getItem(key(name));
      value = raw ? JSON.parse(raw) : undefined;
    } catch {
      value = undefined;
    }
  }
  cache[name] = value ?? defaults[name];
  return cache[name];
}

function write(name, value) {
  cache[name] = value;
  if (isPublic(name)) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch {
      /* storage unavailable: keep in-memory only */
    }
  }
  notify();
}

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// Signing in or out in another tab, or a fresh copy of the content, shows here straight away.
window.addEventListener('storage', (e) => {
  if (e.key && !e.key.startsWith('hv:')) return;
  if (e.key) delete cache[e.key.slice(3)];
  else Object.keys(cache).forEach((n) => delete cache[n]);
  notify();
});

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'We can’t reach the server. Check your connection and try again.');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => undefined);
  if (!res.ok || data === undefined) throw new ApiError(res.status, data?.message || 'Something went wrong. Try again.');
  return data;
}

// ---- sessions ----
const AUTH_KEY = 'hv:session';
const USER_KEY = 'hv:user';

// Sessions saved by the mock version of this site have no token, so they count as signed out.
function readSession(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw && JSON.parse(raw).token ? raw : null;
  } catch {
    return null;
  }
}

function saveSession(storageKey, session) {
  try { localStorage.setItem(storageKey, JSON.stringify(session)); } catch { /* noop */ }
  notify();
}

function clearSession(storageKey) {
  try { localStorage.removeItem(storageKey); } catch { /* noop */ }
  notify();
}

const tokenOf = (storageKey) => {
  const raw = readSession(storageKey);
  return raw ? JSON.parse(raw).token : undefined;
};

export const adminToken = () => tokenOf(AUTH_KEY);

// ---- admin auth ----
export const auth = {
  async login(email, password) {
    saveSession(AUTH_KEY, await request('/auth/admin', { method: 'POST', body: { email, password } }));
  },
  logout: () => clearSession(AUTH_KEY),
  get: () => readSession(AUTH_KEY),
};

export const useAuth = () => useSyncExternalStore(subscribe, auth.get);

// ---- customer sign-in. Any mobile number works; the API says which code to use until SMS exists. ----
export const userAuth = {
  requestCode: (phone) => request('/auth/otp', { method: 'POST', body: { phone } }),
  async verify(phone, code, claim) {
    saveSession(USER_KEY, await request('/auth/verify', { method: 'POST', body: { phone, code, claim } }));
  },
  async update(patch) {
    const session = JSON.parse(readSession(USER_KEY));
    const user = await request('/me', { method: 'PATCH', body: patch, token: session.token });
    saveSession(USER_KEY, { ...session, user });
  },
  logout: () => clearSession(USER_KEY),
  get: () => readSession(USER_KEY),
  token: () => tokenOf(USER_KEY),
};

export const useUser = () => {
  const raw = useSyncExternalStore(subscribe, userAuth.get);
  return useMemo(() => (raw ? JSON.parse(raw).user : null), [raw]);
};

// ---- errors from admin changes, shown as a toast ----
let lastError = '';

function report(err) {
  if (err.status === 401 && adminToken()) {
    auth.logout();
    return;
  }
  lastError = err.message;
  notify();
}

export const clearApiError = () => {
  lastError = '';
  notify();
};

export const useApiError = () => useSyncExternalStore(subscribe, () => lastError);

// ---- collections ----
function load(name) {
  const token = adminToken();
  if (name === 'leads' && !token) return Promise.resolve();
  return request(`/${name}`, { token }).then((value) => write(name, value));
}

export const refresh = (name) => load(name).catch(report);

const requested = new Set();

function ensureLoaded(name) {
  // Signing in as admin asks again, to include what isn't published yet.
  const marker = `${name}:${adminToken() ? 'admin' : 'visitor'}`;
  if (requested.has(marker)) return;
  requested.add(marker);
  load(name).catch((err) => {
    requested.delete(marker);
    // Visitors just keep seeing the content they have if the API is unreachable.
    if (adminToken()) report(err);
  });
}

export function useCollection(name) {
  useEffect(() => ensureLoaded(name), [name]);
  return useSyncExternalStore(subscribe, () => read(name));
}

const asAdmin = (path, options) => request(path, { ...options, token: adminToken() });

// Admin changes. Each resolves to the saved document, or null after reporting why it failed.
async function attempt(task, undo) {
  if (lastError) clearApiError();
  try {
    return await task();
  } catch (err) {
    undo?.();
    report(err);
    return null;
  }
}

export const db = {
  create: (name, doc) => attempt(async () => {
    const created = await asAdmin(`/${name}`, { method: 'POST', body: doc });
    write(name, [created, ...read(name)]);
    return created;
  }),
  // Updates and removals show straight away and roll back if the API refuses.
  update: (name, id, patch) => {
    const before = read(name);
    write(name, before.map((d) => (d._id === id ? { ...d, ...patch } : d)));
    return attempt(async () => {
      const saved = await asAdmin(`/${name}/${id}`, { method: 'PATCH', body: patch });
      write(name, read(name).map((d) => (d._id === id ? saved : d)));
      return saved;
    }, () => write(name, before));
  },
  remove: (name, id) => {
    const before = read(name);
    write(name, before.filter((d) => d._id !== id));
    return attempt(async () => {
      await asAdmin(`/${name}/${id}`, { method: 'DELETE' });
      return true;
    }, () => write(name, before));
  },
  setObject: (name, patch) => attempt(async () => {
    const saved = await asAdmin(`/${name}`, { method: 'PATCH', body: patch });
    write(name, saved);
    return saved;
  }),
  reset: () => attempt(async () => {
    await asAdmin('/admin/reset', { method: 'POST' });
    await Promise.all(Object.keys(defaults).map(load));
    return true;
  }),
};

// ---- live updates ----
// Runs onChange when the API says leads changed, when the tab comes back into view, and every
// 30 seconds in case the stream dropped.
export function useLive(token, onChange) {
  useEffect(() => {
    if (!token) return undefined;
    const controller = new AbortController();

    (async () => {
      let reconnecting = false;
      while (!controller.signal.aborted) {
        try {
          const res = await fetch(`${API_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
          if (res.status === 401) return;
          if (reconnecting) onChange(); // may have missed something while disconnected
          reconnecting = true;
          const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value.includes('event: change')) onChange();
          }
        } catch {
          /* dropped: try again below */
        }
        await new Promise((r) => { setTimeout(r, 3000); });
      }
    })();

    const onVisible = () => { if (document.visibilityState === 'visible') onChange(); };
    const timer = setInterval(onVisible, 30000);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [token, onChange]);
}
