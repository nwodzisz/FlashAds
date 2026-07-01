import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Dynamic Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <nav className="home-nav">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5rem'}}>
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
          </svg>
          <span className="nav-logo-text">TownTicker</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn-link" onClick={() => navigate('/about')}>About</button>
          <button className="nav-btn-link" onClick={() => navigate('/research')}>Research</button>
          <button className="nav-btn-login" onClick={() => navigate('/login')}>Login</button>
          <button className="nav-btn-signup" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </nav>

      <main className="home-main">
        <section className="hero-compact">
          <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="hero-title">
              Built to save <br />
              <span className="gradient-text">Local Journalism.</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: '0 auto 2.5rem' }}>
              We believe local news is the heartbeat of every community. But the business model is broken. 
              TownTicker is our solution to fix it.
            </p>
          </div>
        </section>

        <section style={{ padding: '4rem 2rem', position: 'relative', zIndex: 10 }}>
          <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem', borderRadius: '24px', textAlign: 'left' }}>
            <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '2rem' }}>The Mission</h2>
            <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              Local publishers are leaving millions of dollars on the table because they make it too difficult for small businesses to buy advertising. 
              While the New York Times and Facebook have built automated, self-serve ad platforms, the average local newspaper still relies on PDF media kits and phone calls.
            </p>
            <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              We built TownTicker to bridge this gap. We provide a beautiful, drop-in widget that allows any local publisher—whether you run a local blog, a community newsletter, or a regional newspaper—to instantly offer self-serve advertising.
            </p>
            <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              By removing the friction, publishers can capture the long-tail of local ad budgets, and small businesses can affordably reach their neighbors. 
              It's a win-win that puts money back into local journalism.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
