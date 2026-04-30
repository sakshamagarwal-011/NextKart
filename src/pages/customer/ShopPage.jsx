import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice, generateWhatsAppLink, isShopOpen } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ShopPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { items, addItem, updateQuantity, shopInfo } = useCart();
  const { isDark } = useTheme();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const c = (light, dark) => isDark ? dark : light;

  useEffect(() => {
    async function fetchShop() { const { data } = await supabase.from('shops').select('*').eq('id', id).single(); setShop(data); }
    async function fetchProducts() { setLoading(true); const { data } = await supabase.from('products').select('*').eq('shop_id', id).order('name'); setProducts(data || []); setLoading(false); }
    async function fetchReviews() { const { data } = await supabase.from('reviews').select('*, profiles(full_name)').eq('shop_id', id).order('created_at', { ascending: false }).limit(10); setReviews(data || []); }
    async function checkFavorite() { if (!user) return; const { data } = await supabase.from('favorites').select('*').eq('customer_id', user.id).eq('shop_id', id).single(); setIsFavorite(!!data); }

    if (supabase) { fetchShop(); fetchProducts(); fetchReviews(); checkFavorite(); }
  }, [id, user]);

  async function toggleFavorite() {
    if (!user) return toast.error('Please login first');
    if (isFavorite) { await supabase.from('favorites').delete().eq('customer_id', user.id).eq('shop_id', id); setIsFavorite(false); toast.success('Removed from favorites'); }
    else { await supabase.from('favorites').insert({ customer_id: user.id, shop_id: id }); setIsFavorite(true); toast.success('Added to favorites! ❤️'); }
  }

  function getCartQty(productId) { return items.find(i => i.id === productId)?.quantity || 0; }

  const filtered = products.filter(p => { if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false; if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false; return true; });

  if (loading && !shop) return <Spinner />;
  if (!shop) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748B' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div><h3 style={{ fontSize: '18px', fontWeight: 700, color: c('#1E293B', 'white') }}>Shop not found</h3></div>;

  const isOpen = isShopOpen(shop.open_time, shop.close_time) && shop.is_open;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      {/* Shop Header */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '32px', position: 'relative' }}>
        <div style={{ height: '220px', position: 'relative' }}>
          {shop.cover_url ? <img src={shop.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #6C63FF, #4F46B8, #00D9A6)' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1), transparent)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'white', border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {shop.logo_url ? <img src={shop.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px' }}>🏪</span>}
              </div>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: 0 }}>{shop.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '4px' }}>
                  <span>📍 {shop.area}</span>
                  <span>⭐ {shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'New'} ({shop.total_ratings || 0})</span>
                  <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: isOpen ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white' }}>
                    {isOpen ? '● Open' : '● Closed'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={toggleFavorite} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                {isFavorite ? '❤️' : '🤍'}
              </button>
              {shop.whatsapp_number && (
                <a href={generateWhatsAppLink(shop.whatsapp_number, shop.name, (shopInfo?.id === shop.id ? items : []).map(i => ({ product_name: i.name, quantity: i.quantity, product_price: i.price })), 0)}
                  target="_blank" rel="noopener noreferrer" style={{ padding: '10px', borderRadius: '12px', background: 'rgba(37,211,102,0.8)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', fontSize: '18px', textDecoration: 'none', display: 'flex' }}>
                  💬
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {shop.description && <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px', maxWidth: '700px', lineHeight: 1.6 }}>{shop.description}</p>}

      {/* Search */}
      <input type="text" placeholder="🔍  Search products..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`, background: c('white', 'rgba(255,255,255,0.05)'), color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        <button onClick={() => setSelectedCategory('all')} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.2s', background: selectedCategory === 'all' ? '#6C63FF' : c('#F1F5F9', 'rgba(255,255,255,0.06)'), color: selectedCategory === 'all' ? 'white' : c('#475569', '#94A3B8') }}>
          All
        </button>
        {CATEGORIES.filter(cat => products.some(p => p.category_id === cat.id)).map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', transition: 'all 0.2s', background: selectedCategory === cat.id ? '#6C63FF' : c('#F1F5F9', 'rgba(255,255,255,0.06)'), color: selectedCategory === cat.id ? 'white' : c('#475569', '#94A3B8') }}>
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontWeight: 700, color: c('#1E293B', 'white') }}>No products found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {filtered.map(product => {
            const qty = getCartQty(product.id);
            return (
              <div key={product.id} style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), transition: 'all 0.2s' }}>
                <div style={{ height: '140px', position: 'relative', overflow: 'hidden', background: c('#F1F5F9', '#1E293B') }}>
                  {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>}
                  {!product.in_stock && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'white', fontWeight: 700, fontSize: '12px', background: '#EF4444', padding: '4px 12px', borderRadius: '100px' }}>Out of Stock</span></div>}
                </div>
                <div style={{ padding: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: c('#0F172A', 'white'), margin: 0 }}>{product.name}</h3>
                  {product.description && <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: c('#0F172A', 'white') }}>{formatPrice(product.price)}</span>
                      <span style={{ color: '#94A3B8', fontSize: '11px', marginLeft: '4px' }}>/{product.unit}</span>
                    </div>
                    {product.in_stock && (
                      qty > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: c('rgba(108,99,255,0.08)', 'rgba(108,99,255,0.15)'), borderRadius: '10px', padding: '4px', opacity: isOpen ? 1 : 0.5 }}>
                          <button onClick={() => updateQuantity(product.id, qty - 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', fontWeight: 700, fontSize: '16px' }}>−</button>
                          <span style={{ width: '20px', textAlign: 'center', fontWeight: 800, color: '#6C63FF', fontSize: '14px' }}>{qty}</span>
                          <button onClick={() => isOpen ? updateQuantity(product.id, qty + 1) : toast.error('Shop is currently closed')} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'none', border: 'none', cursor: isOpen ? 'pointer' : 'not-allowed', color: '#6C63FF', fontWeight: 700, fontSize: '16px' }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => isOpen ? addItem(product, shop) : toast.error('Shop is currently closed')} style={{ padding: '8px 16px', borderRadius: '10px', background: isOpen ? '#6C63FF' : '#94A3B8', color: 'white', fontWeight: 700, fontSize: '12px', border: 'none', cursor: isOpen ? 'pointer' : 'not-allowed', boxShadow: isOpen ? '0 4px 12px rgba(108,99,255,0.3)' : 'none' }}>
                          {isOpen ? '+ Add' : 'Closed'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '16px' }}>Reviews ({reviews.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ padding: '16px', borderRadius: '14px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)') }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: c('rgba(108,99,255,0.1)', 'rgba(108,99,255,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#6C63FF', fontSize: '13px' }}>{review.profiles?.full_name?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: c('#0F172A', 'white') }}>{review.profiles?.full_name}</span>
                    <span style={{ marginLeft: '8px', color: '#FBBF24' }}>{'⭐'.repeat(review.rating)}</span>
                  </div>
                </div>
                {review.comment && <p style={{ color: '#64748B', fontSize: '13px', marginTop: '8px', lineHeight: 1.5 }}>{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
