import { CircleCheckBig } from 'lucide-react';
import BookingWidget from '../components/BookingWidget';

// Same content as hapivet.com/demo, in this site's colours.
const POINTS = [
  'Live walkthrough of HapiVet’s Clinic Copilot',
  'See how clinical, revenue, and ops actions are automated',
  'Personalized to your clinic’s size and workflow',
  'Led by founders or ex-practice managers',
];

export default function Demo() {
  return (
    <>
      <section className="page-hero bk-hero">
        <div className="container">
          <span className="bk-pill">30-MINUTE SESSION</span>
          <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Book a Demo</h1>
          <p className="lead">See HapiVet in action with a walkthrough built around your practice.</p>
          <ul>
            {POINTS.map((t) => <li key={t}><CircleCheckBig size={18} />{t}</li>)}
          </ul>
        </div>
      </section>
      <section className="bk-section">
        <BookingWidget />
      </section>
    </>
  );
}
