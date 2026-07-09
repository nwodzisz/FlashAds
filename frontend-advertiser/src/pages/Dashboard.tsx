import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const { advertiser, token } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!advertiser) {
      navigate('/login');
      return;
    }

    const fetchAds = async () => {
      try {
        const res = await axios.get('/api/advertisers/ads', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAds(res.data);
      } catch (err) {
        console.error('Failed to fetch ads', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [advertiser, navigate, token]);

  if (!advertiser) return null;

  const totalSpent = ads.reduce((acc, ad) => acc + ad.price_cents, 0) / 100;
  const totalViews = ads.reduce((acc, ad) => acc + ad.views, 0);
  const totalClicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <h1 style={{ color: '#111827', margin: 0 }}>Advertiser Dashboard</h1>
        <Link to="/" className="btn primary-btn small-btn" style={{ whiteSpace: 'nowrap' }}>Buy New Ad</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <h3 style={{ color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Spent</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0ea5e9' }}>${totalSpent.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Impressions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{totalViews.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3 style={{ color: '#64748b', fontSize: '0.875rem', textTransform: 'uppercase' }}>Total Clicks</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{totalClicks.toLocaleString()}</p>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Your Ads</h2>
        {loading ? (
          <p>Loading ads...</p>
        ) : ads.length === 0 ? (
          <p style={{ color: '#64748b' }}>You haven't purchased any ads yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', color: '#475569' }}>Ad Tier</th>
                  <th style={{ padding: '1rem', color: '#475569' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#475569' }}>Price</th>
                  <th style={{ padding: '1rem', color: '#475569' }}>Impressions</th>
                  <th style={{ padding: '1rem', color: '#475569' }}>Clicks</th>
                  <th style={{ padding: '1rem', color: '#475569' }}>Purchased On</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{ad.tier}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        backgroundColor: ad.status === 'active' ? '#dcfce7' : ad.status === 'pending_payment' ? '#fef3c7' : '#f1f5f9',
                        color: ad.status === 'active' ? '#166534' : ad.status === 'pending_payment' ? '#92400e' : '#475569'
                      }}>
                        {ad.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>${(ad.price_cents / 100).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>{ad.views.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>{ad.clicks.toLocaleString()}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(ad.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
