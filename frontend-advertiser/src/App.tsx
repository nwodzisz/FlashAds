import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import SubmitAd from './pages/SubmitAd';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import AccountSettings from './pages/AccountSettings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function Navbar() {
  const { advertiser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#111827', fontSize: '1.25rem' }}></Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        {advertiser ? (
          <>
            <span style={{ color: '#64748b' }} className="d-none-sm">{advertiser.email}</span>
            <Link to="/dashboard" className="text-btn">Dashboard</Link>
            <Link to="/account" className="text-btn">Settings</Link>
            <button onClick={handleLogout} className="text-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-btn" style={{ textDecoration: 'none', color: '#475569', fontWeight: 'bold' }}>Login</Link>
            <Link to="/register" className="btn primary-btn small-btn" style={{ width: 'auto' }}>Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SubmitAd />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/account" element={<AccountSettings />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
