import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const TIER_PRICES = {
  '1-day': 25,
  '3-day': 60,
  '7-day': 120,
};

export default function SubmissionForm() {
  const [searchParams] = useSearchParams();
  const defaultPublisherId = searchParams.get('publisher_id') || '00000000-0000-0000-0000-000000000000';

  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [tier, setTier] = useState<'1-day' | '3-day' | '7-day'>('1-day');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<any>({});

  useEffect(() => {
    // Fetch publisher config for preview
    axios.get(`/api/ads?publisher=${defaultPublisherId}`)
      .then(res => {
        if (res.data.config) {
          setWidgetConfig(res.data.config);
        }
      })
      .catch(err => console.error('Failed to fetch publisher config', err));
  }, [defaultPublisherId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline || !bodyText || !linkUrl || !image) {
      alert('Please fill out all fields and upload an image.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('publisher_id', defaultPublisherId);
    formData.append('headline', headline);
    formData.append('body_text', bodyText);
    formData.append('link_url', linkUrl);
    formData.append('tier', tier);
    formData.append('image', image);

    try {
      const res = await axios.post('/api/ads/checkout', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submission-layout">
      <div className="form-section panel">
        <h2>Create Your TownTickerAd</h2>
        <form onSubmit={handleSubmit} className="ad-form">
          <div className="form-group">
            <label>Headline (Max 50 chars)</label>
            <input 
              type="text" 
              maxLength={50} 
              value={headline} 
              onChange={(e) => setHeadline(e.target.value)} 
              placeholder="e.g. 50% Off Pizzas Today!"
            />
          </div>

          <div className="form-group">
            <label>Body Text</label>
            <textarea 
              rows={3}
              value={bodyText} 
              onChange={(e) => setBodyText(e.target.value)} 
              placeholder="Tell customers why they should click..."
            />
          </div>

          <div className="form-group">
            <label>Link URL</label>
            <input 
              type="url" 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)} 
              placeholder="https://yourwebsite.com/offer"
            />
          </div>

          <div className="form-group">
            <label>Upload Image (1:1 Ratio recommended)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange} 
            />
          </div>

          <div className="form-group">
            <label>Duration Tier</label>
            <div className="tier-options">
              {(Object.keys(TIER_PRICES) as Array<keyof typeof TIER_PRICES>).map((t) => (
                <div 
                  key={t} 
                  className={`tier-card ${tier === t ? 'selected' : ''}`}
                  onClick={() => setTier(t)}
                >
                  <div className="tier-name">{t.toUpperCase()}</div>
                  <div className="tier-price">${TIER_PRICES[t]}</div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="checkout-btn" disabled={loading}>
            {loading ? 'Processing...' : `Pay $${TIER_PRICES[tier]} & Submit`}
          </button>
        </form>
      </div>

      <div className="preview-section panel">
        <h2>Live Preview</h2>
        <p className="preview-help">This is how your ad will appear on the publisher's site.</p>
        
        {(() => {
          const styles = widgetConfig.styles || {};
          const containerStyle: React.CSSProperties = {
            fontFamily: styles.fontFamily || 'system-ui, sans-serif',
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: styles.layout === 'horizontal' ? 'row' : 'column',
            gap: '1rem',
            background: styles.backgroundColor || 'transparent',
            padding: styles.padding || '0',
            border: styles.border || 'none',
            borderRadius: styles.borderRadius || '0',
            overflow: 'hidden'
          };
        
          const adStyle: React.CSSProperties = {
            flex: 1,
            minWidth: '250px',
            maxWidth: styles.adMaxWidth || '400px',
            boxSizing: 'border-box',
            padding: '1rem',
            background: styles.adBackgroundColor || '#ffffff',
            border: `1px solid ${styles.adBorderColor || '#e5e7eb'}`,
            borderRadius: styles.borderRadius || '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            transition: 'transform 0.2s',
            position: 'relative'
          };
          
          return (
            <div style={containerStyle}>
              <a href={linkUrl || '#'} style={adStyle} target="_blank" rel="noopener noreferrer">
                {widgetConfig.showAdPill !== false && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', zIndex: 10 }}>Ad</div>
                )}
                <img src={imagePreview || 'https://via.placeholder.com/300?text=Upload+Image'} alt="Ad" style={{ width: '100%', maxHeight: styles.imageMaxHeight || '250px', height: 'auto', objectFit: 'contain', borderRadius: '4px' }} />
                <div style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: styles.textColor || '#111827' }}>{headline || 'Your Headline Here'}</div>
                <div style={{ margin: 0, fontSize: '0.875rem', fontWeight: '400', color: styles.textColor || '#4b5563' }}>{bodyText || 'Your promotional body text will appear here. Make it catchy!'}</div>
              </a>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
