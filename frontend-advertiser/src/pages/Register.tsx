import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const publisher_id = sessionStorage.getItem('last_publisher_id');
      const payload: any = { email, password };
      if (publisher_id) payload.publisher_id = publisher_id;
      const res = await axios.post('/api/advertisers/register', payload);
      login(res.data.token, res.data.advertiser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-panel">
      <h2 style={{ marginBottom: '1.5rem', color: '#111827', textAlign: 'center' }}>Create Advertiser Account</h2>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: '#fef2f2', borderRadius: '4px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <button type="submit" disabled={loading} className="btn primary-btn" style={{ width: '100%' }}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        Already have an account? <Link to="/login" style={{ color: '#0284c7' }}>Login here</Link>
      </div>
    </div>
  );
}

export default Register;
