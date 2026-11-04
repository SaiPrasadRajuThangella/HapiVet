import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { icons, item, SectionHead, Stagger, Tick, Reveal } from '../components/ui';
import { agents } from '../data/seed';

// Card tilts toward the pointer in real 3D space; children sit at different translateZ depths.
function TiltCard({ agent }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateX = useSpring(rx, spring);
  const rotateY = useSpring(ry, spring);
  const Icon = icons[agent.icon];

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 16);
    rx.set((0.5 - py) * 12);
    e.currentTarget.style.setProperty('--mx', `${px * 100}%`);
    e.currentTarget.style.setProperty('--my', `${py * 100}%`);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.article variants={item} style={{ perspective: 1200 }}>
      <motion.div className="agent-card" style={{ rotateX, rotateY, height: '100%' }} onMouseMove={onMove} onMouseLeave={onLeave}>
        <span className="agent-ico"><Icon size={24} /></span>
        <span className="tag">{agent.tag}</span>
        <h3>{agent.name}</h3>
        <p className="muted" style={{ fontSize: 14.5, transform: 'translateZ(16px)' }}>{agent.blurb}</p>
        <ul>
          {agent.points.map((p) => <li key={p}><Tick size={15} />{p}</li>)}
        </ul>
      </motion.div>
    </motion.article>
  );
}

export default function Agents() {
  return (
    <section className="section" id="agents">
      <div className="container">
        <SectionHead
          eyebrow="Agentic AI Platform"
          title={<>Four AI agents.<br /><span className="grad-text">One unified brain.</span></>}
          text="Our four AI agents share context and work together seamlessly, so nothing falls between the front desk and the invoice."
        />
        <Stagger className="agents-grid">
          {agents.map((a) => <TiltCard key={a.key} agent={a} />)}
        </Stagger>
        <Reveal className="shared-brain">
          <div>
            <h3 className="h3" style={{ marginBottom: 6 }}>Shared memory, unified intelligence</h3>
            <p>When Front Desk books an appointment, Clinical already knows why. When Clinical finishes a note, Revenue captures every charge. One intelligent system.</p>
          </div>
          <Link to="/demo" className="btn btn-light">See it live <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>
  );
}
