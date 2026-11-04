// The "Active AI Tasks" cards that orbit the hero puppy. They stay real DOM so the text is sharp, and
// swap between sitting behind and in front of the transparent 3D canvas, so the dog hides them on the
// far side of the orbit. Far cards shrink and go slightly out of focus to read as depth.
import { useEffect, useRef } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import { CalendarClock, FileText, Phone } from 'lucide-react';
import { activeTasks } from '../data/seed';

const icons = { Phone, FileText, CalendarClock };

const SPEED = 0.16; // radians per second, so one lap takes about 40 seconds
const START = (200 * Math.PI) / 180; // first card upper left, second upper right, third low in front
const GAP = (2 * Math.PI) / activeTasks.length;
const MAX_RADIUS = 300;
const EDGE = 12;

export default function HeroTasks() {
  const root = useRef(null);
  const cards = useRef([]);
  const angle = useRef(START);
  const paused = useRef(false);
  const born = useRef(null);
  const orbit = useRef({ rx: 0, ry: 0, cx: 0, cy: 0 });
  const inView = useInView(root);
  const still = useReducedMotion();

  const place = (fade = 1) => {
    const { rx, ry, cx, cy } = orbit.current;
    cards.current.forEach((card, i) => {
      if (!card) return;
      const a = angle.current + i * GAP;
      const depth = Math.sin(a); // 1 is nearest the viewer, -1 is behind the dog
      const near = (depth + 1) / 2;
      card.style.transform = `translate(-50%, -50%) translate3d(${cx + Math.cos(a) * rx}px, ${cy + depth * ry}px, 0) scale(${0.82 + near * 0.2})`;
      card.style.zIndex = depth > 0 ? 2 : 0;
      card.style.opacity = (0.78 + near * 0.22) * fade;
      card.style.filter = depth < -0.2 ? `blur(${((-depth - 0.2) / 0.8) * 1.4}px)` : 'none';
    });
  };

  // Sizes the orbit so a card at either end stays on screen and clear of the hero paragraph.
  useEffect(() => {
    const measure = () => {
      const stage = root.current.getBoundingClientRect();
      const half = (cards.current[0]?.offsetWidth || 0) / 2;
      const centre = stage.left + stage.width / 2;
      const right = document.documentElement.clientWidth - centre - half - EDGE;
      const lead = document.querySelector('.hero-copy .lead')?.getBoundingClientRect();
      const sideBySide = lead && lead.right < stage.left + stage.width / 2 && lead.bottom > stage.top;
      const left = sideBySide ? centre - half - lead.right - EDGE : right;
      // The room on each side differs, so the orbit is off-centre to use all of it.
      orbit.current = {
        rx: Math.min((right + left) / 2, MAX_RADIUS),
        cx: (right - left) / 2,
        ry: stage.height * 0.37,
        cy: stage.height * 0.04,
      };
      if (still) place();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [still]);

  useAnimationFrame((time, delta) => {
    if (still || !inView) return;
    if (born.current === null) born.current = time;
    if (!paused.current) angle.current += (Math.min(delta, 100) / 1000) * SPEED;
    place(Math.min(1, Math.max(0, (time - born.current - 700) / 700)));
  });

  return (
    <div className="task-orbit" ref={root}>
      <p className="pill task-label"><i className="dot" /> Active AI Tasks</p>
      <ul>
        {activeTasks.map((task, i) => {
          const Icon = icons[task.icon];
          return (
            <li
              key={task.title}
              className="task-card"
              ref={(el) => { cards.current[i] = el; }}
              onPointerEnter={() => { paused.current = true; }}
              onPointerLeave={() => { paused.current = false; }}
            >
              <span className="ic"><Icon size={17} /></span>
              <span><b>{task.title}</b><small>{task.detail}</small></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
