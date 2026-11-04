import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { AccountLayout } from '../components/Account';
import { userAuth, useUser } from '../lib/store';
import { formatPhone } from '../lib/phone';

function ReadOnly({ id, label, value, note }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="ac-locked">
        <input id={id} value={value} readOnly aria-describedby={`${id}-note`} />
        <Lock size={15} aria-hidden="true" />
      </div>
      <small id={`${id}-note`} className="ac-note">{note}</small>
    </div>
  );
}

export default function Profile() {
  const user = useUser();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const dirty = name.trim() !== user.name;

  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const save = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Please enter your name'); return; }
    setError('');
    try {
      await userAuth.update({ name: name.trim() });
      setName(name.trim());
      setSaved(true);
    } catch (err) {
      if (err.status === 401) userAuth.logout();
      else setError(err.message);
    }
  };

  return (
    <AccountLayout>
      <header className="ac-head">
        <h1>Your profile</h1>
        <p>Your name shows on your demo bookings. Change it any time.</p>
      </header>
      <form className="ac-card ac-form" onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="pf-name">Full name</label>
          <input id="pf-name" value={name} autoComplete="name" aria-invalid={!!error} onChange={(e) => { setName(e.target.value); setError(''); setSaved(false); }} />
          {error && <small role="alert" style={{ color: '#a33a3a' }}>{error}</small>}
        </div>
        <ReadOnly id="pf-phone" label="Mobile number" value={formatPhone(user.phone)} note="This is the number you sign in with, so it can’t be changed." />
        <ReadOnly id="pf-email" label="Email" value={user.email} note="Contact support to change your email." />
        <div className="ac-form-foot">
          <button type="submit" className="btn btn-dark btn-sm" disabled={!dirty}>Save changes</button>
          {saved && <span role="status" className="muted">Saved</span>}
        </div>
      </form>
    </AccountLayout>
  );
}
