import React from 'react';

export default function WidgetPreview({ config, dummyAds }: { config: any, dummyAds: any[] }) {
  const styles = config?.widgetConfig?.styles || {};
  
  const containerStyle: React.CSSProperties = {
    fontFamily: styles.fontFamily || 'system-ui, sans-serif',
    display: 'flex',
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
  };

  return (
    <div className="widget-preview-container" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', height: '100%' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>Live Preview</h3>
      
      {dummyAds.length === 0 ? (
        <div style={containerStyle}>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#e2e8f0', borderRadius: '8px', color: '#64748b' }}>
            Advertise Here!
          </div>
        </div>
      ) : (
        <div style={containerStyle}>
          {dummyAds.map((ad, idx) => {
            const data = ad.data;
            const imageKey = Object.keys(data).find(k => k.includes('image') || data[k]?.toString().startsWith('/uploads/'));
            const linkKey = Object.keys(data).find(k => k.includes('link') || k.includes('url') || data[k]?.toString().startsWith('http'));

            return (
              <div key={idx} style={adStyle}>
                {imageKey && (
                  <img src={`http://localhost:3001${data[imageKey]}`} alt="Ad" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
                )}
                {Object.keys(data).map(key => {
                  if (key === imageKey || key === linkKey) return null;
                  const val = data[key];
                  if (typeof val === 'string') {
                    if (val.length < 50) {
                      return <h4 key={key} style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: styles.textColor || '#111827' }}>{val}</h4>;
                    } else {
                      return <p key={key} style={{ margin: 0, fontSize: '0.875rem', color: styles.textColor || '#4b5563' }}>{val}</p>;
                    }
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
