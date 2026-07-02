import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    email: '',
    password: ''
  });
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newMember, setNewMember] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [teamMessage, setTeamMessage] = useState({ type: '', text: '' });
  
  const publisherId = localStorage.getItem('publisher_id');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('id');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/publishers/${publisherId}/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({ name: data.name || '', domain: data.domain || '', email: data.email || '', password: '' });
        }
        
        // Fetch team members
        const teamRes = await fetch(`/api/publishers/${publisherId}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeamMembers(teamData);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [publisherId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/publishers/${publisherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setTeamMessage({ type: '', text: '' });

    try {
      const res = await fetch(`/api/publishers/${publisherId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      if (res.ok) {
        setTeamMessage({ type: 'success', text: 'Team member invited successfully!' });
        setTeamMembers([...teamMembers, data]);
        setNewMember({ email: '', password: '' });
      } else {
        setTeamMessage({ type: 'error', text: data.error || 'Failed to invite team member' });
      }
    } catch (err) {
      setTeamMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setInviting(false);
    }
  };
  
  const handleRemoveMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`/api/publishers/${publisherId}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove team member');
      }
    } catch (err) {
      alert('Network error occurred');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Account Settings */}
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>My Settings & Organization</h2>
      
      {message.text && (
        <div style={{
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: message.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${message.type === 'error' ? '#f87171' : '#4ade80'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Organization Settings</h3>
        <div className="form-group">
          <label>Publisher Name</label>
          <input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Website Domain</label>
          <input 
            type="text" 
            name="domain"
            value={formData.domain} 
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        
        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', margin: '1rem 0 0.5rem' }}>My Profile</h3>
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>New Password (Leave blank to keep current)</label>
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <button type="submit" className="btn primary-btn" disabled={saving} style={{ marginTop: '1rem' }}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Team Members */}
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 600 }}>Team Members</h2>
      <div className="panel" style={{ marginBottom: '3rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="queue-table" style={{ marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.email} {member.id === userId ? '(You)' : ''}</td>
                <td>{member.role}</td>
                <td>{new Date(member.created_at).toLocaleDateString()}</td>
                <td>
                  {member.id !== userId && (
                    <button onClick={() => handleRemoveMember(member.id)} className="btn danger-btn small-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Invite New Member</h3>
        
        {teamMessage.text && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '4px',
            backgroundColor: teamMessage.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: teamMessage.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${teamMessage.type === 'error' ? '#f87171' : '#4ade80'}`
          }}>
            {teamMessage.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="invite-form">
          <div className="form-group invite-form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={newMember.email} 
              onChange={handleNewMemberChange}
              required
              className="input-field"
            />
          </div>
          <div className="form-group invite-form-group">
            <label>Temporary Password</label>
            <input 
              type="password" 
              name="password"
              value={newMember.password} 
              onChange={handleNewMemberChange}
              required
              className="input-field"
            />
          </div>
          <button type="submit" className="btn secondary-btn invite-btn" disabled={inviting}>
            {inviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>
      </div>
    </div>
  );
}
