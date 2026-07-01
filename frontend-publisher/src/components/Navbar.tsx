import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="home-nav">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5rem'}}>
          <defs>
            <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path d="m3 11 18-5v12L3 14v-3z"></path>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
        </svg>
        <span className="nav-logo-text">TownTicker</span>
      </div>
      
      <div className={`nav-links ${isOpen ? 'active' : ''}`}>
        <button className="nav-btn-link" onClick={() => { setIsOpen(false); navigate('/about'); }}>About</button>
        <button className="nav-btn-link" onClick={() => { setIsOpen(false); navigate('/research'); }}>Research</button>
        <button className="nav-btn-login" onClick={() => { setIsOpen(false); navigate('/login'); }}>Login</button>
        <button className="nav-btn-signup" onClick={() => { setIsOpen(false); navigate('/signup'); }}>Get Started</button>
      </div>

      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}
