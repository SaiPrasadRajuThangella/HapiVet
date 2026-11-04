import { useMemo, useState } from 'react';
import { Download, Search, Trash2 } from 'lucide-react';
import { db, useCollection } from '../lib/store';

export const STATUSES = ['new', 'contacted', 'demo-booked', 'won', 'lost'];
export const statusLabel = (s) => ({ new: 'New', contacted: 'Contacted', 'demo-booked': 'Demo booked', won: 'Won', lost: 'Lost' }[s] || s);

export const StatusPill = ({ status }) => <span className={`adm-pill s-${status}`}>{statusLabel(status)}</span>;

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function exportCsv(rows) {
  const cols = ['name', 'email', 'clinic', 'size', 'status', 'message', 'createdAt'];
  const body = [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hapivet-leads.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function Leads() {
  const leads = useCollection('leads');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads
      .filter((l) => status === 'all' || l.status === status)
      .filter((l) => !needle || `${l.name} ${l.email} ${l.clinic}`.toLowerCase().includes(needle))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [leads, q, status]);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Leads</h1>
          <p>Demo and contact requests from the website.</p>
        </div>
        <button className="btn btn-light btn-sm" onClick={() => exportCsv(rows)} disabled={!rows.length}><Download size={15} /> Export CSV</button>
      </header>

      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={16} />
          <input type="search" placeholder="Search name, email or clinic" aria-label="Search leads" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Lead</th><th>Clinic</th><th>Size</th><th>Message</th><th>Received</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l._id}>
                <td><b>{l.name}</b><small><a href={`mailto:${l.email}`}>{l.email}</a></small></td>
                <td>{l.clinic}</td>
                <td>{l.size}</td>
                <td className="adm-clip" title={l.message}>{l.message || '—'}</td>
                <td>{new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td>
                  <select aria-label={`Status for ${l.name}`} value={l.status} onChange={(e) => db.update('leads', l._id, { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </td>
                <td>
                  <button className="adm-icon danger" aria-label={`Delete ${l.name}`} onClick={() => { if (window.confirm(`Delete the lead from ${l.name}?`)) db.remove('leads', l._id); }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="7" className="adm-empty">No leads match those filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
