class TownTickerWidget {
  constructor(publisherId, container) {
    this.publisherId = publisherId;
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.apiUrl = 'http://localhost:3001/api/ads';
    
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
      this.render(data.ads, data.config);
    } catch (error) {
      console.error('TownTicker: Error fetching ads', error);
      this.container.innerHTML = '<p>Error loading ads.</p>';
    }
  }

  render(ads, config) {
    if (!ads || ads.length === 0) {
      this.container.innerHTML = '<div class="townticker-ads-empty">Advertise Here!</div>';
      return;
    }
    
    // Apply dynamic widget styles
    const styles = config.styles || {};
    
    const containerStyle = `
      font-family: ${styles.fontFamily || 'system-ui, sans-serif'};
      display: flex;
      flex-direction: ${styles.layout === 'horizontal' ? 'row' : 'column'};
      gap: 1rem;
      background: ${styles.backgroundColor || 'transparent'};
      padding: ${styles.padding || '0'};
      border: ${styles.border || 'none'};
      border-radius: ${styles.borderRadius || '0'};
    `;

    const adStyle = `
      flex: 1;
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
    `;

    // Try to guess which field is the image, title, and link based on their values
    let html = `<div class="townticker-ads-container" style="${containerStyle}">`;
    
    ads.forEach(ad => {
      const { data } = ad;
      // Heuristics for dynamic data rendering
      const imageKey = Object.keys(data).find(k => k.includes('image') || data[k]?.toString().startsWith('/uploads/'));
      const linkKey = Object.keys(data).find(k => k.includes('link') || k.includes('url') || data[k]?.toString().startsWith('http'));
      
      const link = linkKey ? data[linkKey] : '#';
      
      html += `<a href="${link}" target="_blank" class="flash-ad-item" style="${adStyle}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">`;
      
      if (imageKey) {
        html += `<img src="http://localhost:3001${data[imageKey]}" alt="Ad" style="width: 100%; height: auto; border-radius: 4px;" />`;
      }
      
      // Render the rest of the text fields
      Object.keys(data).forEach(key => {
        if (key === imageKey || key === linkKey) return;
        const val = data[key];
        if (typeof val === 'string') {
           if (val.length < 50) {
             html += `<h4 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: ${styles.textColor || '#111827'};">${val}</h4>`;
           } else {
             html += `<p style="margin: 0; font-size: 0.875rem; color: ${styles.textColor || '#4b5563'};">${val}</p>`;
           }
        }
      });
      
      html += `</a>`;
    });
    
    html += `</div>`;
    
    this.container.innerHTML = html;
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
