import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, SearchX, Video, X } from 'lucide-react';
import { AccountLayout } from '../components/Account';
import { CustomerPill } from './MyBookings';
import { customerLabel, reachedStage, STAGES, stageTime, useMyBookings } from '../lib/leads';
import { EVENT, formatDate, formatStamp, formatTime, slotEnd, zoneName } from '../lib/slots';
import { formatPhone } from '../lib/phone';

const HEADLINES = {
  new: 'We’ve received your request',
  accepted: 'Your request was accepted',
  contacted: 'We’ve been in touch',
  'demo-booked': 'Your demo is booked',
  won: 'Welcome to HapiVet',
  lost: 'This request was closed',
};

const when = (lead) => `${formatDate(lead.slot, lead.timeZone)}, ${formatTime(lead.slot, lead.timeZone)}`;

function stepCopy(lead) {
  const reach = lead.phone ? formatPhone(lead.phone) : lead.email;
  return {
    new: { title: 'Request received', done: lead.slot ? `You asked for a demo on ${when(lead)}.` : 'You asked for a demo.' },
    accepted: { title: 'Accepted by our team', done: 'A HapiVet specialist picked up your request.', upcoming: 'Our team reviews every request and will accept yours shortly.' },
    contacted: { title: 'We get in touch', done: `We’ve been in touch with you at ${reach}.`, upcoming: `We’ll reach out at ${reach} to go over the details.` },
    'demo-booked': { title: 'Demo booked', done: lead.slot ? `Your ${EVENT.minutes}-minute walkthrough is confirmed for ${when(lead)}.` : `Your ${EVENT.minutes}-minute walkthrough is confirmed.`, upcoming: 'We’ll confirm your time and share the meeting link here.' },
    won: { title: 'Welcome to HapiVet', done: 'You’re all set. Our onboarding team will guide you from here.', upcoming: 'After the demo, we’ll help you get started if HapiVet is the right fit.' },
  };
}

// Every phase of a booking. A closed one keeps what happened and drops the steps that never will.
function buildSteps(lead) {
  const copy = stepCopy(lead);
  const reached = STAGES.indexOf(reachedStage(lead));
  const steps = STAGES.map((s, i) => ({
    key: s,
    title: copy[s].title,
    at: i <= reached ? stageTime(lead, s) : undefined,
    state: i <= reached ? 'done' : 'upcoming',
    text: i <= reached ? copy[s].done : copy[s].upcoming,
  }));
  if (lead.status === 'lost') {
    return [...steps.filter((s) => s.state === 'done'), {
      key: 'closed',
      title: 'Closed',
      at: stageTime(lead, 'lost'),
      state: 'closed',
      text: lead.lostReason || 'This request was closed. Get in touch if you’d like to pick it up again.',
    }];
  }
  const next = steps.find((s) => s.state === 'upcoming');
  if (next) next.state = 'current';
  return steps;
}

function Timeline({ lead }) {
  const steps = buildSteps(lead);
  const noteOn = lead.status === 'lost' ? null : reachedStage(lead);
  return (
    <ol className="ac-timeline">
      {steps.map((s) => (
        <motion.li key={s.key} layout="position" className={`is-${s.state}`} aria-current={s.state === 'current' ? 'step' : undefined}>
          <span className="ac-dot">
            {s.state === 'done' && <Check size={15} strokeWidth={3} />}
            {s.state === 'closed' && <X size={15} strokeWidth={3} />}
            {s.state === 'current' && <i />}
          </span>
          <div>
            <div className="ac-step-head">
              <b>{s.title}</b>
              {s.at ? <time dateTime={s.at}>{formatStamp(s.at)}</time> : s.state === 'current' && <em>Up next</em>}
            </div>
            <p>{s.text}</p>
            {s.key === noteOn && lead.note && <blockquote>“{lead.note}”</blockquote>}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

const safeLink = (url) => (/^https?:\/\//i.test(url || '') ? url : null);

export default function BookingDetail() {
  const { id } = useParams();
  const { bookings, loading, error } = useMyBookings();
  const lead = bookings.find((b) => b._id === id);
  const [toast, setToast] = useState('');
  const status = lead?.status;
  const shown = useRef(status);

  // The admin panel moved this booking while it was open.
  useEffect(() => {
    if (shown.current && status && shown.current !== status) setToast(`Updated just now: ${customerLabel(status)}`);
    shown.current = status;
  }, [status]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading) return <AccountLayout><div className="ac-card ac-loading" aria-busy="true" /></AccountLayout>;
  if (error && !lead) return <AccountLayout><p className="ac-card ac-error" role="alert">{error}</p></AccountLayout>;

  if (!lead) {
    return (
      <AccountLayout>
        <div className="ac-card ac-empty">
          <span><SearchX size={26} /></span>
          <h3>We can’t find that booking on your account</h3>
          <p className="muted">Bookings show up for the mobile number they were made with. Check you’re signed in with that number.</p>
          <Link to="/my-bookings" className="btn btn-dark btn-sm">Go to My Demo Bookings</Link>
        </div>
      </AccountLayout>
    );
  }

  const meeting = safeLink(lead.meetingLink);
  const details = [
    ['Practice', lead.clinic],
    ['Job title', lead.jobTitle],
    ['City/State', lead.city],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', formatPhone(lead.phone)],
    ['Guests', lead.guests?.join(', ')],
    ['Where', EVENT.location],
    ['Time zone', lead.timeZone && zoneName(lead.timeZone)],
  ].filter(([, v]) => v);

  return (
    <AccountLayout>
      <Link to="/my-bookings" className="ac-backlink"><ArrowLeft size={15} /> My Demo Bookings</Link>
      <header className="ac-head ac-head-row">
        <div>
          <small className="ac-eyebrow">{EVENT.title}</small>
          <h1>{HEADLINES[lead.status]}</h1>
          <p><i className="dot" /> Live. This page updates as our team works on your request.</p>
        </div>
        <CustomerPill status={lead.status} />
      </header>

      <div className="ac-detail">
        <section className="ac-card">
          <h2>Every step</h2>
          <Timeline lead={lead} />
        </section>
        <aside className="ac-detail-side">
          {lead.slot && lead.status !== 'lost' && (
            <div className="ac-when">
              <small>{lead.status === 'demo-booked' || lead.status === 'won' ? 'Your demo' : 'Requested time'}</small>
              <b>{formatDate(lead.slot, lead.timeZone)}</b>
              <span>{formatTime(lead.slot, lead.timeZone)} – {formatTime(slotEnd(lead.slot), lead.timeZone)}</span>
              {meeting && lead.status === 'demo-booked' && <a href={meeting} target="_blank" rel="noreferrer" className="btn btn-light btn-sm"><Video size={15} /> Join the meeting</a>}
            </div>
          )}
          <dl className="ac-card ac-list">
            {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </aside>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className="ac-toast" role="status" initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 16, x: '-50%' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AccountLayout>
  );
}
