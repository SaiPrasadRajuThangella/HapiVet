// Right-hand drawer for one lead: who they are, where they stand, and the one button that moves them on.
// Every move shows up straight away on the customer's My Demo Bookings page.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Mail, MessageCircle, Phone, RotateCcw, Trash2, X } from 'lucide-react';
import { db } from '../lib/store';
import { historyOf, moveLead, NEXT_STEP, reachedStage, STAGES, statusLabel } from '../lib/leads';
import { formatPhone } from '../lib/phone';
import { formatStamp, zoneName } from '../lib/slots';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function Stepper({ lead }) {
  const lost = lead.status === 'lost';
  const reached = STAGES.indexOf(reachedStage(lead));
  return (
    <ol className="adm-steps" aria-label="Lead stage">
      {STAGES.map((s, i) => (
        <li key={s} className={i <= reached ? (lost ? 'lost' : 'done') : ''} aria-current={!lost && i === reached ? 'step' : undefined}>
          <i />
          <span>{statusLabel(s)}</span>
        </li>
      ))}
    </ol>
  );
}

function Contact({ href, icon: Icon, label }) {
  if (!href) return <span className="adm-contact off" aria-disabled="true"><Icon size={17} />{label}</span>;
  return <a className="adm-contact" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><Icon size={17} />{label}</a>;
}

export default function LeadDrawer({ lead, onClose, onToast }) {
  const [note, setNote] = useState(lead.note ?? '');
  const [when, setWhen] = useState(toLocalInput(lead.slot));
  const [link, setLink] = useState(lead.meetingLink ?? '');
  const [askLost, setAskLost] = useState(false);
  const [reason, setReason] = useState('');
  const [whenError, setWhenError] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const next = NEXT_STEP[lead.status];
  const closed = lead.status === 'won' || lead.status === 'lost';
  const previous = closed ? null : STAGES[STAGES.indexOf(lead.status) - 1];
  // Booking the demo is when the time and meeting link get settled; they stay editable until it's over.
  const showsDemoFields = lead.status === 'contacted' || lead.status === 'demo-booked';
  const trimmedNote = note.trim();

  const details = () => ({
    note: trimmedNote,
    ...(showsDemoFields ? { slot: when ? new Date(when).toISOString() : lead.slot, meetingLink: link.trim() } : {}),
  });

  const dirty = trimmedNote !== (lead.note ?? '') || (showsDemoFields && (when !== toLocalInput(lead.slot) || link.trim() !== (lead.meetingLink ?? '')));

  const move = (status, message, extra = {}) => {
    moveLead(lead, status, { ...details(), ...extra });
    onToast(message);
  };

  const advance = () => {
    if (next.to === 'demo-booked' && !when) { setWhenError('Pick the demo date and time first'); return; }
    setWhenError('');
    move(next.to, `${lead.name} marked as ${statusLabel(next.to).toLowerCase()}`);
  };

  const markLost = () => {
    move('lost', `${lead.name} marked as lost`, { lostReason: reason.trim() });
    setAskLost(false);
    setReason('');
  };

  const reopen = () => {
    const to = lead.status === 'won' ? 'demo-booked' : reachedStage(lead);
    moveLead(lead, to, { lostReason: '' });
    onToast(`${lead.name} reopened at ${statusLabel(to).toLowerCase()}`);
  };

  const save = () => {
    db.update('leads', lead._id, details());
    onToast('Saved for the customer');
  };

  const remove = () => {
    if (!window.confirm(`Delete the lead from ${lead.name}?`)) return;
    db.remove('leads', lead._id);
    onClose();
  };

  const digits = (lead.phone || '').replace(/\D/g, '');
  const rows = [
    ['Email', lead.email],
    ['Phone', formatPhone(lead.phone)],
    ['Practice', lead.clinic],
    ['Job title', lead.jobTitle],
    ['City/State', lead.city],
    ['Practice size', lead.size],
    ['Requested time', lead.slot && formatStamp(lead.slot)],
    ['Customer time zone', lead.timeZone && zoneName(lead.timeZone)],
    ['Guests', lead.guests?.join(', ')],
    ['Account', lead.userPhone && formatPhone(lead.userPhone)],
    ['Received', formatStamp(lead.createdAt)],
  ].filter(([, v]) => v);

  return (
    <>
      <motion.div className="adm-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        className="adm-drawer adm-lead"
        role="dialog"
        aria-modal="true"
        aria-label={`Lead from ${lead.name}`}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="adm-drawer-head">
          <div>
            <small>{lead.type === 'contact' ? 'Contact request' : 'Demo request'}</small>
            <h2>{lead.name}</h2>
            <p>{lead.clinic}</p>
          </div>
          <button type="button" ref={closeRef} className="adm-icon" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="adm-drawer-body">
          <Stepper lead={lead} />

          <section className="adm-action" aria-label="Next step">
            {lead.status === 'lost' && (
              <>
                <b className="adm-action-lost">Lost{lead.lostReason ? ` · ${lead.lostReason}` : ''}</b>
                <p>The customer sees this request as closed.</p>
                <button type="button" className="btn btn-light btn-sm" onClick={reopen}><RotateCcw size={15} /> Reopen lead</button>
              </>
            )}
            {lead.status === 'won' && (
              <>
                <b className="adm-action-won"><Check size={16} strokeWidth={3} /> Won</b>
                <p>The customer has been welcomed on board.</p>
                <button type="button" className="btn btn-light btn-sm" onClick={reopen}><RotateCcw size={15} /> Move back to demo booked</button>
              </>
            )}
            {next && !askLost && (
              <>
                {showsDemoFields && (
                  <div className="adm-action-fields">
                    <div className="field">
                      <label htmlFor="ld-when">Demo date and time</label>
                      <input id="ld-when" type="datetime-local" value={when} aria-invalid={!!whenError} onChange={(e) => { setWhen(e.target.value); setWhenError(''); }} />
                      {whenError && <small role="alert" style={{ color: '#a33a3a' }}>{whenError}</small>}
                    </div>
                    <div className="field">
                      <label htmlFor="ld-link">Meeting link (optional)</label>
                      <input id="ld-link" type="url" placeholder="https://meet.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} />
                    </div>
                  </div>
                )}
                <button type="button" className="btn btn-dark adm-action-main" onClick={advance}>{next.label} <ChevronRight size={17} /></button>
                <div className="adm-action-row">
                  {previous && <button type="button" className="adm-link" onClick={() => move(previous, `${lead.name} moved back to ${statusLabel(previous).toLowerCase()}`)}>Back to {statusLabel(previous).toLowerCase()}</button>}
                  <button type="button" className="adm-link danger" onClick={() => setAskLost(true)}>Mark as lost</button>
                </div>
              </>
            )}
            {next && askLost && (
              <>
                <b>Mark {lead.name} as lost?</b>
                <p>The customer will see this request as closed. You can reopen it later.</p>
                <div className="field">
                  <label htmlFor="ld-reason">Reason (optional, shown to the customer)</label>
                  <input id="ld-reason" autoFocus value={reason} placeholder="Went with another PIMS" onChange={(e) => setReason(e.target.value)} />
                </div>
                <div className="adm-action-row">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setAskLost(false)}>Cancel</button>
                  <button type="button" className="btn btn-sm adm-btn-danger" onClick={markLost}>Mark as lost</button>
                </div>
              </>
            )}
          </section>

          <div className="adm-contacts">
            <Contact href={digits && `tel:+${digits}`} icon={Phone} label="Call" />
            <Contact href={digits && `https://wa.me/${digits}`} icon={MessageCircle} label="WhatsApp" />
            <Contact href={lead.email && `mailto:${lead.email}`} icon={Mail} label="Email" />
          </div>

          <dl className="adm-details">
            {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>

          {lead.message && (
            <section className="adm-block">
              <h3>Message</h3>
              <p>{lead.message}</p>
            </section>
          )}

          <div className="field">
            <label htmlFor="ld-note">Note for the customer</label>
            <textarea id="ld-note" rows="3" placeholder="Shows on their booking. For example: looking forward to walking you through migration." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {dirty && <button type="button" className="btn btn-light btn-sm adm-save" onClick={save}>Save without moving the lead</button>}

          <section className="adm-block">
            <h3>Activity</h3>
            <ol className="adm-activity">
              {[...historyOf(lead)].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`}><span>{statusLabel(h.status)}</span><time dateTime={h.at}>{formatStamp(h.at)}</time></li>
              ))}
            </ol>
          </section>
        </div>

        <div className="adm-drawer-foot">
          <button type="button" className="adm-link danger" style={{ marginRight: 'auto' }} onClick={remove}><Trash2 size={15} /> Delete lead</button>
          <button type="button" className="btn btn-light btn-sm" onClick={onClose}>Close</button>
        </div>
      </motion.aside>
    </>
  );
}
