import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SystemAdmin() {
  const [publishers, setPublishers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const res = await axios.get('/api/publishers', { headers });
      setPublishers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/publishers', { name, domain, email, password }, { headers });
      fetchPublishers();
      setName(''); setDomain(''); setEmail(''); setPassword('');
    } catch (err) {
      alert('Failed to create publisher');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`/api/publishers/${id}`, { headers });
      fetchPublishers();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/admin/invite', { email: adminEmail, password: adminPassword }, { headers });
      setAdminEmail(''); setAdminPassword('');
      alert('System Admin created successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create admin');
    }
  };

  const totalViews = publishers.reduce((acc, pub) => acc + (parseInt(pub.total_views) || 0), 0);
  const totalClicks = publishers.reduce((acc, pub) => acc + (parseInt(pub.total_clicks) || 0), 0);
  const totalRevenue = publishers.reduce((acc, pub) => acc + (parseInt(pub.total_revenue_cents) || 0), 0);

  return (
    <div className="system-admin">
      <h2>System Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Total Network Views</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#111827' }}>
            {totalViews.toLocaleString()}
          </p>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Total Network Clicks</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#111827' }}>
            {totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '1rem' }}>Total Network Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#111827' }}>
            ${(totalRevenue / 100).toFixed(2)}
          </p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        <div className="panel" style={{ marginBottom: 0 }}>
          <h3>Add Publisher</h3>
          <form onSubmit={handleCreate} className="admin-form">
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="Domain" value={domain} onChange={e => setDomain(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn primary-btn">Create Publisher</button>
          </form>
        </div>

        <div className="panel" style={{ marginBottom: 0 }}>
          <h3>Add System Admin</h3>
          <form onSubmit={handleCreateAdmin} className="admin-form">
            <input type="email" placeholder="Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
            <button type="submit" className="btn primary-btn" style={{ marginTop: 'auto' }}>Create Admin</button>
          </form>
        </div>
      </div>

      <div className="panel mt-4" style={{ marginTop: '2rem' }}>
        <h3>Publishers</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Domain</th><th>Views</th><th>Clicks</th><th>Revenue</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {publishers.map(pub => (
                <tr key={pub.id}>
                  <td>{pub.name}</td>
                  <td>{pub.domain}</td>
                  <td>{parseInt(pub.total_views || 0).toLocaleString()}</td>
                  <td>{parseInt(pub.total_clicks || 0).toLocaleString()}</td>
                  <td>${((parseInt(pub.total_revenue_cents || 0)) / 100).toFixed(2)}</td>
                  <td>
                    {pub.role !== 'admin' && (
                      <button onClick={() => handleDelete(pub.id)} className="btn danger-btn">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
