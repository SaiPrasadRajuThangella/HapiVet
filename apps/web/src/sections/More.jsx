import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Check, Clock, MessagesSquare, Minus, Stethoscope, X } from 'lucide-react';
import { Counter, icons, item, Marquee, Reveal, SectionHead, Stagger, Tick } from '../components/ui';
import { unsplash } from '../lib/img';
import { useCollection } from '../lib/store';
import { clinicNames, compareRows, integrations, onboarding, partners, platform, whyPoints } from '../data/seed';

export function Trust() {
  const half = Math.ceil(clinicNames.length / 2);
  const row = (names) => names.map((n) => (
    <span className="logo-chip" key={n}><Stethoscope size={15} />{n}</span>
  ));
  return (
    <section className="trust">
      <p>TRUSTED BY VETERINARY CLINICS ACROSS THE US</p>
      <div style={{ display: 'grid', gap: 14 }}>
        <Marquee>{row(clinicNames.slice(0, half))}</Marquee>
        <Marquee reverse>{row(clinicNames.slice(half))}</Marquee>
      </div>
    </section>
  );
}

export function Platform() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="Platform Architecture"
          title="Built for scale. Designed for trust."
          text="An AI-native platform with modern architecture that grows with your practice — from single clinic to multi-location enterprise."
        />
        <Stagger className="platform-grid">
          {platform.map(([title, text, icon]) => {
            const Icon = icons[icon];
            return (
              <motion.div className="p-card" key={title} variants={item}>
                <span className="ico"><Icon size={22} /></span>
                <h3 className="h3">{title}</h3>
                <p>{text}</p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

function Quotes() {
  const all = useCollection('testimonials');
  const list = all.filter((t) => t.published);
  const [i, setI] = useState(0);
  const count = list.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;
  const q = list[i % count];
  const initials = q.name.replace(/^Dr\.?\s*/, '').split(/[\s,]+/).slice(0, 2).map((s) => s[0]).join('');
  const metrics = [q.metricA, q.metricB].filter(Boolean).map((m) => m.split('|'));

  return (
    <Reveal className="quote-card">
      <AnimatePresence mode="wait">
        <motion.div
          key={q._id}
          initial={{ opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -26 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'grid', gap: 24 }}
        >
          <blockquote>“{q.quote}”</blockquote>
          <div className="quote-by">
            <span className="avatar">{initials}</span>
            <div><b>{q.name}</b><small>{q.role}</small></div>
          </div>
          {metrics.length > 0 && (
            <div className="quote-metrics">
              {metrics.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {count > 1 && (
        <div className="quote-dots">
          {list.map((t, n) => (
            <button key={t._id} className={n === i % count ? 'on' : ''} aria-label={`Show testimonial ${n + 1}`} onClick={() => setI(n)} />
          ))}
        </div>
      )}
    </Reveal>
  );
}

export function Why() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="dark-band" y={48}>
          <div className="why-grid">
            <div>
              <span className="eyebrow" style={{ color: 'var(--blue-soft)' }}>Why HapiVet</span>
              <h2 className="h2" style={{ marginTop: 14 }}>Built by veterinarians, for veterinarians</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16 }}>
                We didn’t build another generic practice management system. We built the tool we wished existed — designed around real clinic workflows with input from practicing US veterinarians.
              </p>
              <div className="why-list">
                {whyPoints.map(([t, d]) => (
                  <div key={t}><Check size={20} /><p><b>{t}</b><span>{d}</span></p></div>
                ))}
              </div>
            </div>
            <Quotes />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Integrations() {
  const copy = {
    'Lab & Diagnostic Providers': 'Direct integration with leading veterinary lab platforms for seamless order submission and result retrieval.',
    'Payment Processors': 'Accept payments with our preferred partner Worldpay. Low transaction fees and instant reconciliation.',
    'PMS Data Migration': 'Migrating from another system? We handle the heavy lifting to transfer your records safely.',
  };
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="Integrations"
          title="Works with tools you already use"
          text="Connect HapiVet with your existing lab providers, payment processors and more. Plus, migrate data seamlessly from your current PMS."
        />
        <Stagger className="int-grid">
          {integrations.map((g) => (
            <motion.div className="int-card" key={g.group} variants={item}>
              <h3 className="h3">{g.group}</h3>
              <p>{copy[g.group]}</p>
              <div className="chips">{g.items.map((c) => <span className="chip" key={c}>{c}</span>)}</div>
            </motion.div>
          ))}
        </Stagger>
        <Stagger className="partner-row">
          {partners.map(([p, t]) => (
            <motion.div className="partner" key={p} variants={item}><b>{p}</b><span>{t}</span></motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

const Mark = ({ value }) => {
  if (value === 'yes') return <Check size={19} strokeWidth={2.6} className="yes" aria-label="Yes" />;
  if (value === 'partial') return <Minus size={19} strokeWidth={2.6} className="partial" aria-label="Partial" />;
  return <X size={19} className="no" aria-label="No" />;
};

export function Compare() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="Agentic PIMS"
          title="How HapiVet is different"
          text="Legacy systems weren’t built for AI. Point solutions create fragmentation. HapiVet is the first truly Agentic PIMS — four AI agents working as one intelligent system."
        />
        <Reveal className="table-wrap">
          <table className="cmp">
            <thead>
              <tr><th scope="col">Feature</th><th scope="col" className="hl">HapiVet AI</th><th scope="col">Legacy PMS</th><th scope="col">Point Solutions</th></tr>
            </thead>
            <tbody>
              {compareRows.map(([label, a, b, c]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="hl"><Mark value={a} /></td>
                  <td><Mark value={b} /></td>
                  <td><Mark value={c} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <div className="cmp cmp-legend" style={{ minWidth: 0 }}>
          <span><Mark value="yes" /> Yes</span>
          <span><Mark value="partial" /> Partial</span>
          <span><Mark value="no" /> No</span>
        </div>
      </div>
    </section>
  );
}

export function Onboarding() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const rows = [['Patient Records', 100], ['Client Data', 100], ['Appointment History', 78], ['Inventory & Products', 0]];
  return (
    <section className="section" id="onboarding" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="Onboarding"
          title="Go live in weeks, not months"
          text="Our dedicated migration team handles the heavy lifting. From data migration to team training, we ensure a smooth transition."
        />
        <div className="steps" ref={ref}>
          <div className="progress-line"><motion.i style={{ scaleX }} /></div>
          {onboarding.map((s, i) => (
            <Reveal className="step" key={s.title} delay={i * 0.1}>
              <span className="num">{i + 1}</span>
              <small>{s.week}</small>
              <h3 className="h3">{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="migrate">
          <Reveal className="migrate-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 650 }}><span>Migration Progress</span><small style={{ color: 'var(--blue-soft)' }}>In Progress</small></div>
            {rows.map(([l, v]) => (
              <div className="m-row" key={l}>
                <div><span>{l}</span><span>{v ? `${v}%` : 'Pending'}</span></div>
                <div className="meter">
                  <motion.i style={{ width: `${v}%`, transformOrigin: 'left' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
            ))}
            <small style={{ color: 'rgba(255,255,255,0.65)' }}>Estimated completion: 2 days</small>
          </Reveal>
          <Reveal className="acc-card" delay={0.1}>
            <b><Counter to={98} suffix="%" /></b>
            <span className="muted">Data Accuracy</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FeatureRequests() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <Reveal className="req-banner">
          <div style={{ display: 'grid', gap: 12 }}>
            <span className="eyebrow">Feature Requests</span>
            <h2 className="h2" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>We want HapiVet to be yours</h2>
            <p className="muted">We guarantee to implement and push your feature request in 4-8 weeks, working closely with you — if we deem it right for the product.</p>
            <Link to="/contact" className="btn btn-dark" style={{ justifySelf: 'start', marginTop: 6 }}>Request a Feature <ArrowRight size={16} /></Link>
          </div>
          <ul>
            <li><Clock size={19} /> 4-8 week turnaround on approved features</li>
            <li><MessagesSquare size={19} /> Direct collaboration with our team</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function DemoCTA() {
  return (
    <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="container">
        <Reveal className="cta" y={48}>
          <img src={unsplash('1530281700549-e82e7bf110d6', 1500)} alt="" loading="lazy" decoding="async" />
          <span className="eyebrow" style={{ color: 'var(--blue-mist)' }}>Get a Personalized Demo</span>
          <h2 className="h2" style={{ marginTop: 14 }}>See HapiVet run your clinic</h2>
          <p className="lead">Book a live demo with a real practice manager who uses HapiVet daily. They’ll show you exactly how it fits your workflow — no sales pitch, just real answers.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/demo" className="btn btn-light btn-lg">Book Demo <ArrowRight size={17} /></Link>
            <Link to="/contact" className="btn btn-lg" style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' }}>Contact Us</Link>
          </div>
          <div className="cta-checks">
            {['Real practice managers, not sales reps', 'No credit card required', '30-minute personalized walkthrough'].map((t) => (
              <span key={t}><Tick size={16} />{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
