import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import ConfigBuilder from '../components/ConfigBuilder';
import WidgetPreview from '../components/WidgetPreview';
import TutorialOverlay from '../components/TutorialOverlay';

export default function Dashboard() {
  const publisherId = localStorage.getItem('publisher_id');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [ads, setAds] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [advertiserSearch, setAdvertiserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState<any>({});
  const [userSettings, setUserSettings] = useState<any>({});
  const [hasStripe, setHasStripe] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchPublisherInfo(),
        fetchUserInfo(),
        fetchAds(),
        fetchAdvertisers()
      ]);
      setLoading(false);
    };
    init();
  }, [publisherId]);

  const fetchPublisherInfo = async () => {
    try {
      const res = await axios.get(`/api/publishers/${publisherId}`);
      setConfig(res.data.config);
      setHasStripe(res.data.has_stripe);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get('/api/auth/me', { headers });
      setUserSettings(res.data.settings || {});
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await axios.get(`/api/publishers/${publisherId}/ads`, { headers });
      setAds(res.data);
    } catch (err) {
      console.error('Failed to fetch ads', err);
    }
  };

  const fetchAdvertisers = async () => {
    try {
      const res = await axios.get(`/api/publishers/${publisherId}/advertisers`, { headers });
      setAdvertisers(res.data);
    } catch (err) {
      console.error('Failed to fetch advertisers', err);
    }
  };

  const handleToggleAdvertiserBlock = async (email: string, currentStatus: boolean) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this advertiser?`)) return;
    try {
      await axios.post(`/api/publishers/${publisherId}/advertisers/toggle-block`, { email, is_blocked: !currentStatus }, { headers });
      fetchAdvertisers();
    } catch (err) {
      alert('Failed to toggle block status');
    }
  };

  const handleOnboard = async () => {
    try {
      const res = await axios.post(`/api/publishers/${publisherId}/onboard`, {}, { headers });
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
      await axios.post(`/api/publishers/${publisherId}/ads/${adId}/reject`, {}, { headers });
      setAds(ads.filter((a: any) => a.id !== adId));
    } catch (error) {
      console.error(error);
      alert('Failed to reject and refund ad');
    }
  };

  const handleRefund = async (adId: string) => {
    if (!confirm('Are you sure you want to refund this ad?')) return;
    try {
      await axios.post(`/api/publishers/${publisherId}/ads/${adId}/refund`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Refresh ads
      const res = await axios.get(`/api/publishers/${publisherId}/ads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAds(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to refund ad');
    }
  };

  const tiers = config.tiers || [];

  const addTier = () => {
    handleConfigChange('tiers', [...tiers, { id: 'new-tier', name: 'New Tier', duration_hours: 24, price_cents: 1000 }]);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    handleConfigChange('tiers', newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    handleConfigChange('tiers', newTiers);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('logo', file);
    try {
      setSaving(true);
      const res = await axios.post(`/api/publishers/${publisherId}/logo`, formData, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      handleConfigChange('formConfig', { ...config.formConfig, logoUrl: res.data.url });
    } catch (err) {
      console.error(err);
      alert('Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const completeTutorial = async () => {
    const newSettings = { ...userSettings, tutorial_completed: true };
    setUserSettings(newSettings);
    try {
      await axios.put(`/api/auth/me/settings`, { settings: { tutorial_completed: true } }, { headers });
    } catch (err) {
      console.error('Failed to save tutorial completion', err);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/publishers/${publisherId}/config`, { config }, { headers });
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

  const chartData = useMemo(() => {
    const dataByDate: Record<string, number> = {};
    ads.forEach(ad => {
      if (ad.status !== 'rejected' && ad.created_at) {
        const d = new Date(ad.created_at);
        const dateKey = d.toISOString().split('T')[0];
        if (!dataByDate[dateKey]) dataByDate[dateKey] = 0;
        dataByDate[dateKey] += (ad.price_cents / 100);
      }
    });

    return Object.keys(dataByDate).sort().map(key => {
      const [y, m, d] = key.split('-');
      const dateStr = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        sales: dataByDate[key]
      };
    });
  }, [ads]);

  return (
    <div className="dashboard-layout">
      <div className="panel actions-panel" id="tour-stripe">
        <h2>Stripe Connect</h2>
        {hasStripe ? (
          <p className="success-text">Stripe account connected!</p>
        ) : (
          <p className="warning-text">You need to connect your Stripe account to receive payouts.</p>
        )}
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          TownTicker retains a 20% platform fee on all ad sales.
        </p>
        <button onClick={handleOnboard} className="btn primary-btn">
          {hasStripe ? 'Edit Payouts' : 'Onboard Now'}
        </button>
      </div>

      <div className="panel analytics-panel">
        <h2>General Analytics</h2>
        <div className="analytics-content">
          <div className="stats-grid">
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

          {chartData.length > 0 && (
            <div className="analytics-chart">
              <h3 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '1rem' }}>Sales Over Time</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="panel embed-panel" id="tour-widget">
        <h2>Embed Your Widget</h2>
        <p>Copy and paste this code anywhere on your website to display your active ads.</p>
        <div style={{ position: 'relative' }}>
          <textarea
            readOnly
            rows={3}
            style={{
              fontFamily: 'monospace',
              backgroundColor: '#f1f5f9',
              cursor: 'text',
              width: '100%',
              padding: '1rem',
              paddingRight: '80px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            value={`<div id="townticker-widget" data-publisher="${publisherId}"></div>\n<script src="${window.location.origin}/widget/widget.js"></script>`}
          />
          <button
            className="btn secondary-btn small-btn pulse-highlight"
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={() => {
              navigator.clipboard.writeText(`<div id="townticker-widget" data-publisher="${publisherId}"></div>\n<script src="${window.location.origin}/widget/widget.js"></script>`);
              alert('Copied to clipboard!');
            }}
          >
            Copy
          </button>
        </div>

        <div style={{ position: 'relative', marginTop: '1.5rem' }}>
          <svg
            className="arrow-bounce-down"
            style={{ position: 'absolute', left: '160px', top: '-35px', pointerEvents: 'none', zIndex: 10, filter: 'drop-shadow(0px 8px 12px rgba(255, 87, 34, 0.5))' }}
            width="45" height="45" viewBox="0 0 24 24" fill="url(#gradient-arrow)"
          >
            <path d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V14.1716L6.41421 9.58579C6.02369 9.19526 5.39052 9.19526 5 9.58579C4.60948 9.97631 4.60948 10.6095 5 11L11.2929 17.2929C11.6834 17.6834 12.3166 17.6834 12.7071 17.2929L19 11C19.3905 10.6095 19.3905 9.97631 19 9.58579C18.6095 9.19526 17.9763 9.19526 17.5858 9.58579L13 14.1716V3Z" />
          </svg>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <strong>Advertiser Portal Link:</strong> Share this link with businesses so they can buy ads from you: <br />
            <a href={`${import.meta.env.VITE_ADVERTISER_URL || 'http://towntickerclient.nathanwodzisz.com'}/?publisher=${publisherId}`} target="_blank" className="text-btn pulse-highlight" style={{ wordBreak: 'break-all', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', marginLeft: '-6px' }}>
              {`${import.meta.env.VITE_ADVERTISER_URL || 'http://towntickerclient.nathanwodzisz.com'}/?publisher=${publisherId}`}
            </a>
          </p>
        </div>

        <div style={{ marginTop: '2rem', maxWidth: '900px', margin: '2rem auto 0' }}>
          <WidgetPreview
            config={config}
            dummyAds={(() => {
              const maxAds = config?.widgetConfig?.maxAds || 3;
              const activeAds = ads.filter(a => a.status === 'active');
              const schema = config.adSchema || [];
              const dummies = [
                { _defaultHeadline: 'Support Local', _defaultBody: 'Buy a digital ad today!' },
                { _defaultHeadline: 'Downtown Bakery', _defaultBody: 'Fresh bread and pastries every morning.' },
                { _defaultHeadline: 'City Plumbing', _defaultBody: '24/7 emergency service. We fix leaks fast.' }
              ];

              return Array.from({ length: maxAds }).map((_, i) => {
                if (i < activeAds.length) {
                  return activeAds[i];
                }

                const dummy = dummies[i % dummies.length];
                const data: any = {};
                schema.forEach((field: any) => {
                  if (field.type === 'file' || field.name.toLowerCase().includes('image')) {
                    data[field.name] = 'https://placehold.co/600x400/e2e8f0/64748b?text=Preview+Image';
                  } else if (field.type === 'url' || field.name.toLowerCase().includes('link')) {
                    data[field.name] = '#';
                  } else if (field.name.toLowerCase().includes('phone')) {
                    data[field.name] = '555-123-4567';
                  } else if (field.name.toLowerCase().includes('title') || field.name.toLowerCase().includes('headline')) {
                    data[field.name] = dummy._defaultHeadline;
                  } else if (field.name.toLowerCase().includes('body') || field.name.toLowerCase().includes('desc')) {
                    data[field.name] = dummy._defaultBody;
                  } else {
                    data[field.name] = `Sample ${field.label}`;
                  }
                });

                if (!schema.find((f: any) => f.name.toLowerCase().includes('headline') || f.name.toLowerCase().includes('title'))) {
                  data.headline = dummy._defaultHeadline;
                }
                if (!schema.find((f: any) => f.name.toLowerCase().includes('body') || f.name.toLowerCase().includes('desc'))) {
                  data.body_text = dummy._defaultBody;
                }

                return { data };
              });
            })()}
          />
        </div>
      </div>

      <div className="panel queue-panel" style={{ marginBottom: '2rem' }}>
        <h2>Ad Moderation Queue</h2>
        {loading ? <LoadingScreen /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="queue-table">
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
                {Array.isArray(ads) && ads.map((ad) => {
                  const isExpired = ad.status === 'active' && ad.end_time && new Date(ad.end_time).getTime() < Date.now();
                  const displayStatus = isExpired ? 'expired' : ad.status;
                  return (
                    <tr key={ad.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '200px' }}>
                          {Object.entries(ad.data || {}).map(([key, val]: [string, any]) => {
                            const valStr = String(val);
                            const isImage = valStr.startsWith('/uploads/') || /\.(jpeg|jpg|gif|png|webp)$/i.test(valStr);
                            const isUrl = valStr.startsWith('http://') || valStr.startsWith('https://');

                            return (
                              <div key={key} style={{ fontSize: '0.875rem' }}>
                                <strong>{key.replace(/_/g, ' ')}: </strong>
                                {isImage ? (
                                  <a href={valStr} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View Image</a>
                                ) : isUrl ? (
                                  <a href={valStr} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>View Link</a>
                                ) : (
                                  <span style={{ color: '#475569' }}>{valStr}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${displayStatus}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td>${(ad.price_cents / 100).toFixed(2)}</td>
                      <td>{ad.tier}</td>
                      <td>
                        {(ad.status === 'pending_payment' || (ad.status === 'active' && !isExpired)) && (
                          <button
                            onClick={() => handleReject(ad.id)}
                            className="btn danger-btn"
                          >
                            Reject & Refund
                          </button>
                        )}
                        {((ad.status === 'active' && isExpired) || ad.status === 'expired') && (
                          <button
                            onClick={() => handleRefund(ad.id)}
                            className="btn danger-btn"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel config-panel" id="tour-tiers">
        <div className="flex-header">
          <h2 style={{ margin: 0 }}>Ad Pricing Tiers</h2>
          <button className="btn secondary-btn small-btn" onClick={addTier}>+ Add Tier</button>
        </div>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: '#64748b' }}>Define the durations and prices for ads on your site.</p>

        {tiers.map((tier: any, i: number) => (
          <div key={i} className="dynamic-list-item row">
            <div className="form-group col">
              <label>Internal ID</label>
              <input type="text" value={tier.id || ''} onChange={e => updateTier(i, 'id', e.target.value)} />
            </div>
            <div className="form-group col">
              <label>Display Name</label>
              <input type="text" value={tier.name || ''} onChange={e => updateTier(i, 'name', e.target.value)} />
            </div>
            <div className="form-group col">
              <label>Duration (Hours)</label>
              <input type="number" value={tier.duration_hours || 0} onChange={e => updateTier(i, 'duration_hours', parseInt(e.target.value))} />
            </div>
            <div className="form-group col">
              <label>Price (Cents)</label>
              <input type="number" value={tier.price_cents || 0} onChange={e => updateTier(i, 'price_cents', parseInt(e.target.value))} />
            </div>
            <div className="col btn-col">
              <label>&nbsp;</label>
              <button className="btn danger-btn small-btn" onClick={() => removeTier(i)}>X</button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel config-panel" style={{ marginBottom: '2rem' }} id="tour-form">
        <h2 style={{ margin: 0, marginBottom: '1rem' }}>Advertiser Form Basics</h2>
        <div className="form-group row">
          <div className="col">
            <label>Form Title</label>
            <input
              type="text"
              value={config.formConfig?.title || ''}
              onChange={e => handleConfigChange('formConfig', { ...config.formConfig, title: e.target.value })}
            />
          </div>
          <div className="col">
            <label>Form Description</label>
            <input
              type="text"
              value={config.formConfig?.description || ''}
              onChange={e => handleConfigChange('formConfig', { ...config.formConfig, description: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group row" style={{ marginTop: '1rem' }}>
          <div className="col">
            <label>Title Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={config.formConfig?.titleColor || '#111827'}
                onChange={e => handleConfigChange('formConfig', { ...config.formConfig, titleColor: e.target.value })}
                style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {config.formConfig?.titleColor || '#111827'}
              </span>
            </div>
          </div>
          <div className="col">
            <label>Logo Upload</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="file" accept="image/*" onChange={handleLogoUpload} />
              {config.formConfig?.logoUrl && (
                <img src={config.formConfig.logoUrl} alt="Logo Preview" style={{ maxHeight: '40px' }} />
              )}
            </div>
          </div>
        </div>
        <div className="form-group row" style={{ marginTop: '1rem' }}>
          <div className="col" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={config.formConfig?.allowFutureScheduling || false}
              onChange={e => handleConfigChange('formConfig', { ...config.formConfig, allowFutureScheduling: e.target.checked })}
              id="allowFutureScheduling"
            />
            <label htmlFor="allowFutureScheduling" style={{ margin: 0 }}>Allow Advertisers to Schedule Ads in the Future</label>
          </div>
        </div>
      </div>

      <details className="panel config-panel">
        <summary style={{ cursor: 'pointer', outline: 'none' }}>
          <h2 style={{ display: 'inline-block', margin: 0 }}>Advanced Customization</h2>
        </summary>
        <p style={{ marginTop: '0.5rem' }}>Customize your ad portal and widget dynamically.</p>

        <div style={{ marginTop: '2rem' }}>
          <div>
            <ConfigBuilder config={config} onChange={handleConfigChange} />
          </div>
        </div>
      </details>

      <div className="panel" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Manage Advertisers</h2>
          <input 
            type="text" 
            placeholder="Search by email..." 
            value={advertiserSearch} 
            onChange={e => setAdvertiserSearch(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
          />
        </div>
        <p style={{ marginBottom: '1rem', color: '#64748b' }}>Advertisers who have submitted ads to your site.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {advertisers.filter(a => a.email.toLowerCase().includes(advertiserSearch.toLowerCase())).map(adv => (
                <tr key={adv.email}>
                  <td>{adv.email}</td>
                  <td>
                    {adv.is_blocked ? (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Blocked</span>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleAdvertiserBlock(adv.email, adv.is_blocked)} 
                      className={`btn ${adv.is_blocked ? 'secondary-btn' : 'danger-btn'}`}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      {adv.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
              {advertisers.filter(a => a.email.toLowerCase().includes(advertiserSearch.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                    No advertisers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', marginBottom: '2rem' }}>
        <button onClick={saveConfig} className="btn primary-btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {!loading && userSettings && userSettings.tutorial_completed !== true && (
        <TutorialOverlay 
          onComplete={completeTutorial} 
          config={config} 
        />
      )}
    </div>
  );
}
