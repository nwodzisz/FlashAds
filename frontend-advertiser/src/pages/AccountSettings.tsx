import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

export default function AccountSettings() {
  const { advertiser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adv_token');
      const res = await axios.get('/api/advertisers/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({
        name: res.data.name || '',
        company_name: res.data.company_name || '',
        email: res.data.email || '',
        password: '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('adv_token');
      await axios.put('/api/advertisers/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully.');
      setFormData({ ...formData, password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!advertiser) {
    return <p style={{ textAlign: 'center' }}>Please log in to view account settings.</p>;
  }

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading profile...</p>;
  }

  return (
    <div className="auth-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Account Settings</h2>
      
      {message && <div className="success-text" style={{ marginBottom: '1rem', background: '#dcfce7', padding: '0.75rem', borderRadius: '8px' }}>{message}</div>}
      {error && <div className="error-text" style={{ marginBottom: '1rem', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label>Your Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>
        
        <div className="form-group">
          <label>Company Name</label>
          <input 
            type="text" 
            name="company_name"
            value={formData.company_name} 
            onChange={handleChange}
            placeholder="Acme Corp"
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password (Optional)</label>
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <button type="submit" className="btn primary-btn" disabled={saving} style={{ marginTop: '1rem' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
