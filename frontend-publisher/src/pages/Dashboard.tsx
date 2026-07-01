import { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import ConfigBuilder from '../components/ConfigBuilder';
import WidgetPreview from '../components/WidgetPreview';

export default function Dashboard() {
  const publisherId = localStorage.getItem('publisher_id');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [config, setConfig] = useState<any>({});
  const [hasStripe, setHasStripe] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPublisherInfo();
    fetchAds();
  }, [publisherId]);

  const fetchPublisherInfo = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/publishers/${publisherId}`);
      setConfig(res.data.config);
      setHasStripe(res.data.has_stripe);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/publishers/${publisherId}/ads`, { headers });
      setAds(res.data);
    } catch (err) {
      console.error('Failed to fetch ads', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    try {
      const res = await axios.post(`http://localhost:3001/api/publishers/${publisherId}/onboard`, {}, { headers });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate Stripe onboarding.');
    }
  };

  const handleReject = async (adId: string) => {
    if (!window.confirm('Are you sure you want to reject this ad? It will be refunded.')) return;
    try {
      await axios.post(`http://localhost:3001/api/publishers/${publisherId}/ads/${adId}/reject`, {}, { headers });
      fetchAds();
    } catch (err) {
      alert('Failed to reject ad.');
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.put(`http://localhost:3001/api/publishers/${publisherId}/config`, { config }, { headers });
      alert('Configuration saved successfully!');
    } catch (err) {
      alert('Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const activeAdsCount = ads.filter(a => a.status === 'active').length;
  const totalAdsSold = ads.filter(a => a.status !== 'rejected').length;
  const totalRevenueCents = ads.reduce((sum, ad) => {
    if (ad.status !== 'rejected') return sum + ad.price_cents;
    return sum;
  }, 0);
  const totalRevenue = (totalRevenueCents / 100).toFixed(2);

  return (
    <div className="dashboard-layout">
      <div className="panel actions-panel">
        <h2>Stripe Connect</h2>
        {hasStripe ? (
          <p className="success-text">Stripe account connected!</p>
        ) : (
          <p className="warning-text">You need to connect your Stripe account to receive payouts.</p>
        )}
        <button onClick={handleOnboard} className="btn primary-btn">
          {hasStripe ? 'Edit Payouts' : 'Onboard Now'}
        </button>
      </div>

      <div className="panel analytics-panel">
        <h2>General Analytics</h2>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>${totalRevenue}</p>
          </div>
          <div className="stat-card">
            <h3>Active Ads</h3>
            <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{activeAdsCount}</p>
          </div>
          <div className="stat-card">
            <h3>Total Ads Sold</h3>
            <p className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{totalAdsSold}</p>
          </div>
        </div>
      </div>

      <div className="panel embed-panel">
        <h2>Embed Your Widget</h2>
        <p>Copy and paste this code anywhere on your website to display your active ads.</p>
        <div style={{ position: 'relative' }}>
          <textarea 
            readOnly 
            rows={3} 
            style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', cursor: 'text' }}
            value={`<div id="townticker-widget" data-publisher="${publisherId}"></div>\n<script src="http://localhost:3001/widget/widget.js"></script>`}
          />
          <button 
            className="btn secondary-btn small-btn" 
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => {
              navigator.clipboard.writeText(`<div id="townticker-widget" data-publisher="${publisherId}"></div>\n<script src="http://localhost:3001/widget/widget.js"></script>`);
              alert('Copied to clipboard!');
            }}
          >
            Copy
          </button>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
          <strong>Advertiser Portal Link:</strong> Share this link with businesses so they can buy ads from you: <br/>
          <a href={`http://localhost:5173/?publisher=${publisherId}`} target="_blank" className="text-btn">http://localhost:5173/?publisher={publisherId}</a>
        </p>
      </div>

      <div className="panel config-panel">
        <h2>Modular Configuration</h2>
        <p>Customize your ad portal and widget dynamically.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem', alignItems: 'start' }}>
          <div>
            <ConfigBuilder config={config} onChange={handleConfigChange} />
            <button onClick={saveConfig} className="btn primary-btn" disabled={saving} style={{ marginTop: '2rem' }}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
          <div style={{ position: 'sticky', top: '2rem' }}>
            <WidgetPreview 
              config={config} 
              dummyAds={ads.filter(a => a.status === 'active').length > 0 
                ? ads.filter(a => a.status === 'active').slice(0, 3) 
                : [{ data: { headline: 'Support Local', body_text: 'Buy a digital ad today! This is a preview of what your active ads will look like.', link_url: '#' } }]} 
            />
          </div>
        </div>
      </div>

      <div className="panel ads-panel">
        <h2>Ad Moderation Queue</h2>
        {loading ? <LoadingScreen /> : (
          <table className="ads-table">
            <thead>
              <tr>
                <th>Ad Data</th>
                <th>Status</th>
                <th>Price</th>
                <th>Tier</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 && (
                <tr>
                  <td colSpan={5}>No ads found.</td>
                </tr>
              )}
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td><pre>{JSON.stringify(ad.data, null, 2)}</pre></td>
                  <td>
                    <span className={`status-badge status-${ad.status}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td>${(ad.price_cents / 100).toFixed(2)}</td>
                  <td>{ad.tier}</td>
                  <td>
                    {(ad.status === 'active' || ad.status === 'pending_payment') && (
                      <button 
                        onClick={() => handleReject(ad.id)} 
                        className="btn danger-btn"
                      >
                        Reject & Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
