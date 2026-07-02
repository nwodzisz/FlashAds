import React, { useEffect } from 'react';

export default function WidgetPreview({ config, dummyAds }: { config: any, dummyAds: any[] }) {
  const styles = config?.widgetConfig?.styles || {};
  
  const parseSize = (val: string | undefined, defaultVal: string) => {
    if (!val) return defaultVal;
    if (/^\d+$/.test(val)) return `${val}px`;
    return val;
  };

  useEffect(() => {
    if (styles.fontFamily && styles.fontFamily !== 'System Default') {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${styles.fontFamily.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
  }, [styles.fontFamily]);

  const containerStyle: React.CSSProperties = {
    fontFamily: styles.fontFamily ? `'${styles.fontFamily}', sans-serif` : 'system-ui, sans-serif',
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
    maxWidth: parseSize(styles.adMaxWidth, '400px'),
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
    position: 'relative' // Added for the Ad pill positioning
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
            const adSchema = config?.adSchema || [];
            const linkField = adSchema.find((f: any) => f.type === 'url' || f.name.includes('link') || f.name.includes('url'));
            const linkKey = linkField ? linkField.name : null;

            return (
              <div key={idx} style={adStyle}>
                {config?.widgetConfig?.showAdPill !== false && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', zIndex: 10 }}>
                    Ad
                  </div>
                )}
                
                {adSchema.map((field: any) => {
                  const key = field.name;
                  const val = data[key];
                  if (!val) return null;

                  if (field.type === 'file' || field.type === 'image' || key.includes('image')) {
                    const src = val.toString().startsWith('http') ? val : `${val}`;
                    return <img key={key} src={src} alt="Ad" style={{ width: '100%', maxHeight: parseSize(styles.imageMaxHeight, '250px'), height: 'auto', objectFit: 'contain', borderRadius: '4px' }} />;
                  } else if (key !== linkKey && field.type !== 'url') {
                    if (typeof val === 'string') {
                      const isHeadline = key.toLowerCase().includes('title') || key.toLowerCase().includes('headline');
                      const fontSize = field.fontSize || (isHeadline ? '1.125rem' : '0.875rem');
                      
                      return <div key={key} style={{ margin: 0, fontSize: fontSize, fontWeight: isHeadline ? 600 : 400, color: styles.textColor || (isHeadline ? '#111827' : '#4b5563') }}>{val}</div>;
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
