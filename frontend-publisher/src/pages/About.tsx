import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Dynamic Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <Navbar />

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

        <section className="content-section">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* The Problem */}
              <div className="glass-panel about-card">
                <div className="about-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>The Problem</h2>
                  <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', margin: 0 }}>
                    Local publishers are leaving millions of dollars on the table because they make it too difficult for small businesses to buy advertising. 
                    While massive platforms have built automated, self-serve ad engines, the average local newspaper still relies on PDF media kits and phone calls.
                  </p>
                </div>
              </div>

              {/* The Solution */}
              <div className="glass-panel about-card">
                <div className="about-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>The Solution</h2>
                  <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', margin: 0 }}>
                    We built TownTicker to bridge this gap. We provide a beautiful, drop-in widget that allows any local publisher—whether you run a local blog, a community newsletter, or a regional newspaper—to instantly offer self-serve advertising directly on your site.
                  </p>
                </div>
              </div>

              {/* The Impact */}
              <div className="glass-panel about-card">
                <div className="about-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#0f172a', marginTop: 0, marginBottom: '1rem' }}>The Impact</h2>
                  <p style={{ color: '#475569', fontSize: '1.15rem', lineHeight: '1.7', margin: 0 }}>
                    By removing the friction, publishers can capture the long-tail of local ad budgets, and small businesses can affordably reach their neighbors. 
                    It's a win-win that puts money back into local journalism and revitalizes local economies.
                  </p>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
              <button className="btn-primary-large" onClick={() => navigate('/signup')}>
                Join the Movement
              </button>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
