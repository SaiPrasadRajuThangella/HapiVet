import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { Reveal, Tick } from '../components/ui';
import { db, useCollection } from '../lib/store';

const empty = { name: '', email: '', clinic: '', size: 'Solo', message: '' };

export default function Demo({ contact = false }) {
  const settings = useCollection('settings');
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Please enter a valid email';
    if (!form.clinic.trim()) next.clinic = 'Please enter your clinic name';
    setErrors(next);
    if (Object.keys(next).length) return;
    db.create('leads', { ...form, type: contact ? 'contact' : 'demo', status: 'new' });
    setSent(true);
  };

  return (
    <>
      <section className="page-hero" style={{ paddingBottom: 60 }}>
        <div className="container">
          <span className="eyebrow">{contact ? 'Contact Us' : 'Get a Personalized Demo'}</span>
          <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>{contact ? 'Questions first? Talk to us.' : 'See HapiVet run your clinic'}</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="container demo-grid">
          <Reveal style={{ display: 'grid', gap: 20 }}>
            <h2 className="h2" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              {contact ? 'We’d love to hear from you' : 'A demo with a real practice manager'}
            </h2>
            <p className="lead">
              {contact
                ? 'Reach out about pricing, migration or a feature you need. Our team will get back to you.'
                : 'Get a walkthrough from someone who actually runs a clinic with HapiVet. They know the real questions.'}
            </p>
            <div className="check-list">
              {['Real practice managers, not sales reps', 'No credit card required', '30-minute personalized walkthrough'].map((t) => (
                <div key={t}><Tick />{t}</div>
              ))}
              <div><Mail size={18} /><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></div>
              {settings.pressEmail && <div><Mail size={18} /><a href={`mailto:${settings.pressEmail}`}>{settings.pressEmail}</a><span className="muted">(press)</span></div>}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="form-card">
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div key="ok" className="success" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
                    <CheckCircle2 size={56} />
                    <h3 className="h3">Thanks, {form.name.split(' ')[0]}!</h3>
                    <p className="muted">We’ve received your request and will reach out to {form.email} shortly.</p>
                    <Link to="/" className="btn btn-dark">Back to home</Link>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} noValidate style={{ display: 'grid', gap: 18 }} exit={{ opacity: 0 }}>
                    <div className="two">
                      <Field id="name" label="Full name" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                      <Field id="email" label="Work email" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                    </div>
                    <div className="two">
                      <Field id="clinic" label="Clinic name" value={form.clinic} onChange={set('clinic')} error={errors.clinic} autoComplete="organization" />
                      <div className="field">
                        <label htmlFor="size">Practice size</label>
                        <select id="size" value={form.size} onChange={set('size')}>
                          {['Solo', '2-5 vets', '6-10 vets', '10+ vets', 'Multi-location'].map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor="message">{contact ? 'How can we help?' : 'Anything we should know? (optional)'}</label>
                      <textarea id="message" rows="4" value={form.message} onChange={set('message')} />
                    </div>
                    <button className="btn btn-dark btn-lg" type="submit">{contact ? 'Send message' : 'Book my demo'} <ArrowRight size={17} /></button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Field({ id, label, error, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {error && <small id={`${id}-err`} style={{ color: '#a33a3a' }}>{error}</small>}
    </div>
  );
}
