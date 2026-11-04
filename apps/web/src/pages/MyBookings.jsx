import { Link } from 'react-router-dom';
import { ArrowRight, CalendarPlus, ChevronRight } from 'lucide-react';
import { AccountLayout } from '../components/Account';
import { useUser } from '../lib/store';
import { customerLabel, reachedStage, STAGES, useMyBookings } from '../lib/leads';
import { EVENT, formatShortDate, formatTime } from '../lib/slots';

export const CustomerPill = ({ status }) => <span className={`ac-pill s-${status}`}>{customerLabel(status)}</span>;

// Thin segmented bar with a label under each step.
export function Progress({ lead }) {
  const reached = STAGES.indexOf(reachedStage(lead));
  return (
    <ol className="ac-progress">
      {STAGES.map((s, i) => (
        <li key={s} className={i <= reached ? 'done' : ''} aria-current={i === reached ? 'step' : undefined}>
          <i />
          <span>{customerLabel(s)}</span>
        </li>
      ))}
    </ol>
  );
}

function BookingCard({ lead }) {
  return (
    <Link to={`/my-bookings/${lead._id}`} className="ac-card ac-booking">
      <div className="ac-booking-top">
        <div>
          <small>{EVENT.title}</small>
          <h3>{lead.slot ? `${formatShortDate(lead.slot, lead.timeZone)}, ${formatTime(lead.slot, lead.timeZone)}` : 'Time to be confirmed'}</h3>
          <p className="muted">{lead.clinic}</p>
        </div>
        <CustomerPill status={lead.status} />
      </div>
      {lead.status !== 'lost' && <Progress lead={lead} />}
      <span className="ac-more">See every step <ChevronRight size={16} /></span>
    </Link>
  );
}

export default function MyBookings() {
  const user = useUser();
  const bookings = useMyBookings(user);
  const sorted = [...bookings].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const active = sorted.filter((b) => b.status !== 'won' && b.status !== 'lost');
  const past = sorted.filter((b) => b.status === 'won' || b.status === 'lost');

  return (
    <AccountLayout>
      <header className="ac-head ac-head-row">
        <div>
          <h1>My Demo Bookings</h1>
          <p><i className="dot" /> Updates here as our team works on your request.</p>
        </div>
        {sorted.length > 0 && <Link to="/demo" className="btn btn-dark btn-sm">Book another demo</Link>}
      </header>
      {sorted.length === 0 ? (
        <div className="ac-card ac-empty">
          <span><CalendarPlus size={26} /></span>
          <h3>No demo bookings yet</h3>
          <p className="muted">Pick a time that suits you and it shows up here, with every step as it happens.</p>
          <Link to="/demo" className="btn btn-dark btn-sm">Book a Demo <ArrowRight size={15} /></Link>
        </div>
      ) : (
        <>
          {active.length > 0 && <section className="ac-group"><h2>In progress <span>{active.length}</span></h2>{active.map((b) => <BookingCard key={b._id} lead={b} />)}</section>}
          {past.length > 0 && <section className="ac-group"><h2>Past <span>{past.length}</span></h2>{past.map((b) => <BookingCard key={b._id} lead={b} />)}</section>}
        </>
      )}
    </AccountLayout>
  );
}
