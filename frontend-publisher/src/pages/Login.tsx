import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('id', res.data.id);
      if (res.data.publisher_id) {
        localStorage.setItem('publisher_id', res.data.publisher_id);
      }
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('config', JSON.stringify(res.data.config));
      
      window.location.href = res.data.role === 'admin' ? '/system' : '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Sign In</h2>
        {error && <div className="error-alert">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn primary-btn">Login</button>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/signup" className="text-btn" style={{ padding: 0 }}>Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
