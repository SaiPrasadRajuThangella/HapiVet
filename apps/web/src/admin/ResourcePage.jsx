// Generic list + slide-over editor used for every content collection in the admin panel.
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { db, useCollection } from '../lib/store';

function toForm(fields, doc) {
  const form = { ...doc };
  fields.forEach((f) => {
    if (f.type === 'lines') form[f.key] = (doc[f.key] || []).join('\n');
    else if (f.type === 'number') form[f.key] = doc[f.key] ?? '';
    else if (f.type === 'checkbox') form[f.key] = !!doc[f.key];
    else form[f.key] = doc[f.key] ?? '';
  });
  return form;
}

function fromForm(fields, form) {
  const doc = { ...form };
  fields.forEach((f) => {
    if (f.type === 'lines') doc[f.key] = form[f.key].split('\n').map((s) => s.trim()).filter(Boolean);
    if (f.type === 'number') doc[f.key] = form[f.key] === '' ? null : Number(form[f.key]);
  });
  return doc;
}

function FieldInput({ field, value, onChange, error }) {
  const id = `f-${field.key}`;
  if (field.type === 'checkbox') {
    return (
      <label className="adm-check" htmlFor={id}>
        <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }
  const common = { id, value, 'aria-invalid': !!error, onChange: (e) => onChange(e.target.value) };
  return (
    <div className="field">
      <label htmlFor={id}>{field.label}{field.required && ' *'}</label>
      {field.type === 'textarea' && <textarea rows="4" {...common} />}
      {field.type === 'lines' && <textarea rows="7" {...common} />}
      {field.type === 'select' && <select {...common}>{field.options.map((o) => <option key={o}>{o}</option>)}</select>}
      {!['textarea', 'lines', 'select'].includes(field.type) && (
        <input type={field.type === 'image' ? 'url' : field.type || 'text'} {...common} />
      )}
      {field.type === 'image' && value && <img className="adm-preview" src={value} alt="" />}
      {field.hint && <small className="muted">{field.hint}</small>}
      {error && <small style={{ color: '#a33a3a' }}>{error}</small>}
    </div>
  );
}

export default function ResourcePage({ name, title, subtitle, singular, fields, columns, defaults = {} }) {
  const rows = useCollection(name);
  const [editing, setEditing] = useState(null); // null, or { id, form }
  const [errors, setErrors] = useState({});
  const hasPublished = fields.some((f) => f.key === 'published');

  const open = (doc) => {
    setErrors({});
    setEditing({ id: doc?._id || null, form: toForm(fields, doc || defaults) });
  };

  const save = (e) => {
    e.preventDefault();
    const next = {};
    fields.forEach((f) => {
      if (f.required && !String(editing.form[f.key] ?? '').trim()) next[f.key] = `${f.label} is required`;
    });
    setErrors(next);
    if (Object.keys(next).length) return;
    const doc = fromForm(fields, editing.form);
    if (editing.id) db.update(name, editing.id, doc);
    else db.create(name, doc);
    setEditing(null);
  };

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-dark btn-sm" onClick={() => open()}><Plus size={16} /> Add {singular}</button>
      </header>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              {columns.map(([key, label]) => <th key={key}>{label}</th>)}
              {hasPublished && <th>Website</th>}
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id}>
                {columns.map(([key, , render], i) => {
                  const v = render ? render(row[key]) : row[key];
                  return <td key={key}>{i === 0 ? <b>{v}</b> : v}</td>;
                })}
                {hasPublished && (
                  <td>
                    <label className="adm-switch">
                      <input type="checkbox" checked={!!row.published} aria-label={`Show ${row[columns[0][0]]} on website`} onChange={(e) => db.update(name, row._id, { published: e.target.checked })} />
                      <i />
                    </label>
                  </td>
                )}
                <td className="adm-actions">
                  <button className="adm-icon" aria-label={`Edit ${row[columns[0][0]]}`} onClick={() => open(row)}><Pencil size={16} /></button>
                  <button className="adm-icon danger" aria-label={`Delete ${row[columns[0][0]]}`} onClick={() => { if (window.confirm(`Delete “${row[columns[0][0]]}”?`)) db.remove(name, row._id); }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={columns.length + 2} className="adm-empty">Nothing here yet. Add your first {singular}.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <>
            <motion.div className="adm-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} />
            <motion.form
              className="adm-drawer"
              role="dialog"
              aria-label={`${editing.id ? 'Edit' : 'Add'} ${singular}`}
              onSubmit={save}
              noValidate
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="adm-drawer-head">
                <h2>{editing.id ? 'Edit' : 'Add'} {singular}</h2>
                <button type="button" className="adm-icon" aria-label="Close" onClick={() => setEditing(null)}><X size={18} /></button>
              </div>
              <div className="adm-drawer-body">
                {fields.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={editing.form[f.key]}
                    error={errors[f.key]}
                    onChange={(v) => setEditing((s) => ({ ...s, form: { ...s.form, [f.key]: v } }))}
                  />
                ))}
              </div>
              <div className="adm-drawer-foot">
                <button type="button" className="btn btn-light btn-sm" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-dark btn-sm">Save</button>
              </div>
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
