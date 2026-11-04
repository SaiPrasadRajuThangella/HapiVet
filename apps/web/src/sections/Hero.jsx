import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Counter } from '../components/ui';
import PuppyStage from '../components/PuppyStage';
import HeroTasks from './HeroTasks';
import { stats } from '../data/seed';
import { useCollection } from '../lib/store';

const ease = [0.22, 1, 0.36, 1];

function Words({ text, delay = 0, className }) {
  return (
    <span className={className} style={{ display: 'block' }}>
      {text.split(' ').map((w, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', marginBottom: '-0.08em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: delay + i * 0.06, ease }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const settings = useCollection('settings');
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  return (
    <section className="hero" ref={ref}>
      <div className="container hero-grid">
        <motion.div className="hero-copy" style={{ y: copyY, opacity: fade }}>
          <motion.span className="pill" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <i className="dot" /> The first Agentic PIMS for veterinary clinics
          </motion.span>
          <h1 className="h1">
            <Words text={settings.heroTitleA} />
            <Words text={settings.heroTitleB} delay={0.25} />
          </h1>
          <motion.p className="lead" style={{ maxWidth: 540, color: 'var(--ink-2)' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55, ease }}>
            {settings.heroSub}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7, ease }}>
            <Link to="/demo" className="btn btn-dark btn-lg">Book a Demo <ArrowRight size={17} /></Link>
            <Link to="/#agents" className="btn btn-light btn-lg">See It In Action</Link>
          </motion.div>
          <motion.div className="hero-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.9 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <b><Counter to={s.value} suffix={s.suffix} /></b>
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="hero-stage" style={{ y: stageY }}>
          <PuppyStage />
          <HeroTasks />
        </motion.div>
      </div>
      <div className="scroll-hint"><span>Scroll</span><i /></div>
    </section>
  );
}
