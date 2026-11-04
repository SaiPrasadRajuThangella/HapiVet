import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { item, Reveal, SectionHead, Stagger, Tick } from '../components/ui';
import { DemoCTA } from '../sections/More';
import { faqs } from '../data/seed';
import { useCollection } from '../lib/store';

const YEARLY_DISCOUNT = 0.15;

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {q}
        <motion.span animate={{ rotate: open ? 45 : 0 }} style={{ display: 'grid' }}><Plus size={20} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <p className="faq-a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Pricing() {
  const plans = useCollection('plans');
  const [yearly, setYearly] = useState(false);
  const display = (p) => (yearly ? Math.round(p * (1 - YEARLY_DISCOUNT)) : p);

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 110 }}>
        <div className="container">
          <span className="eyebrow">Transparent Pricing</span>
          <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>Plans that grow with your practice</h1>
          <p className="lead" style={{ color: 'var(--ink-2)' }}>No hidden fees. No long-term contracts. Choose the plan that fits your clinic and upgrade anytime.</p>
          <div className="toggle" role="group" aria-label="Billing period">
            <motion.span className="pillbg" initial={false} animate={{ width: yearly ? 158 : 96, x: yearly ? 100 : 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} />
            <button className={!yearly ? 'on' : ''} style={{ width: 96, padding: '9px 0' }} aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
            <button className={yearly ? 'on' : ''} style={{ width: 158, padding: '9px 0' }} aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly <span className="save-tag">Save 15%</span></button>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 90 }}>
        <div className="container">
          <Stagger className="plans">
            {plans.map((p) => (
              <motion.article key={p._id} className={`plan${p.popular ? ' pop' : ''}`} variants={item}>
                {p.popular && <span className="badge">MOST POPULAR</span>}
                <h2 className="h3">{p.name}</h2>
                <div className="price">
                  {p.price == null ? <b>{p.unit}</b> : (
                    <>
                      <b>
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={display(p.price)} style={{ display: 'inline-block' }} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>
                            ${display(p.price)}
                          </motion.span>
                        </AnimatePresence>
                      </b>
                      <span className="muted">{p.unit}</span>
                    </>
                  )}
                </div>
                <p className="muted" style={{ fontSize: 14.5 }}>{p.blurb}</p>
                <ul>{(p.features || []).map((f) => <li key={f}><Tick size={16} />{f}</li>)}</ul>
                {p.addon && <div className="addon">Add-on: {p.addon}</div>}
                <Link to={p.cta === 'Contact Sales' ? '/contact' : '/demo'} className={`btn ${p.popular ? 'btn-light' : 'btn-dark'}`}>{p.cta}</Link>
              </motion.article>
            ))}
          </Stagger>
          <Reveal className="center" style={{ marginTop: 40 }}>
            <p className="muted"><b style={{ color: 'var(--navy)' }}>Zero migration costs.</b> Growth, Multi-Location and Enterprise plans include free data migration from your current PIMS.</p>
          </Reveal>
        </div>
      </section>

      <section style={{ paddingBottom: 110 }}>
        <div className="container">
          <SectionHead title="Frequently asked questions" />
          <div className="faq">{faqs.map(([q, a]) => <Faq key={q} q={q} a={a} />)}</div>
        </div>
      </section>
      <DemoCTA />
    </>
  );
}
