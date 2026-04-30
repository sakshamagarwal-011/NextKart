import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AREAS } from '../../lib/constants';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, updateProfile, signOut, becomeShopkeeper, isShopkeeper } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [area, setArea] = useState(profile?.area || '');
  const [shopModal, setShopModal] = useState(false);
  const [shopName, setShopName] = useState('');

  const c = (light, dark) => isDark ? dark : light;
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '6px' };

  async function handleSave() { await updateProfile({ full_name: fullName, phone, area }); setEditing(false); }
  async function handleBecomeShopkeeper() { if (!shopName.trim()) return toast.error('Enter shop name'); await becomeShopkeeper(shopName); setShopModal(false); navigate('/dashboard'); }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Profile 👤</h1>

      <div style={{ padding: '24px', borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 800 }}>{profile?.full_name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h2 style={{ fontWeight: 700, color: c('#0F172A', 'white'), fontSize: '18px', margin: 0 }}>{profile?.full_name}</h2>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '2px 0 0' }}>{profile?.email}</p>
            <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: c('rgba(108,99,255,0.08)', 'rgba(108,99,255,0.15)'), color: '#6C63FF', textTransform: 'capitalize' }}>{profile?.role}</span>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={labelStyle}>Full Name</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Area</label>
              <select value={area} onChange={e => setArea(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: c('#F1F5F9', 'rgba(255,255,255,0.06)'), color: c('#334155', '#CBD5E1'), fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            {[{ label: 'Name', value: profile?.full_name, emoji: '👤' }, { label: 'Email', value: profile?.email, emoji: '📧' }, { label: 'Phone', value: profile?.phone || 'Not set', emoji: '📞' }, { label: 'Area', value: profile?.area, emoji: '📍' }]
              .map(({ label, value, emoji }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${c('#F1F5F9', 'rgba(255,255,255,0.04)')}` }}>
                  <span>{emoji}</span>
                  <div><p style={{ color: '#94A3B8', fontSize: '11px', margin: 0 }}>{label}</p><p style={{ fontWeight: 600, color: c('#0F172A', 'white'), fontSize: '14px', margin: 0 }}>{value}</p></div>
                </div>
              ))}
            <button onClick={() => setEditing(true)} style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: 'transparent', color: '#6C63FF', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              ✏️ Edit Profile
            </button>
          </div>
        )}
      </div>

      {!isShopkeeper && (
        <div style={{ padding: '20px', borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, color: c('#0F172A', 'white'), margin: '0 0 8px' }}>🏪 Become a Shopkeeper</h3>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '14px' }}>Want to sell products? Register your shop!</p>
          <button onClick={() => setShopModal(true)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Register My Shop 🏪</button>
        </div>
      )}

      <button onClick={() => { signOut(); navigate('/'); }} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: c('rgba(239,68,68,0.06)', 'rgba(239,68,68,0.12)'), color: '#EF4444', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
        🚪 Sign Out
      </button>

      {/* Shop Modal */}
      {shopModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }} onClick={() => setShopModal(false)}>
          <div style={{ background: c('white', '#0F172A'), borderRadius: '20px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px' }}>Register Your Shop</h3>
            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Your shop name..." style={inputStyle} />
            <button onClick={handleBecomeShopkeeper} style={{ width: '100%', marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>Create Shop 🎉</button>
          </div>
        </div>
      )}
    </div>
  );
}
