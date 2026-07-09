import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/auth/reset-password', { token, newPassword });
      setMessage(res.data.message || 'Password has been successfully reset.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', background: '#fff', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a' }}>Invalid Link</h2>
        <p style={{ color: '#ef4444' }}>No reset token provided.</p>
        <Link to="/forgot-password" className="text-btn">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', textAlign: 'center', color: '#0f172a' }}>Reset Password</h2>
      
      {message ? (
        <div style={{ textAlign: 'center' }}>
          <div className="success-text" style={{ marginBottom: '1rem', background: '#dcfce7', padding: '0.75rem', borderRadius: '8px' }}>{message}</div>
          <p>Redirecting to login...</p>
        </div>
      ) : (
        <>
          {error && <div className="error-text" style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
