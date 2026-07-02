const scriptTags = document.getElementsByTagName('script');
let currentScriptUrl = '';
for (let i = 0; i < scriptTags.length; i++) {
  if (scriptTags[i].src && scriptTags[i].src.includes('widget.js')) {
    currentScriptUrl = new URL(scriptTags[i].src).origin;
    break;
  }
}
const BACKEND_URL = currentScriptUrl || 'http://localhost:3001';

class TownTickerWidget {
  constructor(publisherId, container) {
    this.publisherId = publisherId;
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.apiUrl = `${BACKEND_URL}/api/ads`;
    
    if (!this.container) {
      console.error(`TownTicker: Container not found`);
      return;
    }
    
    this.init();
  }

  async init() {
    try {
      const response = await fetch(`${this.apiUrl}?publisher=${this.publisherId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      this.render(data.ads, data.config, data.schema);
    } catch (error) {
      console.error('TownTicker: Error fetching ads', error);
      this.container.innerHTML = '<p>Error loading ads.</p>';
    }
  }

  render(ads, config, schema = []) {
    if (!ads || ads.length === 0) {
      this.container.innerHTML = '';
      return;
    }
    
    // Apply dynamic widget styles
    const styles = config.styles || {};
    
    // Inject Google Font if needed
    if (styles.fontFamily && styles.fontFamily !== 'System Default') {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${styles.fontFamily.replace(/ /g, '+')}:wght@400;600;700&display=swap`;
      if (!document.querySelector(`link[href="${fontUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }
    
    const parseSize = (val, defaultVal) => {
      if (!val) return defaultVal;
      if (/^\d+$/.test(val)) return `${val}px`;
      return val;
    };
    
    const containerStyle = `
      font-family: ${styles.fontFamily ? `'${styles.fontFamily}', sans-serif` : 'system-ui, sans-serif'};
      display: flex;
      flex-wrap: wrap;
      flex-direction: ${styles.layout === 'horizontal' ? 'row' : 'column'};
      gap: 1rem;
      background: ${styles.backgroundColor || 'transparent'};
      padding: ${styles.padding || '0'};
      border: ${styles.border || 'none'};
      border-radius: ${styles.borderRadius || '0'};
    `;

    const adStyle = `
      flex: 1;
      min-width: 250px;
      max-width: ${parseSize(styles.adMaxWidth, '400px')};
      box-sizing: border-box;
      padding: 1rem;
      background: ${styles.adBackgroundColor || '#ffffff'};
      border: 1px solid ${styles.adBorderColor || '#e5e7eb'};
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s;
      position: relative;
    `;

    // Try to guess which field is the image, title, and link based on their values
    let html = `<div class="townticker-ads-container" style="${containerStyle}">`;
    
    ads.forEach(ad => {
      const { data } = ad;
      // Heuristics for dynamic data rendering
      const linkField = schema.find(f => f.type === 'url' || f.name.includes('link') || f.name.includes('url'));
      const linkKey = linkField ? linkField.name : null;
      const link = linkKey ? data[linkKey] : '#';
      
      const trackClick = `navigator.sendBeacon('${this.apiUrl}/${ad.id}/click')`;
      
      html += `<a href="${link}" target="_blank" class="flash-ad-item" style="${adStyle}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'" onclick="${trackClick}">`;
      
      if (config.showAdPill !== false) {
        html += `<div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; z-index: 10;">Ad</div>`;
      }

      schema.forEach(field => {
        const key = field.name;
        const val = data[key];
        if (!val) return;

        if (field.type === 'file' || field.type === 'image' || key.includes('image')) {
          const src = val.startsWith('http') ? val : `${BACKEND_URL}${val}`;
          html += `<img src="${src}" alt="Ad" style="width: 100%; max-height: ${parseSize(styles.imageMaxHeight, '250px')}; height: auto; object-fit: contain; border-radius: 4px;" />`;
        } else if (field.type !== 'url' && key !== linkKey) {
          if (typeof val === 'string') {
             const isHeadline = key.toLowerCase().includes('title') || key.toLowerCase().includes('headline');
             const fontSize = field.fontSize || (isHeadline ? '1.125rem' : '0.875rem');
             
             html += `<div style="margin: 0; font-size: ${fontSize}; font-weight: ${isHeadline ? '600' : '400'}; color: ${styles.textColor || (isHeadline ? '#111827' : '#4b5563')};">${val}</div>`;
          }
        }
      });
      
      html += `</a>`;
    });
    
    html += `</div>`;
    
    this.container.innerHTML = html;
    
    // Track views
    ads.forEach(ad => {
      fetch(`${this.apiUrl}/${ad.id}/view`, { method: 'POST', keepalive: true }).catch(() => {});
    });
  }
}

// Make it available globally
window.TownTickerWidget = TownTickerWidget;

// Auto-initialize
function initTownTicker() {
  const containers = document.querySelectorAll('#townticker-widget, [data-publisher]');
  containers.forEach(container => {
    if (container.dataset.towntickerInitialized) return;
    const publisherId = container.getAttribute('data-publisher');
    if (publisherId) {
      container.dataset.towntickerInitialized = 'true';
      new TownTickerWidget(publisherId, container);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTownTicker);
} else {
  initTownTicker();
}
