import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCollection } from '../lib/store';
import { STATUSES, statusLabel } from '../lib/leads';
import { StatusPill } from './Leads';

const dateFmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function Tile({ label, value, note }) {
  return (
    <div className="adm-tile">
      <span>{label}</span>
      <b>{value}</b>
      {note && <small>{note}</small>}
    </div>
  );
}

// Single series, so one hue and no legend. Each row is the hit target for its tooltip.
function StatusChart({ leads }) {
  const rows = STATUSES.map((s) => ({ s, n: leads.filter((l) => l.status === s).length }));
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = leads.length || 1;
  return (
    <div className="adm-chart" role="img" aria-label={rows.map((r) => `${statusLabel(r.s)}: ${r.n}`).join(', ')}>
      {rows.map(({ s, n }) => (
        <div className="adm-chart-row" key={s}>
          <span className="adm-chart-label">{statusLabel(s)}</span>
          <div className="adm-chart-plot">
            <i style={{ width: n ? `${(n / max) * 100}%` : 0 }} />
            <b>{n}</b>
            <span className="adm-tip">{statusLabel(s)}: {n} {n === 1 ? 'lead' : 'leads'} · {Math.round((n / total) * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const leads = useCollection('leads');
  const achievements = useCollection('achievements');
  const testimonials = useCollection('testimonials');
  const plans = useCollection('plans');

  const count = (s) => leads.filter((l) => l.status === s).length;
  const recent = [...leads].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  const live = achievements.filter((a) => a.published).length + testimonials.filter((t) => t.published).length;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>Demo requests and what’s live on the website. Lead data is sample data until the API is connected.</p>
        </div>
      </header>

      <div className="adm-tiles">
        <Tile label="Total leads" value={leads.length} />
        <Tile label="Waiting to be contacted" value={count('new') + count('accepted')} note={`${count('new')} not yet accepted`} />
        <Tile label="Demos booked" value={count('demo-booked')} />
        <Tile label="Live content items" value={live} note={`${plans.length} pricing plans`} />
      </div>

      <div className="adm-two">
        <section className="adm-card">
          <h2>Leads by status</h2>
          <StatusChart leads={leads} />
        </section>
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>Recent leads</h2>
            <Link to="/admin/leads">All leads <ArrowRight size={14} /></Link>
          </div>
          {recent.length === 0 ? <p className="muted">No leads yet.</p> : (
            <ul className="adm-recent">
              {recent.map((l) => (
                <li key={l._id}>
                  <Link to={`/admin/leads?lead=${l._id}`}>
                    <div><b>{l.name}</b><small>{l.clinic} · {dateFmt(l.createdAt)}</small></div>
                    <StatusPill status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
