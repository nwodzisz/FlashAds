import React from 'react';

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Oswald', 'Source Sans Pro', 'Slabo 27px', 'Raleway', 'PT Sans',
  'Merriweather', 'Nunito', 'Playfair Display', 'Rubik', 'Lora',
  'Work Sans', 'Fira Sans', 'Quicksand', 'Karla', 'Inconsolata'
];

interface ConfigBuilderProps {
  config: any;
  onChange: (key: string, value: any) => void;
}

export default function ConfigBuilder({ config, onChange }: ConfigBuilderProps) {
  // Safe default getters
  const formConfig = config.formConfig || { title: '', description: '' };
  const widgetConfig = config.widgetConfig || { styles: { layout: 'vertical' } };
  const tiers = config.tiers || [];
  const defaultSchema = [
    { name: 'headline', label: 'Headline', type: 'text', required: true, maxLength: 50, fontSize: '1.125rem' },
    { name: 'body_text', label: 'Body Text', type: 'textarea', required: true, maxLength: 200, fontSize: '0.875rem' },
    { name: 'link_url', label: 'Link URL', type: 'url', required: true },
    { name: 'image', label: 'Ad Image', type: 'file', required: true }
  ];
  const adSchema = config.adSchema && config.adSchema.length > 0 ? config.adSchema : defaultSchema;

  const updateFormConfig = (field: string, value: string) => {
    onChange('formConfig', { ...formConfig, [field]: value });
  };

  const updateWidgetConfig = (field: string, value: string) => {
    onChange('widgetConfig', { 
      ...widgetConfig, 
      styles: { ...(widgetConfig.styles || {}), [field]: value } 
    });
  };

  const updateWidgetRootConfig = (field: string, value: any) => {
    onChange('widgetConfig', { 
      ...widgetConfig, 
      [field]: value 
    });
  };



  const addSchemaField = () => {
    onChange('adSchema', [...adSchema, { name: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false, fontSize: '1rem' }]);
  };

  const updateSchemaField = (index: number, field: string, value: any) => {
    const newSchema = [...adSchema];
    newSchema[index] = { ...newSchema[index], [field]: value };
    onChange('adSchema', newSchema);
  };

  const removeSchemaField = (index: number) => {
    const newSchema = [...adSchema];
    newSchema.splice(index, 1);
    onChange('adSchema', newSchema);
  };

  const moveSchemaFieldUp = (index: number) => {
    if (index === 0) return;
    const newSchema = [...adSchema];
    const temp = newSchema[index - 1];
    newSchema[index - 1] = newSchema[index];
    newSchema[index] = temp;
    onChange('adSchema', newSchema);
  };

  const moveSchemaFieldDown = (index: number) => {
    if (index === adSchema.length - 1) return;
    const newSchema = [...adSchema];
    const temp = newSchema[index + 1];
    newSchema[index + 1] = newSchema[index];
    newSchema[index] = temp;
    onChange('adSchema', newSchema);
  };

  return (
    <div className="config-builder">
      {/* Widget Config */}
      <div className="config-section">
        <h3>Embed Widget Style</h3>
        
        <div className="form-group row">
          <div className="col">
            <label>Widget Layout</label>
            <select 
              value={widgetConfig.styles?.layout || 'vertical'} 
              onChange={e => updateWidgetConfig('layout', e.target.value)}
            >
              <option value="vertical">Vertical List</option>
              <option value="horizontal">Horizontal Grid</option>
            </select>
          </div>
          <div className="col">
            <label>Font Family</label>
            <select 
              value={widgetConfig.styles?.fontFamily || 'Inter'} 
              onChange={e => updateWidgetConfig('fontFamily', e.target.value)}
            >
              <option value="">System Default</option>
              {GOOGLE_FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group row">
          <div className="col">
            <label>Widget Padding</label>
            <input 
              type="text" 
              placeholder="e.g. 1rem or 20px"
              value={widgetConfig.styles?.padding || '0'} 
              onChange={e => updateWidgetConfig('padding', e.target.value)}
            />
          </div>
          <div className="col">
            <label>Ad Border Radius</label>
            <input 
              type="text" 
              placeholder="e.g. 8px"
              value={widgetConfig.styles?.borderRadius || '8px'} 
              onChange={e => updateWidgetConfig('borderRadius', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col">
            <label>Widget Background</label>
            <input 
              type="color" 
              value={widgetConfig.styles?.backgroundColor || '#ffffff'} 
              onChange={e => updateWidgetConfig('backgroundColor', e.target.value)}
            />
          </div>
          <div className="col">
            <label>Ad Background</label>
            <input 
              type="color" 
              value={widgetConfig.styles?.adBackgroundColor || '#ffffff'} 
              onChange={e => updateWidgetConfig('adBackgroundColor', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col">
            <label>Ad Border Color</label>
            <input 
              type="color" 
              value={widgetConfig.styles?.adBorderColor || '#e5e7eb'} 
              onChange={e => updateWidgetConfig('adBorderColor', e.target.value)}
            />
          </div>
          <div className="col">
            <label>Text Color</label>
            <input 
              type="color" 
              value={widgetConfig.styles?.textColor || '#111827'} 
              onChange={e => updateWidgetConfig('textColor', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group row">
          <div className="col checkbox-col" style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={widgetConfig.showAdPill !== false} 
                onChange={e => updateWidgetRootConfig('showAdPill', e.target.checked)} 
              />
              Show [Ad] Indicator Pill
            </label>
          </div>
          <div className="col">
            <label>Max Ads to Display</label>
            <input 
              type="number" 
              min="1"
              max="20"
              value={widgetConfig.maxAds || 3} 
              onChange={e => updateWidgetRootConfig('maxAds', parseInt(e.target.value) || 3)}
            />
          </div>
        </div>
        
        <div className="form-group row">
          <div className="col">
            <label>Ad Max Width (px or %)</label>
            <input 
              type="text" 
              value={widgetConfig.styles?.adMaxWidth || '400px'} 
              onChange={e => updateWidgetConfig('adMaxWidth', e.target.value)}
              placeholder="e.g. 400px or 100%"
            />
          </div>
          <div className="col">
            <label>Image Max Height (px or %)</label>
            <input 
              type="text" 
              value={widgetConfig.styles?.imageMaxHeight || '250px'} 
              onChange={e => updateWidgetConfig('imageMaxHeight', e.target.value)}
              placeholder="e.g. 250px or 100%"
            />
          </div>
        </div>
        
        
      </div>

      {/* Ad Schema */}
      <div className="config-section">
        <div className="flex-header">
          <h3>Ad Custom Fields</h3>
          <button className="btn secondary-btn small-btn" onClick={addSchemaField}>+ Add Field</button>
        </div>
        {adSchema.map((field: any, i: number) => (
          <div key={i} className="dynamic-list-item row">
            <div className="form-group col">
              <label>Field Name (ID)</label>
              <input type="text" value={field.name || ''} onChange={e => updateSchemaField(i, 'name', e.target.value)} />
            </div>
            <div className="form-group col">
              <label>Display Label</label>
              <input type="text" value={field.label || ''} onChange={e => updateSchemaField(i, 'label', e.target.value)} />
            </div>
            <div className="form-group col">
              <label>Input Type</label>
              <select value={field.type || 'text'} onChange={e => updateSchemaField(i, 'type', e.target.value)}>
                <option value="text">Short Text</option>
                <option value="textarea">Long Text</option>
                <option value="url">URL Link</option>
                <option value="file">Image Upload</option>
              </select>
            </div>
            <div className="form-group col checkbox-col" style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input type="checkbox" checked={field.required || false} onChange={e => updateSchemaField(i, 'required', e.target.checked)} />
                Required
              </label>
            </div>
            <div className="form-group col">
              <label>Max Length</label>
              <input type="number" value={field.maxLength || ''} onChange={e => updateSchemaField(i, 'maxLength', parseInt(e.target.value))} placeholder="Optional" />
            </div>
            <div className="form-group col">
              <label>Font Size</label>
              <input type="text" value={field.fontSize || '1rem'} onChange={e => updateSchemaField(i, 'fontSize', e.target.value)} placeholder="e.g. 1rem" />
            </div>
            <div className="col btn-col" style={{ display: 'flex', gap: '0.25rem', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
              <button className="btn secondary-btn small-btn" onClick={() => moveSchemaFieldUp(i)} disabled={i === 0}>↑</button>
              <button className="btn secondary-btn small-btn" onClick={() => moveSchemaFieldDown(i)} disabled={i === adSchema.length - 1}>↓</button>
              <button className="btn danger-btn small-btn" onClick={() => removeSchemaField(i)}>X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
