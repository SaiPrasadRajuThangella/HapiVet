import { motion } from 'framer-motion';
import { CalendarClock, CircleDollarSign, FileText, Plug } from 'lucide-react';
import { item, Reveal, SectionHead, Stagger } from '../components/ui';
import { DemoCTA } from '../sections/More';
import { unsplash } from '../lib/img';
import { useCollection } from '../lib/store';

const pillars = [
  [FileText, 'AI Documentation', 'Notes that write themselves. Less typing, less rework.'],
  [CalendarClock, 'Fast Scheduling', 'Team coordination that actually works at scale.'],
  [CircleDollarSign, 'Revenue in One Place', 'Billing, payments and analytics — unified.'],
  [Plug, 'Connected Integrations', 'Labs, payments and systems that talk to each other.'],
];

const principles = [
  ['Ship fast.', 'Legacy PMS moves at a glacial pace. We don’t.'],
  ['Speed matters.', 'Every click, every load, every workflow — faster.'],
  ['Practical over flashy.', 'Features that help today, not demos that impress once.'],
];

export default function About() {
  const team = useCollection('team');
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">The Clinic OS</span>
          <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>The operating system veterinary clinics deserve</h1>
          <p className="lead" style={{ color: 'var(--ink-2)' }}>Legacy PMS software is slow, fragmented and built for a different era. We’re building the fast, unified operating system that modern clinics need.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead eyebrow="The Team" title="Clinical + Product" text="Built at the intersection of what clinics need and what technology can deliver." />
          <Stagger className="team-grid">
            {team.map((m) => (
              <motion.article className="member" key={m._id} variants={item}>
                <img src={m.photo} alt={m.name} loading="lazy" decoding="async" />
                <div>
                  <h3 className="h3" style={{ fontSize: '1.1rem' }}>{m.name}</h3>
                  <small>{m.role}</small>
                  <p>{m.bio}</p>
                </div>
              </motion.article>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="split" y={48}>
            <div className="split-copy">
              <span className="eyebrow">Why We’re Building This</span>
              <h2 className="h2" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}>Legacy software wasn’t built for speed</h2>
              <p className="muted">Clinics are real-time operations: phone calls, triage, appointments, treatment plans, handoffs, follow-ups. Everything moves fast.</p>
              <p className="muted">But legacy PMS systems? Built decades ago. Slow to load. Fragmented across tools. Every click takes too long. Every workflow is disconnected.</p>
              <p className="muted">HapiVet is an operating system built for how clinics actually run — fast, unified, with AI that removes busywork instead of adding complexity.</p>
            </div>
            <div className="split-media">
              <img src={unsplash('1628009368231-7bb7cfcb0def', 1100)} alt="A person gently holding a tabby cat" loading="lazy" decoding="async" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead eyebrow="The Platform" title="One system. Everything connected." text="No more switching between five tools and two spreadsheets." />
          <Stagger className="platform-grid" gap={0.07}>
            {pillars.map(([Icon, t, d]) => (
              <motion.div className="p-card" key={t} variants={item}>
                <span className="ico"><Icon size={22} /></span>
                <h3 className="h3">{t}</h3>
                <p>{d}</p>
              </motion.div>
            ))}
            {principles.slice(0, 2).map(([t, d]) => (
              <motion.div className="p-card" key={t} variants={item} style={{ background: 'var(--navy)', color: '#fff' }}>
                <span className="eyebrow" style={{ color: 'var(--blue-soft)' }}>How we build</span>
                <h3 className="h3">{t}</h3>
                <p style={{ color: 'rgba(255,255,255,0.72)' }}>{d}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>
      <DemoCTA />
    </>
  );
}
