import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Dynamic Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <nav className="home-nav">
        <div className="nav-logo">
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
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Unlock the 99% of local ad budgets <br />
              <span className="gradient-text">you are currently missing.</span>
            </h1>
            <p className="hero-subtitle">
              TownTicker is a drop-in widget that lets local businesses buy affordable, self-serve ads directly on your site. Monetize the businesses who can't afford your $1,500 packages.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-large" onClick={() => navigate('/signup')}>
                Start Monetizing Now
              </button>
            </div>
            
            <div className="social-proof-badges">
              <span className="badge-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Built for Local Publishers
              </span>
              <span className="badge-pill">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                Powered by Stripe Connect
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mobile-mockup">
              <div className="mobile-header">
                <div className="mobile-notch"></div>
              </div>
              <div className="mobile-body">
                <div className="news-site-header">
                  <div className="news-logo"></div>
                  <div className="news-menu"><span></span><span></span><span></span></div>
                </div>
                <div className="news-content">
                  <div className="news-title"></div>
                  <div className="news-text-line"></div>
                  <div className="news-text-line short"></div>
                  
                  {/* TownTicker Widget Injected */}
                  <div className="mockup-widget">
                    <div className="widget-header">
                      <span className="widget-badge">Ad</span>
                      <span className="widget-brand">By TownTicker</span>
                    </div>
                    <div className="widget-img"></div>
                    <div className="widget-text"></div>
                    <div className="widget-text short"></div>
                    <div className="widget-btn"></div>
                  </div>

                  <div className="news-text-line"></div>
                  <div className="news-text-line"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE PROBLEM SECTION */}
        <section className="problem-section" style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', color: '#0f172a' }}>The local news blind spot.</h2>
          
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            <div className="comparison-card bad-way" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2.5rem', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
              </div>
              <h3 style={{ color: '#b91c1c', fontSize: '1.5rem', marginTop: 0 }}>The Absurd Friction</h3>
              <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>
                If a local coffee shop wants to quickly post an ad in the local paper, they have to find the "Contact Us" page, email a generic <code>sales@</code> address, wait 48 hours for a media kit, and then get pitched a massive "print-and-digital bundle" they don't have the budget for. They give up and leave.
              </p>
            </div>

            <div className="comparison-card good-way" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2.5rem', borderRadius: '16px', textAlign: 'left' }}>
              <div style={{ color: '#3b82f6', marginBottom: '1.5rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M9 10l2 2 4-4"></path></svg>
              </div>
              <h3 style={{ color: '#1d4ed8', fontSize: '1.5rem', marginTop: 0 }}>The TownTicker Way</h3>
              <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>
                If that same coffee shop opens your website, they can tap three buttons in the TownTicker widget, pay an affordable rate, and have an ad running to people in their zip code in 5 minutes. No PDFs. No phone calls. Just instant, automated sales.
              </p>
            </div>
            
          </div>
          
          <h3 style={{ marginTop: '4rem', fontSize: '2rem', color: '#0f172a', fontWeight: 600, maxWidth: '900px', margin: '4rem auto 0' }}>
            83% of local businesses spend their ad budgets on Facebook because it is self-serve. <br/>
            <span className="gradient-text">Bring them back.</span>
          </h3>
        </section>

        {/* FEATURES SECTION */}
        <section className="features">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#3b82f6' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3>Zero Code Setup</h3>
              <p>Just copy and paste a single script tag into your website. We handle the rendering, the forms, and the database.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#3b82f6' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <h3>Instant Stripe Checkouts</h3>
              <p>Powered by Stripe Connect. Advertisers buy affordable placements directly on your site, and the money deposits straight into your bank account.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: '#3b82f6' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path><path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path><path d="M14 12h8"></path><path d="M2 12h2"></path><path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path><path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93"></path></svg>
              </div>
              <h3>Fully Customizable</h3>
              <p>Define exactly what fields advertisers must fill out (images, text, links), and set your own duration tiers and accessible pricing (e.g., $50 for 3 days).</p>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', borderRadius: '24px', position: 'relative' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '1rem', marginTop: 0 }}>Ready to capture the self-serve ad market?</h2>
            <p style={{ color: '#475569', fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Turn your website into a 24/7 self-serve revenue stream with zero upfront costs.
            </p>
            <button className="btn-primary-large" onClick={() => navigate('/signup')}>
              Create Your Free Account
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
