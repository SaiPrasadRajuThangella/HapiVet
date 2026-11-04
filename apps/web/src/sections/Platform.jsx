// Platform Architecture as a three-column parallax slider: a list of items, a tall photo, and details.
// The photo changes with a curtain wipe while the picture inside it drifts the opposite way, and a
// stat badge in front moves faster than both, so the layers separate like a parallax scene.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { icons, Tick } from '../components/ui';
import { platform } from '../data/seed';

const wipe = [0.76, 0, 0.24, 1];
const ease = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, '0');

export default function Platform() {
  const [index, setIndex] = useState(0);
  const direction = useRef(1);
  const root = useRef(null);
  const list = useRef(null);
  const nearby = useInView(root, { once: true, margin: '600px' });
  const still = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const softX = useSpring(pointerX, { stiffness: 60, damping: 18 });
  const softY = useSpring(pointerY, { stiffness: 60, damping: 18 });
  const { scrollYProgress } = useScroll({ target: root, offset: ['start end', 'end start'] });
  const photoX = useTransform(softX, [-1, 1], [14, -14]);
  const photoPointerY = useTransform(softY, [-1, 1], [8, -8]);
  const photoScrollY = useTransform(scrollYProgress, [0, 1], [-22, 22]);
  const photoY = useTransform([photoPointerY, photoScrollY], ([a, b]) => a + b);
  const badgeX = useTransform(softX, [-1, 1], [-26, 26]);
  const badgeY = useTransform(softY, [-1, 1], [-16, 16]);

  const item = platform[index];
  const Icon = icons[item.icon];

  const show = (next, step) => {
    if (next === index) return;
    direction.current = step ?? (next > index ? 1 : -1);
    setIndex(next);
  };
  const move = (step) => show((index + step + platform.length) % platform.length, step);

  const onPointerMove = (e) => {
    if (still || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    pointerX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    pointerY.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowLeft') move(-1);
  };

  // Fetches every photo before the section arrives, so no wipe ever reveals a blank panel.
  useEffect(() => {
    if (nearby) platform.forEach((p) => { new Image().src = p.image; });
  }, [nearby]);

  // On phones the list is a sideways row, so keep the current item in view.
  useEffect(() => {
    const row = list.current;
    const button = row?.children[index];
    if (button && row.scrollWidth > row.clientWidth) row.scrollTo({ left: button.offsetLeft - 24, behavior: still ? 'auto' : 'smooth' });
  }, [index, still]);

  const time = (t) => (still ? 0 : t);
  const slideVariants = {
    enter: () => ({ clipPath: direction.current > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }),
    center: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: time(1.05), ease: wipe } },
    exit: { transition: { duration: time(1.05) } },
  };
  const pictureVariants = {
    enter: () => ({ x: `${direction.current * 16}%`, scale: 1.12 }),
    center: { x: '0%', scale: 1, transition: { duration: time(1.05), ease: wipe } },
    exit: () => ({ x: `${direction.current * -12}%`, transition: { duration: time(1.05), ease: wipe } }),
  };
  const badgeVariants = {
    enter: () => ({ opacity: 0, x: direction.current * 130 }),
    center: { opacity: 1, x: 0, transition: { duration: time(0.95), delay: time(0.28), ease } },
    exit: () => ({ opacity: 0, x: direction.current * -130, transition: { duration: time(0.45), ease } }),
  };
  const copyVariants = {
    enter: {},
    center: { transition: { staggerChildren: time(0.05), delayChildren: time(0.1) } },
    exit: { opacity: 0, transition: { duration: time(0.22) } },
  };
  const lineVariants = {
    enter: { y: '105%' },
    center: { y: '0%', transition: { duration: time(0.75), ease } },
  };
  const riseVariants = {
    enter: { opacity: 0, y: 14 },
    center: { opacity: 1, y: 0, transition: { duration: time(0.6), ease } },
  };

  return (
    <section className="pf" id="platform" ref={root} onKeyDown={onKeyDown}>
      <div className="pf-grid">
        <div className="pf-side">
          <span className="eyebrow">Platform Architecture</span>
          <h2 className="pf-heading">Built for scale. Designed for trust.</h2>
          <p className="pf-intro">An AI-native platform with modern architecture that grows with your practice — from single clinic to multi-location enterprise.</p>
          <div className="pf-list" ref={list}>
            {platform.map((p, i) => (
              <button type="button" key={p.name} className="pf-link" aria-current={i === index ? 'true' : undefined} onClick={() => show(i)}>
                <small>{pad(i + 1)}</small>{p.name}
              </button>
            ))}
          </div>
          <Link to="/demo" className="btn btn-ghost pf-demo">Book a demo <ArrowRight size={16} /></Link>
        </div>

        <div className="pf-stage" onPointerMove={onPointerMove}>
          <motion.div className="pf-slides" style={{ x: photoX, y: photoY }}>
            <AnimatePresence initial={false}>
              <motion.div key={item.name} className="pf-slide" variants={slideVariants} initial="enter" animate="center" exit="exit">
                <motion.img src={item.image} alt={item.alt} decoding="sync" variants={pictureVariants} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div className="pf-front" style={{ x: badgeX, y: badgeY }}>
            <AnimatePresence initial={false}>
              <motion.div key={item.name} className="pf-badge" variants={badgeVariants} initial="enter" animate="center" exit="exit">
                <b>{item.badge[0]}</b>
                <span>{item.badge[1]}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="pf-info">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={item.name} className="pf-copy" aria-live="polite" variants={copyVariants} initial="enter" animate="center" exit="exit">
              <motion.div className="pf-tag" variants={riseVariants}>
                <span className="pf-ico"><Icon size={18} /></span>{item.tag}
              </motion.div>
              <div className="pf-mask"><motion.h3 className="pf-title" variants={lineVariants}>{item.name}</motion.h3></div>
              <motion.p className="pf-text" variants={riseVariants}>{item.text}</motion.p>
              <ul className="pf-points">
                {item.points.map((p) => (
                  <motion.li key={p} variants={riseVariants}><Tick size={16} />{p}</motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="pf-nav">
            <div className="pf-progress"><i style={{ width: `${((index + 1) / platform.length) * 100}%` }} /></div>
            <span className="pf-count"><b>{pad(index + 1)}</b> / {pad(platform.length)}</span>
            <button type="button" className="round-btn" aria-label="Previous item" onClick={() => move(-1)}><ArrowLeft size={18} /></button>
            <button type="button" className="round-btn" aria-label="Next item" onClick={() => move(1)}><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
