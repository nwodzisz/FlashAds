import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SystemAdmin from './pages/SystemAdmin';
import Home from './pages/Home';
import Settings from './pages/Settings';
import About from './pages/About';
import Research from './pages/Research';
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

  return (
    <div className={isPublicPage ? "" : "app-container"}>
      {!isPublicPage && (
        <header className="app-header">
          <div className="header-brand">
            <h1 style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.75rem'}}>
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
              </svg>
              TownTicker Dashboard
            </h1>
            <p>Manage your TownTicker and Revenue</p>
          </div>
          {token && (
            <div className="header-actions">
              {role === 'admin' && <a href="/system" className="btn text-btn">System Admin</a>}
              <a href="/dashboard" className="btn text-btn">My Dashboard</a>
              <a href="/settings" className="btn text-btn">Settings</a>
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
