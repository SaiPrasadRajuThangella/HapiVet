// The home page background. Fixed layers cross-fade as sections scroll past: the hero's blue fades to
// the page gray by the "Trusted by" band, then navy fades in behind the agents section and back out
// after it. Layers only animate opacity, so scrolling never repaints the whole screen.
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';

const ramp = (y, from, to) => Math.min(1, Math.max(0, (y - from) / (to - from)));

export default function ScrollTone() {
  const { scrollY } = useScroll();
  const hero = useMotionValue(1);
  const navy = useMotionValue(0);
  const stops = useRef(null);

  const update = (y) => {
    const s = stops.current;
    if (!s) return;
    hero.set(1 - ramp(y, s.heroFrom, s.heroTo));
    const dark = ramp(y, s.navyInFrom, s.navyInTo) * (1 - ramp(y, s.navyOutFrom, s.navyOutTo));
    navy.set(dark);
    // Flips the agents heading to light text once the navy behind it is the stronger colour.
    s.agents.dataset.tone = dark > 0.5 ? 'dark' : 'light';
  };

  useMotionValueEvent(scrollY, 'change', update);

  useEffect(() => {
    const measure = () => {
      const trust = document.querySelector('.trust');
      const agents = document.getElementById('agents');
      if (!trust || !agents) return;
      const vh = window.innerHeight;
      const trustTop = trust.getBoundingClientRect().top + window.scrollY;
      const agentsTop = agents.getBoundingClientRect().top + window.scrollY;
      const agentsBottom = agentsTop + agents.offsetHeight;
      stops.current = {
        agents,
        heroFrom: Math.max(0, trustTop - vh),
        heroTo: trustTop - vh * 0.55,
        navyInFrom: agentsTop - vh * 0.6,
        navyInTo: agentsTop - vh * 0.2,
        navyOutFrom: agentsBottom - vh * 0.8,
        navyOutTo: agentsBottom - vh * 0.35,
      };
      update(window.scrollY);
    };
    measure();
    // Section positions shift as images load and the panels measure themselves.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  // Portalled to <body> so a transform on the page transition wrapper can't break position: fixed.
  return createPortal(
    <div className="tone" aria-hidden="true">
      <motion.i className="tone-hero" style={{ opacity: hero }} />
      <motion.i className="tone-navy" style={{ opacity: navy }} />
    </div>,
    document.body
  );
}
