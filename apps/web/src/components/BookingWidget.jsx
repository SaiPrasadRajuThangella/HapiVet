// The booking flow from hapivet.com/demo: pick a day and time, fill in the same form, see it confirmed.
// The live site embeds Cal.com for this; here a booking also becomes a lead in the admin panel.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Globe, Link2, Plus, UserPlus, X } from 'lucide-react';
import PhoneInput from './PhoneInput';
import { db, useCollection, useUser } from '../lib/store';
import { digitsOnly, isValidNumber, splitPhone } from '../lib/phone';
import {
  EVENT, MIN_NOTICE_MS, addMonths, allZones, browserZone, dayHeading, dayKey, formatDate, formatTime,
  monthCells, monthOf, slotEnd, useMonthSlots, zoneName,
} from '../lib/slots';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const ICON = 'https://hapivet.com/favicon.png';
const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v.trim());

// "Tuesday, December 22, 2026" and "11:00pm – 11:30pm". A slot that crosses midnight names both days.
function slotLines(slot, zone) {
  const end = slotEnd(slot);
  const range = `${formatTime(slot, zone)} – ${formatTime(end, zone)}`;
  if (dayKey(slot, zone) === dayKey(end, zone)) return [formatDate(slot, zone), range];
  return [`${formatDate(slot, zone)} – ${formatDate(end, zone)}`, range];
}

function EventInfo({ slot, zone, onZone }) {
  const zones = useMemo(() => {
    const all = allZones();
    return all.includes(zone) ? all : [zone, ...all];
  }, [zone]);
  return (
    <div className="bk-info">
      <img className="bk-logo" src={ICON} alt="" width="28" height="28" />
      <span className="bk-team">{EVENT.team}</span>
      <h2>{EVENT.title}</h2>
      <p>{EVENT.description}</p>
      <ul>
        {slot && <li><CalendarDays size={16} /><span>{slotLines(slot, zone).map((l) => <span key={l} className="bk-line">{l}</span>)}</span></li>}
        <li><Clock size={16} /><span>{EVENT.minutes}m</span></li>
        <li><Link2 size={16} /><span>{EVENT.location}</span></li>
        <li>
          <Globe size={16} />
          {onZone ? (
            <select className="bk-zone" aria-label="Time zone" value={zone} onChange={(e) => onZone(e.target.value)}>
              {zones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          ) : <span>{zone}</span>}
        </li>
      </ul>
    </div>
  );
}

function MonthGrid({ month, days, day, today, canGoBack, onMonth, onDay }) {
  const [year, monthNumber] = month.split('-').map(Number);
  const name = new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  return (
    <div className="bk-month">
      <div className="bk-month-head">
        <h3><b>{name}</b> {year}</h3>
        <div>
          <button type="button" aria-label="View previous month" disabled={!canGoBack} onClick={() => onMonth(-1)}><ChevronLeft size={18} /></button>
          <button type="button" aria-label="View next month" onClick={() => onMonth(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="bk-grid" aria-hidden="true">
        {WEEKDAYS.map((d) => <span key={d} className="bk-weekday">{d}</span>)}
      </div>
      <div className="bk-grid">
        {monthCells(month).map((key, i) => {
          if (!key) return <span key={`blank-${i}`} />;
          const open = !!days?.[key];
          return (
            <button
              key={key}
              type="button"
              className={`bk-day${open ? ' open' : ''}${key === day ? ' on' : ''}${!days ? ' loading' : ''}`}
              disabled={!open}
              aria-pressed={key === day}
              aria-label={new Date(`${key}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
              onClick={() => onDay(key)}
            >
              {Number(key.slice(-2))}
              {key === today && <i />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeList({ days, day, zone, hour12, onHour12, onSlot, onNextMonth }) {
  const heading = day ? dayHeading(day) : null;
  return (
    <div className="bk-times">
      <div className="bk-times-head">
        <h3>{heading ? <><b>{heading.weekday}</b> {heading.day}</> : ' '}</h3>
        <div className="bk-toggle" role="group" aria-label="Time format">
          <button type="button" className={hour12 ? 'on' : ''} aria-pressed={hour12} onClick={() => onHour12(true)}>12h</button>
          <button type="button" className={hour12 ? '' : 'on'} aria-pressed={!hour12} onClick={() => onHour12(false)}>24h</button>
        </div>
      </div>
      {!days && <div className="bk-slots" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="bk-slot-skel" />)}</div>}
      {days && !day && (
        <div className="bk-none">
          <p>No available times this month.</p>
          <button type="button" onClick={onNextMonth}>View next month</button>
        </div>
      )}
      {days && day && (
        // Scrolls on its own, so the smooth page scroll has to leave it alone.
        <div className="bk-slots" data-lenis-prevent>
          {days[day].map((iso) => <button key={iso} type="button" className="bk-slot" onClick={() => onSlot(iso)}>{formatTime(iso, zone, hour12)}</button>)}
        </div>
      )}
    </div>
  );
}

function Field({ id, label, required, error, children, ...input }) {
  return (
    <div className="bk-field">
      <label htmlFor={id}>{label}{required && <em> *</em>}</label>
      {children || <input id={id} aria-invalid={!!error} {...input} />}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}

function DetailsForm({ slot, zone, onBack, onBooked }) {
  const user = useUser();
  const leads = useCollection('leads');
  const [form, setForm] = useState(() => {
    const { dial, number } = splitPhone(user?.phone);
    return { name: user?.name ?? '', email: user?.email ?? '', dial, number, company: '', jobTitle: '', city: '' };
  });
  const [guests, setGuests] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    const number = digitsOnly(form.number);
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!isEmail(form.email)) next.email = 'Please enter a valid email address';
    if (number && !isValidNumber(number)) next.number = 'Please enter a valid phone number';
    if (!form.company.trim()) next.company = 'Please enter your practice or company name';
    if (!form.jobTitle.trim()) next.jobTitle = 'Please enter your job title';
    if (!form.city.trim()) next.city = 'Please enter your city and state';
    const invited = guests.map((g) => g.trim()).filter(Boolean);
    if (invited.some((g) => !isEmail(g))) next.guests = 'Please check the guest email addresses';
    if (leads.some((l) => l.slot === slot && l.status !== 'lost')) next.slot = 'Someone just took this time. Please go back and pick another.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const at = new Date().toISOString();
    onBooked(db.create('leads', {
      type: 'demo',
      status: 'new',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: number ? `${form.dial}${number}` : '',
      clinic: form.company.trim(),
      jobTitle: form.jobTitle.trim(),
      city: form.city.trim(),
      guests: invited,
      slot,
      timeZone: zone,
      message: '',
      ...(user ? { userPhone: user.phone } : {}),
      history: [{ status: 'new', at }],
    }));
  };

  return (
    <form className="bk-form" onSubmit={submit} noValidate>
      <Field id="bk-name" label="Your name" required error={errors.name} value={form.name} onChange={set('name')} autoComplete="name" />
      <Field id="bk-email" label="Email address" required error={errors.email} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
      <Field label="Phone number" id="bk-phone" error={errors.number}>
        <PhoneInput id="bk-phone" dial={form.dial} number={form.number} invalid={!!errors.number} onDial={(dial) => setForm((f) => ({ ...f, dial }))} onNumber={(number) => setForm((f) => ({ ...f, number }))} />
      </Field>
      <Field id="bk-company" label="Practice/Company Name" required error={errors.company} placeholder="XYZ Animal Hospital" value={form.company} onChange={set('company')} autoComplete="organization" />
      <Field id="bk-title" label="Job Title" required error={errors.jobTitle} placeholder="Practice Manager" value={form.jobTitle} onChange={set('jobTitle')} autoComplete="organization-title" />
      <Field id="bk-city" label="City/State" required error={errors.city} placeholder="Los Angeles, CA" value={form.city} onChange={set('city')} autoComplete="address-level2" />
      {guests.length > 0 && (
        <div className="bk-field">
          <label htmlFor="bk-guest-0">Add guests</label>
          {guests.map((g, i) => (
            <div className="bk-guest" key={i}>
              <input id={`bk-guest-${i}`} type="email" placeholder="Email" aria-label={`Guest ${i + 1} email`} value={g} onChange={(e) => setGuests((all) => all.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" aria-label={`Remove guest ${i + 1}`} onClick={() => setGuests((all) => all.filter((_, j) => j !== i))}><X size={15} /></button>
            </div>
          ))}
          {errors.guests && <small role="alert">{errors.guests}</small>}
        </div>
      )}
      <button type="button" className="bk-add" onClick={() => setGuests((all) => [...all, ''])}>
        {guests.length ? <Plus size={15} /> : <UserPlus size={15} />} {guests.length ? 'Add another' : 'Add guests'}
      </button>
      {errors.slot && <small className="bk-form-error" role="alert">{errors.slot}</small>}
      <div className="bk-form-foot">
        <button type="button" className="bk-back" onClick={onBack}>Back</button>
        <button type="submit" className="bk-confirm">Confirm</button>
      </div>
    </form>
  );
}

function Confirmed({ lead, zone }) {
  const user = useUser();
  const rows = [
    ['What', `${EVENT.title} between ${EVENT.team} and ${lead.name}`],
    ['When', slotLines(lead.slot, zone).concat(`(${zoneName(zone)})`)],
    ['Who', [lead.name, lead.email]],
    ['Where', EVENT.location],
    ['Practice/Company Name', lead.clinic],
    ['Job Title', lead.jobTitle],
    ['City/State', lead.city],
    ...(lead.guests?.length ? [['Guests', lead.guests]] : []),
  ];
  return (
    <div className="bk-done">
      <span className="bk-done-tick"><Check size={22} strokeWidth={3} /></span>
      <h2>This meeting is scheduled</h2>
      <p>Your request is with the HapiVet team. You can follow every step from My Demo Bookings.</p>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{[].concat(value).map((v) => <span key={v}>{v}</span>)}</dd>
          </div>
        ))}
      </dl>
      {user
        ? <Link className="bk-confirm" to={`/my-bookings/${lead._id}`}>Track this booking</Link>
        : <Link className="bk-confirm" to={`/login?next=/my-bookings/${lead._id}`} state={{ claim: lead._id }}>Sign in to track this booking</Link>}
    </div>
  );
}

export default function BookingWidget() {
  const leads = useCollection('leads');
  const [zone, setZone] = useState(browserZone);
  const [month, setMonth] = useState(() => monthOf(Date.now(), browserZone()));
  const [picked, setPicked] = useState(null);
  const [hour12, setHour12] = useState(true);
  const [slot, setSlot] = useState(null);
  const [booked, setBooked] = useState(null);

  const slots = useMonthSlots(month, zone);
  const thisMonth = monthOf(Date.now(), zone);

  // Cal.com doesn't know about bookings made here, so those times are taken out on this side.
  const days = useMemo(() => {
    if (!slots) return null;
    const taken = new Set(leads.filter((l) => l.slot && l.status !== 'lost').map((l) => l.slot));
    const earliest = Date.now() + MIN_NOTICE_MS;
    const open = {};
    Object.entries(slots).forEach(([key, times]) => {
      const free = times.filter((t) => !taken.has(t) && new Date(t).getTime() >= earliest);
      if (free.length) open[key] = free;
    });
    return open;
  }, [slots, leads]);

  // Like the live calendar, the first open day of the month is selected until another is picked.
  const firstOpen = days ? Object.keys(days).sort()[0] : null;
  const day = days?.[picked] ? picked : firstOpen;

  const step = booked ? 'done' : slot ? 'form' : 'pick';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        className={`bk bk-step-${step}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {step === 'pick' && (
          <>
            <EventInfo zone={zone} onZone={setZone} />
            <MonthGrid
              month={month}
              days={days}
              day={day}
              today={dayKey(Date.now(), zone)}
              canGoBack={month > thisMonth}
              onMonth={(n) => { setMonth(addMonths(month, n)); setPicked(null); }}
              onDay={setPicked}
            />
            <TimeList days={days} day={day} zone={zone} hour12={hour12} onHour12={setHour12} onSlot={setSlot} onNextMonth={() => setMonth(addMonths(month, 1))} />
          </>
        )}
        {step === 'form' && (
          <>
            <EventInfo slot={slot} zone={zone} />
            <DetailsForm slot={slot} zone={zone} onBack={() => setSlot(null)} onBooked={setBooked} />
          </>
        )}
        {step === 'done' && <Confirmed lead={booked} zone={zone} />}
      </motion.div>
    </AnimatePresence>
  );
}
