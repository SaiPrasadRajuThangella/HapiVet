import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, DollarSign, ExternalLink, Inbox, LayoutDashboard, LogOut, MessageSquareQuote, Settings as SettingsIcon, Users } from 'lucide-react';
import { adminToken, auth, clearApiError, refresh, useApiError, useAuth, useLive } from '../lib/store';
import { LOGO } from '../components/Navbar';
import Dashboard from './Dashboard';
import Leads from './Leads';
import ResourcePage from './ResourcePage';
import Settings from './Settings';

const achievementFields = [
  { key: 'title', label: 'Title', required: true },
  { key: 'org', label: 'Organisation / badge', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'summary', label: 'Summary', type: 'textarea', required: true },
  { key: 'image', label: 'Image URL (Unsplash)', type: 'image' },
  { key: 'link', label: 'Source link', type: 'url' },
  { key: 'published', label: 'Show on website', type: 'checkbox' },
];

const testimonialFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'role', label: 'Role', required: true },
  { key: 'quote', label: 'Quote', type: 'textarea', required: true },
  { key: 'metricA', label: 'Metric A (value|label)', hint: 'For example: 40%|Less documentation time' },
  { key: 'metricB', label: 'Metric B (value|label)' },
  { key: 'published', label: 'Show on website', type: 'checkbox' },
];

const planFields = [
  { key: 'name', label: 'Plan name', required: true },
  { key: 'price', label: 'Monthly price (USD)', type: 'number', hint: 'Leave empty for custom pricing' },
  { key: 'unit', label: 'Unit label', required: true, hint: 'For example: /month, or Custom' },
  { key: 'blurb', label: 'Description', type: 'textarea' },
  { key: 'features', label: 'Features (one per line)', type: 'lines' },
  { key: 'addon', label: 'Add-on text' },
  { key: 'cta', label: 'Button', type: 'select', options: ['Book a Demo', 'Contact Sales'] },
  { key: 'popular', label: 'Highlight as most popular', type: 'checkbox' },
];

const teamFields = [
  { key: 'name', label: 'Name', required: true },
  { key: 'role', label: 'Role', required: true },
  { key: 'photo', label: 'Photo URL', type: 'image' },
  { key: 'bio', label: 'Bio', type: 'textarea' },
];

const nav = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/leads', 'Leads', Inbox],
  ['/admin/achievements', 'Achievements', Award],
  ['/admin/testimonials', 'Testimonials', MessageSquareQuote],
  ['/admin/pricing', 'Pricing', DollarSign],
  ['/admin/team', 'Team', Users],
  ['/admin/settings', 'Settings', SettingsIcon],
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await auth.login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="form-card adm-login-card" onSubmit={submit}>
        <img src={LOGO} alt="HapiVet AI" style={{ height: 34 }} />
        <div>
          <h1 className="h3" style={{ fontSize: '1.6rem' }}>Sign in to admin</h1>
          <p className="muted" style={{ fontSize: 14 }}>Manage leads and website content.</p>
        </div>
        <div className="field">
          <label htmlFor="adm-email">Email</label>
          <input id="adm-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="adm-password">Password</label>
          <input id="adm-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" style={{ color: '#a33a3a', fontSize: 14 }}>{error}</p>}
        <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="muted" style={{ fontSize: 14, textAlign: 'center' }}>Back to website</Link>
      </form>
    </div>
  );
}

const refreshLeads = () => refresh('leads');

function ApiErrorToast() {
  const error = useApiError();
  useEffect(() => {
    if (!error) return undefined;
    const t = setTimeout(clearApiError, 5000);
    return () => clearTimeout(t);
  }, [error]);
  return (
    <AnimatePresence>
      {error && <motion.div className="ac-toast adm-toast adm-toast-error" role="alert" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>{error}</motion.div>}
    </AnimatePresence>
  );
}

export default function AdminApp() {
  const session = useAuth();
  if (!session) return <Login />;
  return <Panel />;
}

function Panel() {
  // New bookings and changes from another admin tab show up straight away.
  useLive(adminToken(), refreshLeads);

  return (
    <div className="adm">
      <aside className="adm-side">
        <Link to="/admin" className="adm-brand"><img src={LOGO} alt="HapiVet AI" /></Link>
        <nav className="adm-nav" aria-label="Admin">
          {nav.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end}><Icon size={17} /><span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="adm-side-foot">
          <Link to="/"><ExternalLink size={16} /><span>View website</span></Link>
          <button onClick={auth.logout}><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </aside>
      <main className="adm-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route
            path="achievements"
            element={(
              <ResourcePage
                name="achievements"
                title="Achievements"
                subtitle="Shown in the “Our Achievements” slider on the home page."
                singular="achievement"
                fields={achievementFields}
                columns={[['title', 'Title'], ['org', 'Organisation'], ['date', 'Date']]}
                defaults={{ published: true }}
              />
            )}
          />
          <Route
            path="testimonials"
            element={(
              <ResourcePage
                name="testimonials"
                title="Testimonials"
                subtitle="Rotates in the “Why HapiVet” section."
                singular="testimonial"
                fields={testimonialFields}
                columns={[['name', 'Name'], ['role', 'Role']]}
                defaults={{ published: true }}
              />
            )}
          />
          <Route
            path="pricing"
            element={(
              <ResourcePage
                name="plans"
                title="Pricing"
                subtitle="Plans on the pricing page."
                singular="plan"
                fields={planFields}
                columns={[['name', 'Plan'], ['price', 'Monthly price', (v) => (v == null ? 'Custom' : `$${v}`)], ['unit', 'Unit']]}
                defaults={{ cta: 'Book a Demo', features: [] }}
              />
            )}
          />
          <Route
            path="team"
            element={(
              <ResourcePage
                name="team"
                title="Team"
                subtitle="People on the About page."
                singular="team member"
                fields={teamFields}
                columns={[['name', 'Name'], ['role', 'Role']]}
              />
            )}
          />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>
      <ApiErrorToast />
    </div>
  );
}
