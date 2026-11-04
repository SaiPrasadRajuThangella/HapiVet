import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Search, Trash2 } from 'lucide-react';
import LeadDrawer from './LeadDrawer';
import { db, useCollection } from '../lib/store';
import { STATUSES, statusLabel } from '../lib/leads';
import { formatStamp } from '../lib/slots';

export const StatusPill = ({ status }) => <span className={`adm-pill s-${status}`}>{statusLabel(status)}</span>;

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

function exportCsv(rows) {
  const cols = ['name', 'email', 'phone', 'clinic', 'jobTitle', 'city', 'size', 'slot', 'timeZone', 'status', 'message', 'createdAt'];
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
  const [toast, setToast] = useState('');
  // The open lead lives in the URL, so the back button closes the drawer and the dashboard can link to one.
  const [params, setParams] = useSearchParams();
  const selected = leads.find((l) => l._id === params.get('lead'));

  const close = useCallback(() => setParams({}, { replace: true }), [setParams]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads
      .filter((l) => status === 'all' || l.status === status)
      .filter((l) => !needle || `${l.name} ${l.email} ${l.clinic} ${l.phone ?? ''}`.toLowerCase().includes(needle))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [leads, q, status]);

  const open = (lead) => setParams({ lead: lead._id });

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Leads</h1>
          <p>Demo and contact requests from the website. Click a lead to see the details and move it to the next step.</p>
        </div>
        <button className="btn btn-light btn-sm" onClick={() => exportCsv(rows)} disabled={!rows.length}><Download size={15} /> Export CSV</button>
      </header>

      <div className="adm-toolbar">
        <label className="adm-search">
          <Search size={16} />
          <input type="search" placeholder="Search name, email, phone or clinic" aria-label="Search leads" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr><th>Lead</th><th>Clinic</th><th>Requested time</th><th>Received</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr
                key={l._id}
                className={`adm-row${selected?._id === l._id ? ' on' : ''}`}
                tabIndex={0}
                aria-label={`Open lead from ${l.name}`}
                onClick={() => open(l)}
                onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(l); } }}
              >
                <td><b>{l.name}</b><small>{l.email}</small></td>
                <td>{l.clinic}{l.jobTitle && <small>{l.jobTitle}</small>}</td>
                <td>{l.slot ? formatStamp(l.slot) : <span className="muted">{l.type === 'contact' ? 'Contact request' : '—'}</span>}</td>
                <td>{new Date(l.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><StatusPill status={l.status} /></td>
                <td className="adm-actions">
                  <button className="adm-icon danger" aria-label={`Delete ${l.name}`} onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete the lead from ${l.name}?`)) db.remove('leads', l._id); }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="6" className="adm-empty">No leads match those filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && <LeadDrawer key={selected._id} lead={selected} onClose={close} onToast={setToast} />}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div className="ac-toast adm-toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
