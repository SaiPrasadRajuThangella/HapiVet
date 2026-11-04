import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Counter } from '../components/ui';
import HeroTasks from './HeroTasks';
import { unsplash } from '../lib/img';
import { stats } from '../data/seed';
import { useCollection } from '../lib/store';

// Three.js is split into its own chunk and only loaded after the page is idle.
const Scene3D = lazy(() => import('../components/Scene3D'));

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
};

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const Loading = <div className="stage-fallback"><i /></div>;
// Only shown when WebGL is unavailable or the 3D scene fails to load.
const Fallback = (
  <div className="stage-fallback">
    <img src={unsplash('1587300003388-59208cc962cb', 700)} alt="A happy dog smiling at the camera" decoding="async" />
  </div>
);
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
  const [mountScene, setMountScene] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);

  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idle(() => setMountScene(hasWebGL() ? 'on' : 'off'));
  }, []);

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
          {!mountScene && Loading}
          {mountScene === 'off' && Fallback}
          {mountScene === 'on' && (
            <SceneBoundary fallback={Fallback}>
              <Suspense fallback={Loading}><Scene3D /></Suspense>
            </SceneBoundary>
          )}
          <HeroTasks />
        </motion.div>
      </div>
      <div className="scroll-hint"><span>Scroll</span><i /></div>
    </section>
  );
}
