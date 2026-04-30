import { useState } from 'react';
import { MapPin, Clock, Upload, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AREAS } from '../../lib/constants';
import toast from 'react-hot-toast';

export default function ShopProfilePage() {
  const { shop, updateShop } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    name: shop?.name || '', description: shop?.description || '', address: shop?.address || '',
    area: shop?.area || '', phone: shop?.phone || '', upi_id: shop?.upi_id || '',
    whatsapp_number: shop?.whatsapp_number || '', open_time: shop?.open_time || '09:00',
    close_time: shop?.close_time || '21:00', is_open: shop?.is_open ?? true,
    latitude: shop?.latitude || '', longitude: shop?.longitude || '',
  });
  const [, setUploading] = useState(false);

  const c = (light, dark) => isDark ? dark : light;
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '6px' };
  const cardStyle = { padding: '24px', borderRadius: '20px', background: c('white', 'rgba(255,255,255,0.03)'), border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, marginBottom: '24px' };

  function handleChange(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSave() {
    await updateShop(form);
  }

  async function uploadImage(file, type) {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `shops/${shop.id}/${type}.${ext}`;
      const { error: upErr } = await supabase.storage.from('shop-assets').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('shop-assets').getPublicUrl(path);
      await updateShop({ [`${type}_url`]: data.publicUrl });
      toast.success(`${type === 'logo' ? 'Logo' : 'Cover'} updated!`);
    } catch (err) { toast.error(err.message); } finally { setUploading(false); }
  }

  async function detectShopLocation() {
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 }));
      const { latitude, longitude } = pos.coords;
      handleChange('latitude', latitude);
      handleChange('longitude', longitude);
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
        const data = await res.json();
        const locality = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.county || '';
        
        if (locality) {
          const match = AREAS.find(a => locality.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(locality.toLowerCase()));
          handleChange('area', match || locality);
          toast.success(`Detected: ${match || locality} 📍. Save to apply.`);
          return;
        }
      } catch (e) {
        console.error('Reverse geocoding failed', e);
      }
      
      toast.success('Coordinates detected! Save to apply.');
    } catch { toast.error('Could not detect location'); }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Shop Settings ⚙️</h1>

      {/* Images */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px' }}>Shop Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>Logo</p>
            <label style={{ display: 'block', width: '96px', height: '96px', borderRadius: '16px', border: `2px dashed ${c('#CBD5E1', '#475569')}`, background: c('#F8FAFC', 'rgba(255,255,255,0.02)'), cursor: 'pointer', overflow: 'hidden' }}>
              {shop?.logo_url ? <img src={shop.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={24} color="#94A3B8" /></div>}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'logo')} />
            </label>
          </div>
          <div>
            <p style={{ ...labelStyle, marginBottom: '8px' }}>Cover</p>
            <label style={{ display: 'block', height: '96px', borderRadius: '16px', border: `2px dashed ${c('#CBD5E1', '#475569')}`, background: c('#F8FAFC', 'rgba(255,255,255,0.02)'), cursor: 'pointer', overflow: 'hidden' }}>
              {shop?.cover_url ? <img src={shop.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={24} color="#94A3B8" /></div>}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'cover')} />
            </label>
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px' }}>Shop Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[{ label: 'Shop Name', field: 'name', type: 'text', placeholder: 'Your shop name' },
            { label: 'Description', field: 'description', type: 'textarea', placeholder: 'Tell customers about your shop...' },
            { label: 'Address', field: 'address', type: 'text', placeholder: 'Full address' },
            { label: 'Phone', field: 'phone', type: 'tel', placeholder: '10-digit phone' },
            { label: 'UPI ID', field: 'upi_id', type: 'text', placeholder: 'yourname@upi' },
            { label: 'WhatsApp Number', field: 'whatsapp_number', type: 'tel', placeholder: 'WhatsApp number' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              {type === 'textarea' ? (
                <textarea value={form[field]} onChange={e => handleChange(field, e.target.value)} rows={2} placeholder={placeholder} style={{ ...inputStyle, resize: 'none' }} />
              ) : (
                <input type={type} value={form[field]} onChange={e => handleChange(field, e.target.value)} placeholder={placeholder} style={inputStyle} />
              )}
            </div>
          ))}

          <div>
            <label style={labelStyle}>Area</label>
            <input type="text" value={form.area} onChange={e => handleChange('area', e.target.value)}
              list="shop-area-suggestions" placeholder="Type your area..." style={inputStyle} />
            <datalist id="shop-area-suggestions">
              {AREAS.map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="#6C63FF" /> Map Location
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '16px' }}>Set your shop location so customers can find you on the map.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <input type="number" step="any" value={form.latitude} onChange={e => handleChange('latitude', e.target.value)} placeholder="Latitude" style={inputStyle} />
          <input type="number" step="any" value={form.longitude} onChange={e => handleChange('longitude', e.target.value)} placeholder="Longitude" style={inputStyle} />
        </div>
        <button onClick={detectShopLocation} style={{ padding: '10px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          📍 Auto Detect My Location
        </button>
      </div>

      {/* Hours & Status */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#6C63FF" /> Operating Hours
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div><label style={{ ...labelStyle, fontSize: '12px', color: '#64748B' }}>Opens at</label>
            <input type="time" value={form.open_time} onChange={e => handleChange('open_time', e.target.value)} style={inputStyle} /></div>
          <div><label style={{ ...labelStyle, fontSize: '12px', color: '#64748B' }}>Closes at</label>
            <input type="time" value={form.close_time} onChange={e => handleChange('close_time', e.target.value)} style={inputStyle} /></div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_open} onChange={e => handleChange('is_open', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#6C63FF' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: c('#334155', '#CBD5E1') }}>Shop is currently open</span>
        </label>
      </div>

      <button onClick={handleSave} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#6C63FF', color: 'white', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
        Save Changes ✅
      </button>
    </div>
  );
}
