import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Reveal, Tick } from '../components/ui';
import { unsplash } from '../lib/img';
import { analyticsFeatures, copilotFeatures, opsFeatures, revenueFeatures } from '../data/seed';

function Split({ id, eyebrow, title, text, features, image, alt, mock, reverse }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);
  const mockY = useTransform(scrollYProgress, [0, 1], [46, -46]);

  return (
    <Reveal id={id} className={`split${reverse ? ' reverse' : ''}`} y={48} style={{ scrollMarginTop: 90 }}>
      <div className="split-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h2" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)' }}>{title}</h2>
        <p className="muted">{text}</p>
        <ul className="feat-list">
          {features.map(([f, d]) => (
            <li key={f}><Tick /><div><b>{f}</b><span>{d}</span></div></li>
          ))}
        </ul>
        <Link to="/demo" className="btn btn-ghost" style={{ justifySelf: 'start', alignSelf: 'start' }}>Book a demo <ArrowRight size={16} /></Link>
      </div>
      <div className="split-media" ref={ref}>
        <motion.img src={image} alt={alt} loading="lazy" decoding="async" style={{ y: imgY, scale: 1.16 }} />
        <motion.div className="mock" style={{ y: mockY }}>{mock}</motion.div>
      </div>
    </Reveal>
  );
}

const Bar = ({ h, peak, i }) => (
  <motion.i
    className={peak ? 'peak' : ''}
    style={{ height: `${h}%` }}
    initial={{ scaleY: 0 }}
    whileInView={{ scaleY: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
  />
);

const Meter = ({ value }) => (
  <div className="meter">
    <motion.i style={{ width: `${value}%`, transformOrigin: 'left' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
  </div>
);

const OpsMock = (
  <>
    <div className="mock-head">Operations Dashboard <small>Today</small></div>
    <div className="mock-kpis">
      {[['8', 'Staff On-Duty'], ['12', 'Tasks Pending'], ['3', 'Low Stock Items'], ['15', 'Labs Complete']].map(([v, l]) => (
        <div className="mock-kpi" key={l}><b>{v}</b><span>{l}</span></div>
      ))}
    </div>
    {['Restock exam room supplies', 'Review lab results for Charlie', 'Follow up with pet owner - Bella'].map((t, i) => (
      <div className="mock-row" key={t}>{t}{i === 0 && <Check size={16} className="chk" />}</div>
    ))}
  </>
);

const CopilotMock = (
  <>
    <div className="mock-head">Max · Golden Retriever <small><Sparkles size={13} /> Copilot Active</small></div>
    <span style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>5 years · Male · 72 lbs — AI suggestions based on symptoms</span>
    <div className="sugg"><div><b>Complete Blood Panel</b><small>Appetite loss evaluation</small></div><span className="price">$145.00</span></div>
    <div className="sugg"><div><b>Cerenia 24mg</b><small>Anti-nausea (5 tablets)</small></div><span className="price">$48.50</span></div>
    <div className="sugg added"><div><b>Subcutaneous Fluids</b><small>Added to invoice</small></div><span className="price">$35.00 ✓</span></div>
    <span style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>3 suggestions · Vet has full control</span>
  </>
);

const AnalyticsMock = (
  <>
    <div className="mock-head">Clinic Analytics <small>Instant</small></div>
    <div className="mock-kpis">
      <div className="mock-kpi"><b>18 min</b><span>Avg time per patient</span></div>
      <div className="mock-kpi"><b>8 min</b><span>Avg wait time</span></div>
    </div>
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capacity utilization</span><b>78%</b></div>
      <Meter value={78} />
    </div>
    <div>
      <div className="bars">{[62, 74, 92, 70, 66].map((h, i) => <Bar key={i} h={h} i={i} peak={h === 92} />)}</div>
      <div className="bar-labels">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => <span key={d}>{d}</span>)}</div>
    </div>
    <span style={{ color: 'var(--gray-500)', fontSize: 12.5 }}>Peak: Wednesdays (92%) — consider adding staff</span>
  </>
);

const RevenueMock = (
  <>
    <div className="mock-head">Revenue Analytics <small>This Month</small></div>
    <div className="mock-kpis">
      <div className="mock-kpi"><b>$127,450</b><span>Total · ↑ 12%</span></div>
      <div className="mock-kpi"><b>$285</b><span>Avg per visit · ↑ 8%</span></div>
    </div>
    {[['Card Payments', '$98,200', 77], ['Split Payments', '$18,350', 14], ['Declined Estimates', '$10,900', 9]].map(([l, v, p]) => (
      <div key={l} style={{ display: 'grid', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{l}</span><b>{v}</b></div>
        <Meter value={p} />
      </div>
    ))}
  </>
);

export default function Features() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container split-wrap">
        <Split
          id="operations"
          eyebrow="Operations Automation"
          title="Your clinic runs like clockwork"
          text="From staff scheduling to inventory tracking, automate the operational chaos that slows your team down. Built for multi-location management from day one."
          features={opsFeatures.slice(0, 4)}
          image={unsplash('1551601651-2a8555f1a136', 1100)}
          alt="Surgical team working together in an operating room"
          mock={OpsMock}
        />
        <Split
          id="copilot"
          reverse
          eyebrow="Agentic Clinic Copilot"
          title="Your AI co-pilot for every patient visit"
          text="The Clinical AI Copilot knows your entire product catalog, services and diagnostics. It analyzes symptoms in real time and suggests relevant items — you simply say yes or no."
          features={copilotFeatures.slice(0, 4)}
          image={unsplash('1576201836106-db1758fd1c97', 1100)}
          alt="Golden retriever puppy running across a lawn"
          mock={CopilotMock}
        />
        <Split
          id="analytics"
          eyebrow="Instant Analytics"
          title="Reports that generate instantly"
          text="No more waiting 5 minutes for a report. Track time per patient, pet parent wait times, clinic capacity and historical utilization — all in real time."
          features={analyticsFeatures.slice(0, 4)}
          image={unsplash('1576091160399-112ba8d25d1d', 1100)}
          alt="Clinician with a stethoscope using a smartphone"
          mock={AnalyticsMock}
        />
        <Split
          id="revenue"
          reverse
          eyebrow="Revenue & Payments"
          title="Capture every dollar you’ve earned"
          text="Smart estimates, flexible payment options and revenue insights that help you understand client paying capacity and recover declined estimates."
          features={revenueFeatures}
          image={unsplash('1450778869180-41d0601e046e', 1100)}
          alt="A cat and a dog resting together"
          mock={RevenueMock}
        />
      </div>
    </section>
  );
}
