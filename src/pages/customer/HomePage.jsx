import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AREAS } from '../../lib/constants';
import { isShopOpen } from '../../lib/utils';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 13); }, [center]);
  return null;
}

export default function HomePage() {
  const { profile, updateProfile } = useAuth();
  const { isDark } = useTheme();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState(profile?.area || '');
  const [viewMode, setViewMode] = useState('grid');
  const [userLocation, setUserLocation] = useState(null);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  useEffect(() => { fetchShops(); getUserLocation(); }, [selectedArea]);

  async function getUserLocation() {
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 15000 }));
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setUserLocation({ lat: 28.6315, lng: 77.3710 });
    }
  }

  async function detectAndFilterArea() {
    const loadingToast = toast.loading('Detecting location...');
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 }));
      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
      const data = await res.json();
      const locality = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.county || '';
      
      if (locality) {
        const match = AREAS.find(a => locality.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(locality.toLowerCase()));
        const finalArea = match || locality;
        handleAreaChange(finalArea);
        toast.success(`Found you in ${finalArea}!`, { id: loadingToast });
      } else {
        toast.error('Could not determine area name', { id: loadingToast });
      }
    } catch {
      toast.error('Location access denied or failed', { id: loadingToast });
    }
  }

  async function fetchShops() {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    try {
      let query = supabase.from('shops').select('*');
      if (selectedArea) query = query.ilike('area', `%${selectedArea}%`);
      const { data, error } = await query.order('rating', { ascending: false });
      if (error) throw error;
      setShops(data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  function handleAreaChange(area) {
    setSelectedArea(area);
    setShowAreaDropdown(false);
    if (area && supabase) updateProfile({ area });
  }

  const filtered = shops.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const c = (light, dark) => isDark ? dark : light;

  const shopIcon = new L.DivIcon({
    className: '', html: '<div style="background:linear-gradient(135deg,#6C63FF,#4F46B8);width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;box-shadow:0 4px 12px rgba(108,99,255,0.4);border:2px solid white;">🏪</div>',
    iconSize: [32, 32], iconAnchor: [16, 16],
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '4px' }}>Discover Shops 🏪</h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Find the best local shops near you</p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <input type="text" placeholder="🔍  Search shops..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 200px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />

        {/* Area Dropdown */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={detectAndFilterArea} style={{ padding: '0 16px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }} title="Auto detect my location">
            📍 Detect
          </button>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Type area or 'All'" value={selectedArea} onChange={e => handleAreaChange(e.target.value)}
              list="home-area-suggestions"
              style={{ width: '200px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          <datalist id="home-area-suggestions">
            <option value="">All Areas</option>
            {AREAS.map(a => <option key={a} value={a} />)}
          </datalist>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: c('#F1F5F9', 'rgba(255,255,255,0.06)'), borderRadius: '12px', padding: '4px' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '8px 14px', borderRadius: '8px', background: viewMode === 'grid' ? (c('white', 'rgba(255,255,255,0.1)')) : 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
            ▦
          </button>
          <button onClick={() => setViewMode('map')} style={{ padding: '8px 14px', borderRadius: '8px', background: viewMode === 'map' ? (c('white', 'rgba(255,255,255,0.1)')) : 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', boxShadow: viewMode === 'map' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
            🗺️
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: c('#1E293B', 'white'), marginBottom: '8px' }}>No shops found</h3>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{selectedArea ? `No shops in ${selectedArea} yet. Try another area!` : 'No shops available. Be the first to register!'}</p>
        </div>
      ) : viewMode === 'map' ? (
        /* Map View */
        <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, height: '500px' }}>
          <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [28.6315, 77.3710]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {userLocation && <ChangeMapCenter center={[userLocation.lat, userLocation.lng]} />}
            {filtered.filter(s => s.latitude && s.longitude).map(shop => (
              <Marker key={shop.id} position={[shop.latitude, shop.longitude]} icon={shopIcon}>
                <Popup>
                  <div style={{ textAlign: 'center', padding: '4px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{shop.name}</p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px' }}>📍 {shop.area}</p>
                    <p style={{ fontSize: '12px', margin: '0 0 8px' }}>⭐ {shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'New'}</p>
                    <Link to={`/shop/${shop.id}`} style={{ color: '#6C63FF', fontWeight: 700, fontSize: '12px' }}>View Shop →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>📍 You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      ) : (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map((shop) => {
            const open = isShopOpen(shop.open_time, shop.close_time) && shop.is_open;
            return (
              <Link key={shop.id} to={`/shop/${shop.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {/* Cover */}
                  <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                    {shop.cover_url ? <img src={shop.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />
                    {/* Status */}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: open ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white' }}>
                      {open ? '● Open' : '● Closed'}
                    </span>
                    {/* Logo */}
                    <div style={{ position: 'absolute', bottom: '-20px', left: '16px', width: '52px', height: '52px', borderRadius: '14px', background: c('white', '#1E293B'), border: '3px solid', borderColor: c('white', '#1E293B'), boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {shop.logo_url ? <img src={shop.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>🏪</span>}
                    </div>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '28px 16px 16px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: c('#0F172A', 'white'), margin: 0 }}>{shop.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '13px', color: '#64748B' }}>
                      <span>📍 {shop.area}</span>
                      <span>⭐ {shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'New'}</span>
                    </div>
                    {shop.description && <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '8px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.description}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
