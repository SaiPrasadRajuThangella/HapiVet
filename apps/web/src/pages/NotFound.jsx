import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-hero" style={{ minHeight: '80vh' }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}>This page wandered off</h1>
        <p className="lead" style={{ color: 'var(--ink-2)' }}>Let’s get you back to the clinic.</p>
        <Link to="/" className="btn btn-dark">Back to home</Link>
      </div>
    </section>
  );
}
