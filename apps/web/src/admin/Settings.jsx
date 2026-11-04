import { useEffect, useState } from 'react';
import { db, useCollection } from '../lib/store';

const fields = [
  ['heroTitleA', 'Hero title, line 1'],
  ['heroTitleB', 'Hero title, line 2'],
  ['heroSub', 'Hero description', 'textarea'],
  ['contactEmail', 'Support email', 'email'],
  ['pressEmail', 'Press email', 'email'],
  ['address', 'Address'],
  ['linkedin', 'LinkedIn URL', 'url'],
];

export default function Settings() {
  const settings = useCollection('settings');
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const save = (e) => {
    e.preventDefault();
    db.setObject('settings', form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const reset = () => {
    if (window.confirm('Reset all website content and leads back to the original sample data? Your edits will be lost.')) db.reset();
  };

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Settings</h1>
          <p>Home page hero text and company contact details.</p>
        </div>
      </header>

      <form className="adm-card adm-form" onSubmit={save}>
        {fields.map(([key, label, type]) => (
          <div className="field" key={key}>
            <label htmlFor={`s-${key}`}>{label}</label>
            {type === 'textarea'
              ? <textarea id={`s-${key}`} rows="3" value={form[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              : <input id={`s-${key}`} type={type || 'text'} value={form[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />}
          </div>
        ))}
        <div className="adm-form-foot">
          <button className="btn btn-dark btn-sm" type="submit">Save changes</button>
          {saved && <span role="status" className="muted" style={{ fontSize: 14 }}>Saved</span>}
          <button className="btn btn-light btn-sm" type="button" style={{ marginLeft: 'auto' }} onClick={reset}>Reset sample data</button>
        </div>
      </form>
    </>
  );
}
