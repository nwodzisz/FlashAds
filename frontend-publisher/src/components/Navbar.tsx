import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayfulLogo from './PlayfulLogo';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="home-nav">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <PlayfulLogo width="28" height="28" style={{ marginRight: '0.5rem' }} className="brand-logo-svg" />
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
