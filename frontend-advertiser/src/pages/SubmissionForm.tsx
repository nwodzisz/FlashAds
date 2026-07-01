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
      const res = await axios.post('http://localhost:3001/api/ads/checkout', formData, {
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
        <h2>Create Your FlashAd</h2>
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
        
        <div className="widget-preview-container">
          <a href={linkUrl || '#'} className="flashad-widget-item" target="_blank" rel="noopener noreferrer">
            <div className="flashad-image" style={{ backgroundImage: `url(${imagePreview || 'https://via.placeholder.com/300?text=Upload+Image'})` }}></div>
            <div className="flashad-content">
              <h3 className="flashad-headline">{headline || 'Your Headline Here'}</h3>
              <p className="flashad-body">{bodyText || 'Your promotional body text will appear here. Make it catchy!'}</p>
              <span className="flashad-sponsored">Sponsored</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
