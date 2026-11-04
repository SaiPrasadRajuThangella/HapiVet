import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Avatar } from './Account';
import { useUser } from '../lib/store';

export const LOGO = 'https://hapivet.com/assets/assets/hapivet-logo.c156a3856999f73b970c316513f6a567.png';

const productLinks = [
  ['/#agents', 'AI Agents', 'Four agents, one unified brain'],
  ['/#copilot', 'Clinical Copilot', 'Voice-to-SOAP and smart suggestions'],
  ['/#analytics', 'Instant Analytics', 'Reports with zero wait time'],
  ['/#revenue', 'Billing & Payments', 'Capture every dollar you’ve earned'],
];

const solutionLinks = [
  ['/pricing', 'Small Clinics', 'Start with the Vanilla plan'],
  ['/pricing', 'Multi-Location', 'Unified dashboard for hospital groups'],
  ['/#onboarding', 'Migration', 'Go live in weeks, not months'],
];

function Dropdown({ label, links }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nav-drop" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="nav-link" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {label} <ChevronDown size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            {links.map(([to, title, sub]) => (
              <Link key={title} to={to} onClick={() => setOpen(false)}>
                <b>{title}</b>
                <span>{sub}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sheet, setSheet] = useState(false);
  const { pathname } = useLocation();
  const user = useUser();
  const signIn = `/login?next=${encodeURIComponent(pathname)}`;
  const accountLinks = user ? [['/my-bookings', 'My Demo Bookings'], ['/profile', 'Profile']] : [[signIn, 'Sign In']];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setSheet(false), [pathname]);

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" aria-label="HapiVet home">
            <img src={LOGO} alt="HapiVet AI" width="120" height="34" />
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Dropdown label="Products" links={productLinks} />
            <Dropdown label="Solutions" links={solutionLinks} />
            <NavLink to="/pricing" className="nav-link">Pricing</NavLink>
            <NavLink to="/about" className="nav-link">About</NavLink>
            <Link to="/#achievements" className="nav-link">Achievements</Link>
          </nav>
          <div className="nav-cta">
            {user
              ? <Link to="/my-bookings" className="btn btn-ghost btn-sm nav-mine">My Demo Bookings</Link>
              : <Link to={signIn} className="btn btn-ghost btn-sm">Sign In</Link>}
            <Link to="/demo" className="btn btn-dark btn-sm">Book a Demo</Link>
            {user && <Link to="/profile" className="nav-avatar" aria-label={`Your profile, ${user.name}`} title={user.name}><Avatar name={user.name} /></Link>}
            <button className="nav-burger" aria-label="Open menu" onClick={() => setSheet(true)}><Menu /></button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {sheet && (
          <motion.div className="nav-sheet" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            <div className="sheet-top">
              <img src={LOGO} alt="HapiVet AI" height="30" style={{ height: 30 }} />
              <button className="nav-burger" aria-label="Close menu" onClick={() => setSheet(false)}><X /></button>
            </div>
            {[['/', 'Home'], ['/#agents', 'AI Agents'], ['/#achievements', 'Achievements'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact'], ...accountLinks].map(([to, label]) => (
              <Link key={label} to={to} onClick={() => setSheet(false)}>{label}</Link>
            ))}
            <Link to="/demo" className="btn btn-dark btn-lg" style={{ marginTop: 18, fontSize: 16, borderBottom: 0 }} onClick={() => setSheet(false)}>Book a Demo</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
