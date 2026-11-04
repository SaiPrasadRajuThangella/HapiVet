import { useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarClock, FileText, MessageSquareText, Phone } from 'lucide-react';
import { LOGO } from '../components/Navbar';
import PhoneInput from '../components/PhoneInput';
import PuppyStage from '../components/PuppyStage';
import { stats } from '../data/seed';
import { useCollection, userAuth, useUser } from '../lib/store';
import { defaultDial, isValidNumber } from '../lib/phone';

// Only same-site paths, so ?next= can't send people elsewhere.
const safeNext = (next) => (next?.startsWith('/') && !next.startsWith('//') ? next : '/');

const chips = [
  { icon: Phone, title: 'Answering a call', detail: 'Booked "Max" for a wellness exam' },
  { icon: FileText, title: 'SOAP note written', detail: 'Bella, post-op checkup' },
  { icon: CalendarClock, title: 'Schedule optimized', detail: '3 appointments moved' },
];

function Side() {
  const settings = useCollection('settings');
  // The canvas is only worth loading where this panel shows.
  const [wide] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  return (
    <aside className="lg-side">
      <Link to="/" className="lg-logo" aria-label="HapiVet home"><img src={LOGO} alt="HapiVet AI" width="120" height="34" /></Link>
      <div className="lg-copy">
        <h2>{settings.heroTitleA}<br />{settings.heroTitleB}</h2>
        <p>{settings.heroSub}</p>
      </div>
      <div className="lg-stage">
        {wide && <PuppyStage />}
        {chips.map(({ icon: Icon, title, detail }, i) => (
          <div key={title} className={`lg-chip lg-chip-${i}`}>
            <span><Icon size={16} /></span>
            <p><b>{title}</b><small>{detail}</small></p>
          </div>
        ))}
      </div>
      <div className="lg-stats">
        {stats.map((s) => <div key={s.label}><b>{s.value}{s.suffix}</b><span>{s.label}</span></div>)}
      </div>
    </aside>
  );
}

// Six boxes over one real input, so paste and SMS autofill work.
function CodeInput({ value, onChange, invalid }) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(true);
  return (
    <div className="lg-code">
      <input
        ref={ref}
        autoFocus
        id="lg-code"
        aria-label="6-digit code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      <div aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={`${invalid ? 'bad' : ''}${focused && i === Math.min(value.length, 5) ? ' on' : ''}`}>{value[i] ?? ''}</span>
        ))}
      </div>
    </div>
  );
}

export default function Login() {
  const user = useUser();
  const [params] = useSearchParams();
  const { state } = useLocation();
  const next = safeNext(params.get('next'));
  const [step, setStep] = useState('phone');
  const [dial, setDial] = useState(defaultDial);
  const [number, setNumber] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  const phone = `${dial}${number}`;

  const sendCode = async (e) => {
    e.preventDefault();
    if (!isValidNumber(number)) { setError('Please enter a valid mobile number'); return; }
    setError('');
    setBusy(true);
    try {
      const res = await userAuth.requestCode(phone);
      setDemoCode(res.demoCode ?? '');
      setCode('');
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // A booking made before signing in moves onto this account (state.claim). Success redirects above.
  const verify = async (value) => {
    if (busy) return;
    setBusy(true);
    try {
      await userAuth.verify(phone, value, state?.claim);
    } catch (err) {
      setError(err.message);
      setCode('');
      setBusy(false);
    }
  };

  return (
    <div className="lg">
      <Side />
      <main className="lg-main">
        <div className="lg-top">
          <Link to="/" className="lg-logo-small" aria-label="HapiVet home"><img src={LOGO} alt="HapiVet AI" height="30" /></Link>
          <Link to="/" className="lg-back">Back to website</Link>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            className="lg-card"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 'phone' ? (
              <form onSubmit={sendCode} noValidate>
                <h1>Welcome to HapiVet</h1>
                <p className="muted">Enter your mobile number to sign in or create an account.</p>
                <div className="lg-field">
                  <label htmlFor="lg-phone">Mobile number</label>
                  <PhoneInput id="lg-phone" autoFocus dial={dial} number={number} invalid={!!error} onDial={setDial} onNumber={(v) => { setNumber(v); setError(''); }} />
                  {error && <small role="alert">{error}</small>}
                </div>
                <button type="submit" className="btn btn-dark btn-lg lg-submit" disabled={busy}>{busy ? 'Sending…' : <>Send code <ArrowRight size={17} /></>}</button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (code.length === 6) verify(code); }} noValidate>
                <button type="button" className="lg-change" onClick={() => { setStep('phone'); setError(''); }}><ArrowLeft size={15} /> Change number</button>
                <h1>Enter the code</h1>
                <p className="muted">Sent to <b>{dial} {number}</b></p>
                <div className="lg-field">
                  <CodeInput value={code} invalid={!!error} onChange={(v) => { setCode(v); setError(''); if (v.length === 6) verify(v); }} />
                  {error && <small role="alert">{error}</small>}
                </div>
                {demoCode && <p className="lg-hint"><MessageSquareText size={17} /><span>Demo mode, no SMS is sent yet. Your code is <b>{demoCode}</b>.</span></p>}
                <button type="submit" className="btn btn-dark btn-lg lg-submit" disabled={code.length < 6 || busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
