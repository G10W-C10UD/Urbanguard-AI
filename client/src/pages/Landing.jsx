// Landing page — UrbanGuard-AI public homepage with hero, features, and login sections
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import TrustBar from '../components/landing/TrustBar.jsx';
import FeaturesSection from '../components/landing/FeaturesSection.jsx';
import BinarySearchSection from '../components/landing/BinarySearchSection.jsx';
import AboutSection from '../components/landing/AboutSection.jsx';
import DispatchSection from '../components/landing/DispatchSection.jsx';
import LoginSection from '../components/landing/LoginSection.jsx';
import FooterSection from '../components/landing/FooterSection.jsx';

/* ─── Animated Counter Hook ─── */
function useCounter(target, duration = 2000, suffix = '') {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const isNumber = typeof target === 'number';
          const end = isNumber ? target : parseInt(target, 10);

          if (isNaN(end)) {
            setCount(target);
            return;
          }

          const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

/* ─── Stat Counter Component ─── */
function StatCounter({ value, label, suffix = '' }) {
  const isNum = !isNaN(parseInt(value, 10));
  const { count, ref } = useCounter(isNum ? parseInt(value, 10) : 0, 2000);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <span className="font-body" style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1E', lineHeight: 1, textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>
        {isNum ? count : value}{suffix}
      </span>
      <p className="font-body" style={{ color: '#64748B', fontSize: '13px', fontWeight: 400, marginTop: '6px' }}>{label}</p>
    </div>
  );
}

/* ─── Main Landing Page ─── */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen" style={{ background: '#F9F9FB' }}>
      {/* ─── Navbar ─── */}
      <nav id="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 80px' }} className="h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group" id="nav-logo">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#9D72FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="font-body text-lg" style={{ fontWeight: 800, color: '#1A1A1E' }}>
              UrbanGuard<span style={{ color: '#9D72FF' }}>-AI</span>
            </span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="font-body transition-colors" style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }} onMouseOver={e => e.target.style.color = '#1A1A1E'} onMouseOut={e => e.target.style.color = '#64748B'}>Features</a>
            <a href="#how-it-works" className="font-body transition-colors" style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }} onMouseOver={e => e.target.style.color = '#1A1A1E'} onMouseOut={e => e.target.style.color = '#64748B'}>How It Works</a>
            <a href="#about" className="font-body transition-colors" style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }} onMouseOver={e => e.target.style.color = '#1A1A1E'} onMouseOut={e => e.target.style.color = '#64748B'}>About</a>
            <a href="#login" className="font-body transition-colors" style={{ fontSize: '15px', fontWeight: 500, color: '#64748B' }} onMouseOver={e => e.target.style.color = '#1A1A1E'} onMouseOut={e => e.target.style.color = '#64748B'}>Login</a>
          </div>

          {/* CTA */}
          <a
            href="#login"
            id="nav-get-started"
            style={{ background: '#9D72FF', color: 'white', borderRadius: '9999px', padding: '10px 24px', fontSize: '15px', fontWeight: 600, boxShadow: '0 4px 16px rgba(157,114,255,0.25)', textDecoration: 'none' }}
            className="font-body hover:bg-accent-hover transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* ─── Live Ticker Bar ─── */}
      <div id="live-ticker" style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 40, background: '#F3EEFF', borderBottom: '1px solid #EDE9FF', overflow: 'hidden' }}>
        <div className="flex items-center h-10">
          {/* LIVE STATUS label */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 z-10 h-full" style={{ background: '#F3EEFF' }}>
            <span style={{ background: '#9D72FF', color: 'white', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>LIVE STATUS</span>
          </div>

          {/* Scrolling ticker */}
          <div className="ticker-track flex-1 overflow-hidden">
            <div className="ticker-content">
              <span className="ticker-item">LIVE STATUS</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">100 Assets Monitored</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">Chennai Infrastructure Grid Online</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">4 Asset Types</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">AI-Powered 24/7</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">LIVE STATUS</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">100 Assets Monitored</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">Chennai Infrastructure Grid Online</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">4 Asset Types</span>
              <span className="ticker-dot">·</span>
              <span className="ticker-item">AI-Powered 24/7</span>
              <span className="ticker-dot">·</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Section 1: Hero ─── */}
      <section
        id="hero"
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}
      >
        {/* Video Background */}
        <div className="hero-video-bg" aria-hidden="true">
          <video
            className="hero-bg-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src="/Videos/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        {/* Subtle gradient overlay */}
        <div style={{ position: 'relative', zIndex: 2 }} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(249,249,251,0) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(249,249,251,0) 100%)' }} />
        </div>

        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(157,114,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(157,114,255,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          position: 'relative',
          zIndex: 2
        }} />

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>
          {/* Top label */}
          <span className="font-body" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: '#9D72FF', background: '#F3EEFF', padding: '6px 16px', borderRadius: '9999px', marginBottom: '24px' }}>
            GOVERNMENT INFRASTRUCTURE MONITORING
          </span>

          <h1
            className="font-body"
            style={{ maxWidth: '800px', width: '100%', textAlign: 'center', margin: '0 auto 24px', lineHeight: 1.05, letterSpacing: '-0.03em' }}
          >
            <span style={{ display: 'block', fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, color: '#1A1A1E', lineHeight: 1.05, letterSpacing: '-0.03em', textShadow: '0 2px 20px rgba(255,255,255,0.8)' }}>Protecting Chennai's Infrastructure.</span>
            <span style={{ display: 'block', fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 800, color: '#9D72FF', lineHeight: 1.05, letterSpacing: '-0.03em', textShadow: '0 2px 20px rgba(255,255,255,0.8)' }}>Powered by AI.</span>
          </h1>

          {/* Subheading */}
          <p className="font-body" style={{ fontSize: '16px', color: '#64748B', maxWidth: '500px', textAlign: 'center', lineHeight: 1.7, fontWeight: 400, margin: '0 auto 40px', textShadow: '0 1px 12px rgba(255,255,255,0.9)' }}>
            Real-time monitoring, predictive anomaly detection, and AI-driven fault analysis for Chennai's critical urban infrastructure.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '64px' }}>
            <a
              href="#login"
              id="hero-explore-btn"
              className="font-body transition-all duration-300 hover:scale-105"
              style={{ background: '#9D72FF', color: 'white', borderRadius: '9999px', padding: '14px 32px', fontSize: '15px', fontWeight: 600, boxShadow: '0 4px 16px rgba(157,114,255,0.3)', textDecoration: 'none' }}
            >
              Explore Dashboard →
            </a>
            <a
              href="#how-it-works"
              id="hero-learn-btn"
              className="font-body transition-all duration-300"
              style={{ background: 'white', color: '#1A1A1E', border: '1.5px solid #E8E8F0', borderRadius: '9999px', padding: '14px 32px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}
            >
              Learn How It Works ↓
            </a>
          </div>

          {/* Stat Counters */}
          <div id="hero-stats" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '56px' }}>
            <StatCounter value={100} label="Assets Monitored" />
            <StatCounter value={5} label="Detection Methods" />
            <StatCounter value={4} label="Asset Types" />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="font-body" style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1E', lineHeight: 1, textShadow: '0 1px 8px rgba(255,255,255,0.8)' }}>24/7</span>
              <p className="font-body" style={{ color: '#64748B', fontSize: '13px', fontWeight: 400, marginTop: '6px' }}>AI-Powered</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 1: Trust Bar ─── */}
      <TrustBar />

      {/* ─── Section 2: Features ─── */}
      <FeaturesSection />

      {/* ─── Section 3: Binary Search ─── */}
      <BinarySearchSection />

      {/* ─── Section 4: About ─── */}
      <AboutSection />

      {/* ─── Section 5: Dispatch ─── */}
      <DispatchSection />

      {/* ─── Section 6: Login ─── */}
      <LoginSection />

      {/* ─── Section 7: Footer ─── */}
      <FooterSection />
    </div>
  );
}
