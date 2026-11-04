import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { icons, Tick } from '../components/ui';
import { agents } from '../data/seed';

// The brand blue at falling opacity, one step per panel. Checked for readable text on each.
const TINTS = [1, 0.88, 0.6, 0.3];

function Panel({ agent, index, on, onSelect, bodyRef }) {
  const Icon = icons[agent.icon];
  const number = String(index + 1).padStart(2, '0');
  const word = agent.name.toUpperCase();
  const bodyId = `agent-${agent.key}`;

  return (
    <article
      className={`agent-panel ${TINTS[index] > 0.7 ? 'dark' : 'light'}${on ? ' on' : ''}`}
      style={{ '--alpha': TINTS[index] }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') onSelect(); }}
    >
      <button
        type="button"
        className="agent-hit"
        aria-expanded={on}
        aria-controls={bodyId}
        aria-label={`${agent.name} agent`}
        onClick={onSelect}
      />

      <div className="agent-inner">
        <div className="agent-ghosts" aria-hidden="true">
          <span className="agent-word">{word}</span>
          <span className="agent-word" />
          <span className="agent-word">{word}</span>
        </div>

        <img className="agent-photo" src={agent.image} alt={agent.alt} loading="lazy" decoding="async" />

        <div className="agent-rail" aria-hidden="true">
          <span className="num">{number}</span>
          <span className="name">{agent.name}</span>
        </div>

        <div className="agent-body" id={bodyId} ref={bodyRef} inert={on ? undefined : ''}>
          <div className="agent-head">
            <span className="agent-ico"><Icon size={20} /></span>
            <span className="tag">{agent.tag}</span>
            <span className="num">{number}</span>
          </div>
          <h3 className="agent-word solid">{word}</h3>

          <div className="agent-info">
            <div>
              <p className="agent-blurb">{agent.blurb}</p>
              <p className="agent-detail">{agent.detail}</p>
            </div>
            <ul className="agent-points">
              {agent.points.map((p) => <li key={p}><Tick size={15} />{p}</li>)}
            </ul>
          </div>

          <div className="agent-foot">
            <dl className="agent-stats">
              {agent.stats.map(([value, label]) => (
                <div key={label}><dd>{value}</dd><dt>{label}</dt></div>
              ))}
            </dl>
            <Link to="/demo" className={`btn btn-sm ${TINTS[index] > 0.7 ? 'btn-light' : 'btn-dark'}`}>
              See it in action <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Agents() {
  const [active, setActive] = useState(0);
  const wrap = useRef(null);
  const bodies = useRef([]);

  // All panels share the height of the longest body, so switching never shifts the page. On phones
  // the panels stack, and each one opens to its own height instead.
  useEffect(() => {
    const measure = () => {
      if (!wrap.current) return;
      const heights = bodies.current.map((b) => b?.offsetHeight || 0);
      wrap.current.style.setProperty('--panels-h', `${Math.max(...heights)}px`);
      heights.forEach((h, i) => bodies.current[i]?.closest('.agent-panel').style.setProperty('--open-h', `${h}px`));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="section" id="agents">
      <div className="agents-card">
        {/* Deliberately not animated: in this section only the four panels move. */}
        {/* Takes the active panel's tint, so the two read as one shape and follow the cursor together. */}
        <div
          className={`agents-band ${TINTS[active] > 0.7 ? 'dark' : 'light'}`}
          style={{ backgroundColor: `rgba(47, 98, 117, ${TINTS[active]})` }}
        >
          <div className="container agents-head">
            <div>
              <span className="eyebrow">Agentic AI Platform</span>
              <h2 className="h2">Four AI agents.<br /><span className="agents-accent">One unified brain.</span></h2>
            </div>
            <p className="lead">Our four AI agents share context and work together seamlessly. Choose an agent to see what it does.</p>
          </div>
        </div>
        <div className="agent-panels" ref={wrap}>
          {agents.map((agent, i) => (
            <Panel
              key={agent.key}
              agent={agent}
              index={i}
              on={active === i}
              onSelect={() => setActive(i)}
              bodyRef={(el) => { bodies.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
