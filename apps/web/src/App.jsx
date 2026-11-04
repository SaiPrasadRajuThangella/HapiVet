import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Demo = lazy(() => import('./pages/Demo'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./admin/AdminApp'));

function SiteShell() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<div className="page-loading" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/contact" element={<Demo contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}

export default function App() {
  const { pathname, hash, key } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const lenisRef = useRef(null);

  // Smooth inertial scrolling on the public site only.
  useEffect(() => {
    if (isAdmin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef.current = null; };
  }, [isAdmin]);

  // Route changes start at the top; "/#section" links glide to their section once it has mounted.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!hash) {
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
      return;
    }
    // The page transition delays the mount, so wait for the section instead of guessing a delay.
    let tries = 0;
    const t = setInterval(() => {
      const el = document.querySelector(hash);
      if (!el && ++tries < 50) return;
      clearInterval(t);
      if (!el) return;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(el, { offset: -84 });
      } else {
        el.scrollIntoView();
      }
    }, 100);
    return () => clearInterval(t);
  }, [pathname, hash, key]);

  return (
    <Suspense fallback={<div className="page-loading" />}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="*" element={<SiteShell />} />
      </Routes>
    </Suspense>
  );
}
