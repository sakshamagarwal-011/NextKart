import { useState } from 'react';
import { MapPin, Phone, Clock, CreditCard, MessageCircle, Upload, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AREAS } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ShopProfilePage() {
  const { shop, updateShop } = useAuth();
  const [form, setForm] = useState({
    name: shop?.name || '', description: shop?.description || '', address: shop?.address || '',
    area: shop?.area || '', phone: shop?.phone || '', upi_id: shop?.upi_id || '',
    whatsapp_number: shop?.whatsapp_number || '', open_time: shop?.open_time || '09:00',
    close_time: shop?.close_time || '21:00', is_open: shop?.is_open ?? true,
    latitude: shop?.latitude || '', longitude: shop?.longitude || '',
  });
  const [uploading, setUploading] = useState(false);

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
      handleChange('latitude', pos.coords.latitude);
      handleChange('longitude', pos.coords.longitude);
      toast.success('Location detected! Save to apply.');
    } catch { toast.error('Could not detect location'); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Shop Settings ⚙️</h1>

      {/* Images */}
      <Card className="mb-6">
        <h2 className="font-bold text-dark-900 dark:text-white mb-4">Shop Images</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-dark-500 mb-2">Logo</p>
            <label className="block w-24 h-24 rounded-xl bg-dark-100 dark:bg-dark-700 border-2 border-dashed border-dark-300 dark:border-dark-600 cursor-pointer hover:border-primary-500 transition-colors overflow-hidden">
              {shop?.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center"><Camera size={24} className="text-dark-400" /></div>}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'logo')} />
            </label>
          </div>
          <div>
            <p className="text-sm text-dark-500 mb-2">Cover</p>
            <label className="block h-24 rounded-xl bg-dark-100 dark:bg-dark-700 border-2 border-dashed border-dark-300 dark:border-dark-600 cursor-pointer hover:border-primary-500 transition-colors overflow-hidden">
              {shop?.cover_url ? <img src={shop.cover_url} alt="" className="w-full h-full object-cover" /> :
                <div className="w-full h-full flex items-center justify-center"><Upload size={24} className="text-dark-400" /></div>}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'cover')} />
            </label>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card className="mb-6">
        <h2 className="font-bold text-dark-900 dark:text-white mb-4">Shop Details</h2>
        <div className="space-y-4">
          {[{ label: 'Shop Name', field: 'name', type: 'text', placeholder: 'Your shop name' },
            { label: 'Description', field: 'description', type: 'textarea', placeholder: 'Tell customers about your shop...' },
            { label: 'Address', field: 'address', type: 'text', placeholder: 'Full address' },
            { label: 'Phone', field: 'phone', type: 'tel', placeholder: '10-digit phone' },
            { label: 'UPI ID', field: 'upi_id', type: 'text', placeholder: 'yourname@upi' },
            { label: 'WhatsApp Number', field: 'whatsapp_number', type: 'tel', placeholder: 'WhatsApp number' },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">{label}</label>
              {type === 'textarea' ? (
                <textarea value={form[field]} onChange={e => handleChange(field, e.target.value)} rows={2} placeholder={placeholder}
                  className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white resize-none" />
              ) : (
                <input type={type} value={form[field]} onChange={e => handleChange(field, e.target.value)} placeholder={placeholder}
                  className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white" />
              )}
            </div>
          ))}

          <div>
            <label className="text-sm font-medium text-dark-700 dark:text-dark-300 block mb-1">Area</label>
            <select value={form.area} onChange={e => handleChange('area', e.target.value)}
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:text-white">
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Location */}
      <Card className="mb-6">
        <h2 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary-500" />Map Location</h2>
        <p className="text-dark-500 text-sm mb-3">Set your shop location so customers can find you on the map.</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input type="number" step="any" value={form.latitude} onChange={e => handleChange('latitude', e.target.value)} placeholder="Latitude"
            className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:text-white" />
          <input type="number" step="any" value={form.longitude} onChange={e => handleChange('longitude', e.target.value)} placeholder="Longitude"
            className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:text-white" />
        </div>
        <Button variant="outline" size="sm" onClick={detectShopLocation}>📍 Auto Detect My Location</Button>
      </Card>

      {/* Hours & Status */}
      <Card className="mb-6">
        <h2 className="font-bold text-dark-900 dark:text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-primary-500" />Operating Hours</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className="text-xs text-dark-500 block mb-1">Opens at</label>
            <input type="time" value={form.open_time} onChange={e => handleChange('open_time', e.target.value)}
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:text-white" /></div>
          <div><label className="text-xs text-dark-500 block mb-1">Closes at</label>
            <input type="time" value={form.close_time} onChange={e => handleChange('close_time', e.target.value)}
              className="w-full rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900 px-4 py-2.5 text-sm outline-none focus:border-primary-500 dark:text-white" /></div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_open} onChange={e => handleChange('is_open', e.target.checked)}
            className="w-5 h-5 rounded-md accent-primary-500" />
          <span className="text-sm font-medium text-dark-700 dark:text-dark-300">Shop is currently open</span>
        </label>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg">Save Changes ✅</Button>
    </div>
  );
}
