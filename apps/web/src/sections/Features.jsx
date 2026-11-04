import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { Reveal, SectionHead, Tick } from '../components/ui';
import { unsplash } from '../lib/img';
import { analyticsFeatures, copilotFeatures, opsFeatures, revenueFeatures } from '../data/seed';

const ease = [0.22, 1, 0.36, 1];
const SLIDE = 90;

const Bar = ({ h, peak, i }) => (
  <motion.i
    className={peak ? 'peak' : ''}
    style={{ height: `${h}%` }}
    initial={{ scaleY: 0 }}
    whileInView={{ scaleY: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.9, delay: i * 0.08, ease }}
  />
);

const Meter = ({ value }) => (
  <div className="meter">
    <motion.i style={{ width: `${value}%`, transformOrigin: 'left' }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease }} />
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

// Each id is also a link target: the nav's "/#copilot" style links scroll here and open that card.
const cards = [
  {
    id: 'operations',
    name: 'Operations Automation',
    title: 'Your clinic runs like clockwork',
    text: 'From staff scheduling to inventory tracking, automate the operational chaos that slows your team down. Built for multi-location management from day one.',
    features: opsFeatures,
    image: unsplash('1551601651-2a8555f1a136', 1100),
    alt: 'Surgical team working together in an operating room',
    mock: OpsMock,
  },
  {
    id: 'copilot',
    name: 'Agentic Clinic Copilot',
    title: 'Your AI co-pilot for every patient visit',
    text: 'The Clinical AI Copilot knows your entire product catalog, services and diagnostics. It analyzes symptoms in real time and suggests relevant items — you simply say yes or no.',
    features: copilotFeatures,
    image: unsplash('1576201836106-db1758fd1c97', 1100),
    alt: 'Golden retriever puppy running across a lawn',
    mock: CopilotMock,
  },
  {
    id: 'analytics',
    name: 'Instant Analytics',
    title: 'Reports that generate instantly',
    text: 'No more waiting 5 minutes for a report. Track time per patient, pet parent wait times, clinic capacity and historical utilization — all in real time.',
    features: analyticsFeatures,
    image: unsplash('1576091160399-112ba8d25d1d', 1100),
    alt: 'Clinician with a stethoscope using a smartphone',
    mock: AnalyticsMock,
  },
  {
    id: 'revenue',
    name: 'Revenue & Payments',
    title: 'Capture every dollar you’ve earned',
    text: 'Smart estimates, flexible payment options and revenue insights that help you understand client paying capacity and recover declined estimates.',
    features: revenueFeatures,
    image: unsplash('1563013544-824ae1b704d3', 1100),
    alt: 'A person holding a payment card while using a laptop',
    mock: RevenueMock,
  },
];

const box = (r) => ({ left: r.left, top: r.top, width: r.width, height: r.height });

export default function Features() {
  const [active, setActive] = useState(null);
  const [geo, setGeo] = useState(null);
  const { hash, key } = useLocation();
  const still = useReducedMotion();

  const stage = useRef(null);
  const gallery = useRef(null);
  const cardEls = useRef([]);
  const detailsEl = useRef(null);
  const detailsObserver = useRef(null);
  // Read by the image's variants when they run. An exiting image keeps the props of its last render,
  // so these have to be refs for it to know whether it is sliding away or shrinking back to its card.
  const openFrom = useRef(null);
  const closeTo = useRef(null);
  const direction = useRef(1);
  const activeRef = useRef(null);
  activeRef.current = active;
  const closeButton = useRef(null);
  const returnFocus = useRef(null);

  const measure = useCallback(() => {
    if (!stage.current || !gallery.current) return;
    const width = stage.current.offsetWidth;
    const stacked = window.matchMedia('(max-width: 1000px)').matches;
    const closedH = gallery.current.offsetHeight;
    const detailsH = detailsEl.current?.offsetHeight || 0;
    const imageH = stacked ? Math.round(Math.min(width * 0.62, 400)) : 0;
    const openH = stacked ? imageH + detailsH : Math.max(closedH, detailsH);
    setGeo((g) => (g && g.width === width && g.stacked === stacked && g.closedH === closedH && g.openH === openH && g.imageH === imageH
      ? g
      : { width, stacked, closedH, openH, imageH }));
  }, []);

  // The details change height from card to card, so they get their own observer while open.
  const setDetails = useCallback((el) => {
    detailsEl.current = el;
    detailsObserver.current?.disconnect();
    if (el) {
      detailsObserver.current = new ResizeObserver(measure);
      detailsObserver.current.observe(el);
    }
    measure();
  }, [measure]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, [measure]);

  const cardRect = (i) => {
    const c = cardEls.current[i].getBoundingClientRect();
    const s = stage.current.getBoundingClientRect();
    return { left: c.left - s.left, top: c.top - s.top, width: c.width, height: c.height };
  };

  const open = useCallback((i) => {
    openFrom.current = cardRect(i);
    closeTo.current = null;
    setActive(i);
    const r = stage.current.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight) stage.current.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  }, [still]);

  const go = useCallback((step) => {
    direction.current = step;
    openFrom.current = null;
    closeTo.current = null;
    setActive((i) => (i + step + cards.length) % cards.length);
  }, []);

  const close = useCallback(() => {
    if (activeRef.current === null) return;
    returnFocus.current = activeRef.current;
    closeTo.current = cardRect(activeRef.current);
    setActive(null);
  }, []);

  // Keyboard focus moves into the details on open, and back to the card once the gallery is usable.
  useEffect(() => {
    if (active !== null) {
      if (closeButton.current && closeButton.current !== document.activeElement) closeButton.current.focus({ preventScroll: true });
    } else if (returnFocus.current !== null) {
      cardEls.current[returnFocus.current].focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [active === null]);

  useEffect(() => {
    if (active === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active === null, go, close]);

  // Opens the card a "/#copilot" style link points to.
  useEffect(() => {
    const i = cards.findIndex((c) => `#${c.id}` === hash);
    if (i >= 0) open(i);
  }, [hash, key, open]);

  const isOpen = active !== null;
  const card = isOpen ? cards[active] : null;
  const next = isOpen ? cards[(active + 1) % cards.length] : null;
  const target = geo && (geo.stacked
    ? { left: 0, top: 0, width: geo.width, height: geo.imageH }
    : { left: 0, top: 0, width: geo.width * 0.52, height: geo.openH });

  const motionTime = still ? { duration: 0 } : { duration: 0.7, ease };

  const heroVariants = target && {
    enter: () => (openFrom.current
      ? { ...box(openFrom.current), x: 0, opacity: 1, filter: 'blur(0px)' }
      : { ...box(target), x: SLIDE * direction.current, opacity: 0, filter: 'blur(14px)' }),
    center: { ...box(target), x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: () => (closeTo.current
      ? { ...box(closeTo.current), x: 0, opacity: 1, filter: 'blur(0px)' }
      : { ...box(target), x: -SLIDE * direction.current, opacity: 0, filter: 'blur(14px)' }),
  };
  // The card's own title stays on the image at the start of opening and the end of closing, so it
  // fades rather than blinking off when the image lifts from or lands on the card underneath.
  const capVariants = {
    enter: () => ({ opacity: openFrom.current ? 1 : 0 }),
    center: { opacity: 0, transition: { duration: 0.3 } },
    exit: () => ({ opacity: closeTo.current ? 1 : 0, transition: { duration: 0.3, delay: closeTo.current ? 0.35 : 0 } }),
  };
  const mockVariants = {
    enter: { opacity: 0, y: 26 },
    center: { opacity: 1, y: 0, transition: { duration: 0.5, delay: still ? 0 : 0.35, ease } },
    exit: { opacity: 0, transition: { duration: 0.12 } },
  };

  const stageHeight = geo ? (isOpen ? geo.openH : geo.closedH) : undefined;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead
          eyebrow="The Platform"
          title="One system. Everything connected."
          text="No more switching between five tools and two spreadsheets."
        />
        <Reveal y={48}>
          <div
            ref={stage}
            className={`fx-stage${isOpen ? ' open' : ''}`}
            style={{ height: stageHeight, '--fx-image-h': `${geo?.imageH || 0}px` }}
          >
            <div className="fx-gallery" ref={gallery} inert={isOpen ? '' : undefined}>
              {cards.map((c, i) => (
                <button
                  type="button"
                  key={c.id}
                  id={c.id}
                  className="fx-card"
                  ref={(el) => { cardEls.current[i] = el; }}
                  aria-expanded={active === i}
                  aria-controls="fx-details"
                  onClick={() => open(i)}
                >
                  <img src={c.image} alt={c.alt} loading="lazy" decoding="async" />
                  <span className="fx-cap">{c.name}</span>
                </button>
              ))}
            </div>

            <div className="fx-panel" />

            <div className="fx-clip">
              <AnimatePresence initial={false}>
                {isOpen && target && (
                  <motion.div
                    key={card.id}
                    className="fx-hero"
                    variants={heroVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={motionTime}
                  >
                    {/* Decodes before painting so the image never flashes blank as it lifts off its card. */}
                    <img src={card.image} alt={card.alt} decoding="sync" />
                    <motion.div className="mock fx-mock" variants={mockVariants}>{card.mock}</motion.div>
                    <motion.span className="fx-cap" variants={capVariants} aria-hidden="true">{card.name}</motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="details"
                  id="fx-details"
                  className="fx-details"
                  ref={setDetails}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.4, delay: still ? 0 : 0.2 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                >
                  <button type="button" className="round-btn fx-close" ref={closeButton} aria-label="Back to all cards" onClick={close}><X size={18} /></button>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={card.id}
                      className="fx-copy"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease } }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.14 } }}
                    >
                      <span className="eyebrow">{card.name}</span>
                      <h3 className="h2 fx-title">{card.title}</h3>
                      <p className="muted fx-text">{card.text}</p>
                      <div className="mock fx-mock-inline">{card.mock}</div>
                      <ul className="feat-list fx-list">
                        {card.features.map(([f, d]) => (
                          <li key={f}><Tick /><div><b>{f}</b><span>{d}</span></div></li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>

                  <div className="fx-nav">
                    <div className="fx-arrows">
                      <button type="button" className="round-btn" aria-label="Previous card" onClick={() => go(-1)}><ArrowLeft size={18} /></button>
                      <span>{active + 1} / {cards.length}</span>
                      <button type="button" className="round-btn" aria-label={`Next card: ${next.name}`} onClick={() => go(1)}><ArrowRight size={18} /></button>
                    </div>
                    <button type="button" className="fx-next" onClick={() => go(1)}>Next: {next.name}</button>
                    <Link to="/demo" className="btn btn-dark btn-sm">Book a demo <ArrowRight size={15} /></Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
