import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function SubmitAd() {
  const { advertiser, token } = useAuth();
  const [publisher, setPublisher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<any>({});
  const [tier, setTier] = useState('');
  const [advertiserEmail, setAdvertiserEmail] = useState(advertiser?.email || '');
  const [startTime, setStartTime] = useState('');

  useEffect(() => {
    if (advertiser) {
      setAdvertiserEmail(advertiser.email);
    }
  }, [advertiser]);

  useEffect(() => {
    if (window.location.pathname === '/success') {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    let pubId = params.get('publisher');

    if (pubId) {
      sessionStorage.setItem('last_publisher_id', pubId);
    } else {
      pubId = sessionStorage.getItem('last_publisher_id');
    }

    if (pubId) {
      fetchPublisher(pubId);
    } else {
      window.location.href = 'https://townticker.nathanwodzisz.com/';
    }
  }, []);

  const fetchPublisher = async (id: string) => {
    try {
      const res = await axios.get(`/api/publishers/${id}`);
      setPublisher({ id, ...res.data });
      if (res.data.config?.tiers?.length > 0) {
        setTier(res.data.config.tiers[0].id);
      }
    } catch (err) {
      setError('Publisher not found or inactive.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData({ ...formData, [name]: file });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publisher) return;

    try {
      const payload = new FormData();
      payload.append('publisher_id', publisher.id);
      payload.append('tier', tier);
      payload.append('advertiser_email', advertiserEmail);
      if (advertiser) {
        payload.append('advertiser_id', advertiser.id);
      }

      // Append dynamic data
      for (const key in formData) {
        payload.append(key, formData[key]);
      }

      if (startTime) {
        payload.append('start_time', new Date(startTime).toISOString());
      }

      const res = await axios.post('/api/ads/checkout', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate checkout.');
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="hex-loader">
          <div className="hex"></div><div className="hex"></div><div className="hex"></div>
          <div className="hex"></div><div className="hex"></div><div className="hex"></div><div className="hex"></div>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  if (window.location.pathname === '/success') {
    return (
      <div className="app-container">
        <main className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="panel" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '1rem' }}>Payment Successful!</h2>
            <p>Your Ad has been submitted and is currently processing. Once the payment clears, it will automatically go live on the publisher's website.</p>
          </div>
        </main>
      </div>
    );
  }

  const config = publisher.config || {};
  const schema = config.adSchema || [];
  const tiers = config.tiers || [];
  const formConfig = config.formConfig || { title: "Buy a Self-Serve Ad", description: "Your ad will go live instantly after payment." };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: formConfig.titleColor || '#111827', WebkitTextFillColor: formConfig.titleColor ? 'initial' : undefined, background: formConfig.titleColor ? 'none' : undefined }}>
          {formConfig.logoUrl && (
            <img src={formConfig.logoUrl} alt="Logo" style={{ maxHeight: '40px', marginRight: '0.75rem', borderRadius: '4px' }} />
          )}
          {formConfig.title}
        </h1>
        <p>{formConfig.description}</p>
      </header>

      <main className="app-main">
        {!advertiser && (
          <div style={{ width: '100%', maxWidth: '600px', padding: '1rem', background: '#e0f2fe', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#0369a1' }}>
            <strong>Want to track your ad's performance?</strong> <a href="/register" style={{ color: '#0284c7', fontWeight: 'bold' }}>Create an account</a> before checking out, or proceed as a guest.
          </div>
        )}
        <form onSubmit={handleSubmit} className="ad-form panel">
          <div className="form-section">
            <h2>Select Duration</h2>
            <div className="tiers-grid">
              {tiers.map((t: any) => (
                <label key={t.id} className={`tier-card ${tier === t.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tier"
                    value={t.id}
                    checked={tier === t.id}
                    onChange={() => setTier(t.id)}
                  />
                  <div className="tier-info">
                    <h3>{t.name}</h3>
                    <p className="price">${(t.price_cents / 100).toFixed(2)}</p>
                    <p className="duration">Runs for {t.duration_hours} hours</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section mt-8">
            <h2>Ad Content</h2>

            <div className="form-group">
              <label>Your Email Address *</label>
              <input
                type="email"
                required
                value={advertiserEmail}
                onChange={(e) => setAdvertiserEmail(e.target.value)}
                placeholder="Where should we send the receipt?"
              />
            </div>

            {schema.map((field: any) => (
              <div key={field.name} className="form-group">
                <label>{field.label} {field.required && '*'}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder || ''}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                ) : field.type === 'file' ? (
                  <input
                    type="file"
                    accept={field.accept || 'image/*'}
                    required={field.required}
                    onChange={(e) => handleFileChange(field.name, e.target.files ? e.target.files[0] : null)}
                  />
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder || ''}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
                {field.maxLength && <small className="helper-text">{formData[field.name]?.length || 0} / {field.maxLength}</small>}
              </div>
            ))}

            {formConfig.allowFutureScheduling && (
              <div className="form-group mt-8">
                <label>Schedule Ad (Optional)</label>
                <input 
                  type="datetime-local" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)} 
                />
                <small className="helper-text">Leave blank to start instantly upon payment.</small>
              </div>
            )}
          </div>

          <button type="submit" className="btn primary-btn submit-btn">
            Proceed to Payment
          </button>
        </form>
      </main>
    </div>
  );
}

export default SubmitAd;
