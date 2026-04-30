import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Spinner from '../../components/ui/Spinner';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const c = (light, dark) => isDark ? dark : light;

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      const { data } = await supabase.from('favorites').select('*, shops(*)').eq('customer_id', user.id);
      setShops(data?.map(f => f.shops).filter(Boolean) || []);
      setLoading(false);
    }
    if (supabase) fetchFavorites();
  }, [user.id]);

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Favorite Shops ❤️</h1>
      {shops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>❤️</div>
          <h3 style={{ fontWeight: 700, color: c('#1E293B', 'white') }}>No favorites yet</h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>Save your favorite shops for quick access</p>
          <Link to="/home" style={{ padding: '10px 20px', borderRadius: '10px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Browse Shops</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {shops.map(shop => (
            <Link key={shop.id} to={`/shop/${shop.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '14px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: c('#F1F5F9', '#1E293B'), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '24px', flexShrink: 0 }}>
                  {shop.logo_url ? <img src={shop.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏪'}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, color: c('#0F172A', 'white'), fontSize: '15px', margin: 0 }}>{shop.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
                    <span>📍 {shop.area}</span>
                    <span>⭐ {shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'New'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
