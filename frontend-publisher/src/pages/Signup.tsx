import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, domain, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('id', res.data.id);
      if (res.data.publisher_id) {
        localStorage.setItem('publisher_id', res.data.publisher_id);
      }
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('config', JSON.stringify(res.data.config));
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignup} className="login-form">
        <h2>Create Publisher Account</h2>
        {error && <div className="error-alert">{error}</div>}
        <div className="form-group">
          <label>Publication Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Website Domain</label>
          <input type="text" value={domain} onChange={e => setDomain(e.target.value)} required placeholder="e.g. localnews.com" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn primary-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" className="text-btn" style={{ padding: 0 }}>Log In</Link>
        </p>
      </form>
    </div>
  );
}
