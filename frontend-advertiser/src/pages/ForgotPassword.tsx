import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a reset link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center', color: '#0f172a' }}>Forgot Password</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#64748b' }}>Enter your email address to receive a password reset link.</p>
      
      {message && <div className="success-text" style={{ marginBottom: '1rem', background: '#dcfce7', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>{message}</div>}
      {error && <div className="error-text" style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <button type="submit" className="btn primary-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/login" className="text-btn">Back to Login</Link>
      </div>
    </div>
  );
}
