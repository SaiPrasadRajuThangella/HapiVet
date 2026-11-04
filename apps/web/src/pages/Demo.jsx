import { CircleCheckBig } from 'lucide-react';
import BookingWidget from '../components/BookingWidget';

// Same page as hapivet.com/demo.
const POINTS = [
  'Live walkthrough of HapiVet’s Clinic Copilot',
  'See how clinical, revenue, and ops actions are automated',
  'Personalized to your clinic’s size and workflow',
  'Led by founders or ex-practice managers',
];

export default function Demo() {
  return (
    <div className="bk-page">
      <header className="bk-hero">
        <span className="bk-pill">30-MINUTE SESSION</span>
        <h1>Book a Demo</h1>
        <p>See HapiVet in action with a walkthrough built around your practice.</p>
        <ul>
          {POINTS.map((t) => <li key={t}><CircleCheckBig size={18} />{t}</li>)}
        </ul>
      </header>
      <BookingWidget />
    </div>
  );
}
