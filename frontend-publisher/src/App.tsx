import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SystemAdmin from './pages/SystemAdmin';
import Home from './pages/Home';
import Settings from './pages/Settings';
import About from './pages/About';
import Research from './pages/Research';
import FAQ from './pages/FAQ';
import PlayfulLogo from './components/PlayfulLogo';
import './index.css';

function PrivateRoute({ children, adminOnly = false }: { children: any, adminOnly?: boolean }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
}

function AppContent() {
  const location = useLocation();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isPublicPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/research';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={isPublicPage ? "" : "app-container"}>
      {!isPublicPage && (
        <header className="app-header">
          <div className="header-brand">
            <div className="header-brand-top">
              <h1 style={{ display: 'flex', alignItems: 'center' }}>
                <PlayfulLogo width="45" height="45" style={{ marginRight: '0.75rem' }} className="brand-logo-svg" />
                TownTicker Dashboard
              </h1>
              {token && (
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isMenuOpen ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
            <p>Manage your TownTicker and Revenue</p>
          </div>
          {token && (
            <div className={`header-actions ${isMenuOpen ? 'open' : ''}`}>
              {role === 'admin' && <a href="/system" className="btn text-btn">System Admin</a>}
              <a href="/dashboard" className="btn text-btn">My Dashboard</a>
              <a href="/settings" className="btn text-btn">Settings</a>
              <a href="/faq" className="btn text-btn">FAQ</a>
              <button onClick={handleLogout} className="btn secondary-btn">Logout</button>
            </div>
          )}
        </header>
      )}
      <main className={isPublicPage ? "" : "app-main"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/system" element={<PrivateRoute adminOnly={true}><SystemAdmin /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/faq" element={<PrivateRoute><FAQ /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
