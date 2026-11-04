import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import {
  Phone, Stethoscope, CircleDollarSign, Boxes, Users, ShieldCheck, Cloud, Plug, Zap, FileBarChart,
  Award, Handshake, Rocket, Trophy, Check,
} from 'lucide-react';

export const icons = {
  Phone, Stethoscope, CircleDollarSign, Boxes, Users, ShieldCheck, Cloud, Plug, Zap, FileBarChart,
  Award, Handshake, Rocket, Trophy,
};

const ease = [0.22, 1, 0.36, 1];

/** Fade + rise when scrolled into view. */
export function Reveal({ children, delay = 0, y = 32, className = '', as = 'div', ...rest }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Staggers its direct children. */
export function Stagger({ children, className = '', gap = 0.09 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export function Counter({ to, suffix = '', prefix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

export function SectionHead({ eyebrow, title, text, left }) {
  return (
    <Reveal className={`section-head${left ? ' left' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="h2">{title}</h2>
      {text && <p className="lead">{text}</p>}
    </Reveal>
  );
}

export function Marquee({ children, reverse }) {
  return (
    <div className={`marquee${reverse ? ' rev' : ''}`} aria-hidden="true">
      <div className="marquee-track">{children}{children}</div>
    </div>
  );
}

export const Tick = (p) => <Check size={18} strokeWidth={2.4} {...p} />;
