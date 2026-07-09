import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SystemAdmin() {
  const [activeTab, setActiveTab] = useState<'publishers' | 'advertisers' | 'logs'>('publishers');
  const [publishers, setPublishers] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [advertiserSearch, setAdvertiserSearch] = useState('');
  const [advertiserSort, setAdvertiserSort] = useState<'joined' | 'publications'>('joined');
  const [advertiserSortDirection, setAdvertiserSortDirection] = useState<'asc' | 'desc'>('desc');
  const [logs, setLogs] = useState<any[]>([]);
  const [logSearch, setLogSearch] = useState('');

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
    fetchAdvertisers();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/publishers/admin/logs', { headers });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdvertisers = async () => {
    try {
      const res = await axios.get('/api/publishers/admin/advertisers', { headers });
      setAdvertisers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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
    if (!window.confirm('Are you sure you want to delete this publisher? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/publishers/${id}`, { headers });
      fetchPublishers();
    } catch (err) {
      alert('Failed to delete publisher');
    }
  };

  const handleResetTutorial = async (id: string) => {
    if (!window.confirm('Are you sure you want to reset the tutorial for this publisher?')) return;
    try {
      await axios.post(`/api/publishers/admin/publishers/${id}/reset-tutorial`, {}, { headers });
      alert('Tutorial reset successfully');
    } catch (err) {
      alert('Failed to reset tutorial');
    }
  };

  const handleToggleAdvertiserBlock = async (id: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this advertiser?`)) return;
    try {
      await axios.post(`/api/publishers/admin/advertisers/${id}/toggle-block`, { is_blocked: !currentStatus }, { headers });
      fetchAdvertisers();
    } catch (err) {
      alert('Failed to toggle block status');
    }
  };

  const filteredAdvertisers = advertisers
    .filter(a => {
      const search = advertiserSearch.toLowerCase();
      return a.email.toLowerCase().includes(search) || (a.publications && a.publications.toLowerCase().includes(search));
    })
    .sort((a, b) => {
      const dir = advertiserSortDirection === 'asc' ? 1 : -1;
      if (advertiserSort === 'publications') {
        const pubA = a.publications || '';
        const pubB = b.publications || '';
        if (pubA === pubB) {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        }
        return pubA.localeCompare(pubB) * dir;
      }
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
    });

  const handleSort = (field: 'joined' | 'publications') => {
    if (advertiserSort === field) {
      setAdvertiserSortDirection(advertiserSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setAdvertiserSort(field);
      setAdvertiserSortDirection(field === 'joined' ? 'desc' : 'asc');
    }
  };
  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(logSearch.toLowerCase()) || 
    (l.entity_id && l.entity_id.includes(logSearch)) ||
    (l.entity_type && l.entity_type.toLowerCase().includes(logSearch.toLowerCase()))
  );

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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'publishers' ? 'primary-btn' : 'secondary-btn'}`}
          onClick={() => setActiveTab('publishers')}
        >
          Manage Publishers
        </button>
        <button 
          className={`btn ${activeTab === 'advertisers' ? 'primary-btn' : 'secondary-btn'}`}
          onClick={() => setActiveTab('advertisers')}
        >
          Manage Advertisers
        </button>
        <button 
          className={`btn ${activeTab === 'logs' ? 'primary-btn' : 'secondary-btn'}`}
          onClick={() => setActiveTab('logs')}
        >
          System Logs
        </button>
      </div>

      {activeTab === 'publishers' && (
        <>
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
                      <td style={{ display: 'flex', gap: '0.5rem' }}>
                        {pub.role !== 'admin' && (
                          <>
                            <button onClick={() => handleDelete(pub.id)} className="btn danger-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Delete</button>
                            <button onClick={() => handleResetTutorial(pub.id)} className="btn secondary-btn" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Reset Tutorial</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'advertisers' && (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Registered Advertisers</h3>
            <input 
              type="text" 
              placeholder="Search by email or publication..." 
              value={advertiserSearch} 
              onChange={e => setAdvertiserSearch(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('joined')}>
                    Joined {advertiserSort === 'joined' ? (advertiserSortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('publications')}>
                    Publications {advertiserSort === 'publications' ? (advertiserSortDirection === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvertisers.map(adv => (
                  <tr key={adv.id}>
                    <td>{adv.email}</td>
                    <td>{new Date(adv.created_at).toLocaleDateString()}</td>
                    <td>{adv.publications || <span style={{ color: '#94a3b8' }}>None</span>}</td>
                    <td>
                      {adv.is_blocked ? (
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Blocked</span>
                      ) : (
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleAdvertiserBlock(adv.id, adv.is_blocked)} 
                        className={`btn ${adv.is_blocked ? 'secondary-btn' : 'danger-btn'}`}
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                      >
                        {adv.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredAdvertisers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                      No advertisers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>System Logs</h3>
            <input 
              type="text" 
              placeholder="Search action or entity..." 
              value={logSearch} 
              onChange={e => setLogSearch(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.entity_type}</td>
                    <td style={{ fontFamily: 'monospace' }}>{log.entity_id}</td>
                    <td>
                      <pre style={{ margin: 0, background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', maxWidth: '300px', overflowX: 'auto' }}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
