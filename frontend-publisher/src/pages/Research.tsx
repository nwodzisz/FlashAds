import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import Navbar from '../components/Navbar';

export default function Research() {
  const navigate = useNavigate();

  const smbDemandData = [
    { name: 'Self-Service Platforms', value: 71 },
    { name: 'Traditional Agencies', value: 29 },
  ];
  const smbDemandColors = ['#3b82f6', '#94a3b8'];

  const budgetData = [
    { name: 'Over $1,500', value: 24 },
    { name: '$500 - $1,500', value: 35 },
    { name: 'Under $500', value: 41 },
  ];
  const budgetColors = ['#94a3b8', '#94a3b8', '#8b5cf6']; // Highlight <$500

  const facebookData = [
    { name: 'Facebook', value: 83 },
    { name: 'Instagram', value: 60 },
    { name: 'Other', value: 35 },
  ];

  return (
    <div className="home-container">
      {/* Dynamic Background */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <Navbar />

      <main className="home-main">
        <section className="hero-compact">
          <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h1 className="hero-title">
              The Data Behind <br />
              <span className="gradient-text">The Local Ad Market.</span>
            </h1>
            <p className="hero-subtitle" style={{ margin: '0 auto 2.5rem' }}>
              We didn't just build a widget. We built a solution to a mathematical certainty in local advertising.
            </p>
          </div>
        </section>

        <section style={{ padding: '2rem 2rem 6rem', position: 'relative', zIndex: 10 }}>
          
          <div className="feature-grid" style={{ maxWidth: '1200px', margin: '0 auto', gap: '2rem' }}>
            
            {/* Chart 1 */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>SMBs Demand Self-Serve</h3>
              <p style={{ color: '#475569', marginBottom: '2rem', minHeight: '80px' }}>
                71% of small and midsize businesses prefer self-service marketing platforms rather than working with traditional agencies. They want frictionless checkouts, not phone calls.
              </p>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={smbDemandData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {smbDemandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={smbDemandColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>Self-Service (71%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#94a3b8' }}></div>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>Agencies (29%)</span>
                </div>
              </div>
            </div>

            {/* Chart 2 */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>The Price is Right</h3>
              <p style={{ color: '#475569', marginBottom: '2rem', minHeight: '80px' }}>
                41% of SMBs have an advertising budget of less than $500 per month. A $1,500 legacy media kit is mathematically impossible for nearly half of all local businesses.
              </p>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={budgetColors[index]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#475569" formatter={(val: number) => `${val}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3 */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>The Facebook Exodus</h3>
              <p style={{ color: '#475569', marginBottom: '2rem', minHeight: '80px' }}>
                When SMBs buy digital ads, 83% use Facebook. Local businesses are spending money, but they are giving it to tech giants because the local paper makes it too hard to buy space.
              </p>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facebookData} layout="vertical" margin={{ top: 5, right: 30, left: 75, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                      <LabelList dataKey="value" position="right" fill="#475569" formatter={(val: number) => `${val}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
