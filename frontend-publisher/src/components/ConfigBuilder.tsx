import React from 'react';

interface ConfigBuilderProps {
  config: any;
  onChange: (key: string, value: any) => void;
}

export default function ConfigBuilder({ config, onChange }: ConfigBuilderProps) {
  // Safe default getters
  const formConfig = config.formConfig || { title: '', description: '' };
  const widgetConfig = config.widgetConfig || { styles: { layout: 'vertical' } };
  const tiers = config.tiers || [];
  const adSchema = config.adSchema || [];

  const updateFormConfig = (field: string, value: string) => {
    onChange('formConfig', { ...formConfig, [field]: value });
  };

  const updateWidgetConfig = (field: string, value: string) => {
    onChange('widgetConfig', { 
      ...widgetConfig, 
      styles: { ...(widgetConfig.styles || {}), [field]: value } 
    });
  };

  const addTier = () => {
    onChange('tiers', [...tiers, { id: `tier-${Date.now()}`, name: 'New Tier', duration_hours: 24, price_cents: 1000 }]);
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange('tiers', newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    onChange('tiers', newTiers);
  };

  const addSchemaField = () => {
    onChange('adSchema', [...adSchema, { name: `field_${Date.now()}`, label: 'New Field', type: 'text', required: false }]);
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

  return (
    <div className="config-builder">
      {/* Form Config */}
      <div className="config-section">
        <h3>Advertiser Form Basics</h3>
        <div className="form-group row">
          <div className="col">
            <label>Form Title</label>
            <input 
              type="text" 
              value={formConfig.title || ''} 
              onChange={e => updateFormConfig('title', e.target.value)} 
            />
          </div>
          <div className="col">
            <label>Form Description</label>
            <input 
              type="text" 
              value={formConfig.description || ''} 
              onChange={e => updateFormConfig('description', e.target.value)} 
            />
          </div>
        </div>
      </div>

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
              value={widgetConfig.styles?.fontFamily || 'system-ui, sans-serif'} 
              onChange={e => updateWidgetConfig('fontFamily', e.target.value)}
            >
              <option value="system-ui, sans-serif">System Default</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Georgia', serif">Georgia (Serif)</option>
              <option value="'Courier New', monospace">Courier (Mono)</option>
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
      </div>

      {/* Tiers */}
      <div className="config-section">
        <div className="flex-header">
          <h3>Pricing Tiers</h3>
          <button className="btn secondary-btn small-btn" onClick={addTier}>+ Add Tier</button>
        </div>
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
            <div className="col btn-col">
              <label>&nbsp;</label>
              <button className="btn danger-btn small-btn" onClick={() => removeSchemaField(i)}>X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
