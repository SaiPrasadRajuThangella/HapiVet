import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award } from 'lucide-react';
import { Reveal } from '../components/ui';
import { useCollection } from '../lib/store';

const formatDate = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

export default function Achievements() {
  const all = useCollection('achievements');
  const list = all.filter((a) => a.published).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const rail = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  const slide = (dir) => {
    const card = rail.current?.querySelector('.ach-card');
    rail.current?.scrollBy({ left: dir * ((card?.offsetWidth || 420) + 22), behavior: 'smooth' });
  };

  // Mouse drag-to-slide. Touch devices use native momentum scrolling.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { down: true, x: e.clientX, left: rail.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const delta = e.clientX - d.x;
    if (Math.abs(delta) > 4) {
      d.moved = true;
      rail.current.classList.add('dragging');
    }
    rail.current.scrollLeft = d.left - delta;
  };
  const endDrag = () => {
    drag.current.down = false;
    rail.current?.classList.remove('dragging');
  };

  if (!list.length) return null;

  return (
    <section className="section ach" id="achievements">
      <div className="container ach-top">
        <Reveal style={{ display: 'grid', gap: 14, maxWidth: 640 }}>
          <span className="eyebrow">Our Achievements</span>
          <h2 className="h2">Milestones on the way to the clinic OS</h2>
          <p className="lead">The moments that mark how far HapiVet has come, and where agentic AI goes next.</p>
        </Reveal>
        <div className="ach-nav">
          <button className="round-btn" aria-label="Previous achievement" onClick={() => slide(-1)}><ArrowLeft size={18} /></button>
          <button className="round-btn" aria-label="Next achievement" onClick={() => slide(1)}><ArrowRight size={18} /></button>
        </div>
      </div>
      <div
        className="slider"
        ref={rail}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }}
      >
        {list.map((a, i) => (
          <motion.article
            key={a._id}
            className="ach-card"
            initial={{ opacity: 0, x: 70 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ach-img">
              {a.image && <img src={a.image} alt="" loading="lazy" decoding="async" draggable="false" />}
              <span className="ach-badge"><Award size={14} /> {a.org}</span>
            </div>
            <div className="ach-body">
              <time dateTime={a.date}>{formatDate(a.date)}</time>
              <h3 className="h3">{a.title}</h3>
              <p>{a.summary}</p>
              {a.link && <a href={a.link} target="_blank" rel="noreferrer" draggable="false">Read more <ArrowUpRight size={15} /></a>}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
