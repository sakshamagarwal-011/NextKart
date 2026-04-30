import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../lib/utils';

export default function CartPage() {
  const { items, updateQuantity, totalAmount, clearCart } = useCart();
  const { isDark } = useTheme();
  const c = (light, dark) => isDark ? dark : light;

  if (items.length === 0) return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
      <h2 style={{ fontSize: '22px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '8px' }}>Your cart is empty</h2>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Browse shops and add items to get started!</p>
      <Link to="/home" style={{ padding: '12px 24px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Browse Shops →</Link>
    </div>
  );

  const shopName = items[0]?.shopName || 'Shop';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px 120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white') }}>Cart 🛒</h1>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '2px' }}>from {shopName} · {items.length} items</p>
        </div>
        <button onClick={clearCart} style={{ padding: '8px 14px', borderRadius: '10px', background: c('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.15)'), color: '#EF4444', fontWeight: 700, fontSize: '12px', border: 'none', cursor: 'pointer' }}>
          Clear All
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '14px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)') }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: c('#F1F5F9', '#1E293B'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, overflow: 'hidden' }}>
              {item.image_url ? <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: c('#0F172A', 'white'), margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h4>
              <p style={{ color: '#64748B', fontSize: '12px', margin: '2px 0 0' }}>{formatPrice(item.price)} / {item.unit}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: c('rgba(108,99,255,0.06)', 'rgba(108,99,255,0.15)'), borderRadius: '10px', padding: '4px' }}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', fontWeight: 700, fontSize: '16px' }}>−</button>
              <span style={{ width: '20px', textAlign: 'center', fontWeight: 800, color: '#6C63FF', fontSize: '13px' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6C63FF', fontWeight: 700, fontSize: '16px' }}>+</button>
            </div>
            <div style={{ textAlign: 'right', minWidth: '60px' }}>
              <p style={{ fontWeight: 800, color: c('#0F172A', 'white'), fontSize: '14px', margin: 0 }}>{formatPrice(item.price * item.quantity)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ padding: '20px', borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#64748B', fontSize: '14px' }}>Subtotal</span>
          <span style={{ fontWeight: 600, color: c('#334155', '#CBD5E1'), fontSize: '14px' }}>{formatPrice(totalAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#64748B', fontSize: '14px' }}>Delivery</span>
          <span style={{ fontWeight: 600, color: '#10B981', fontSize: '14px' }}>FREE</span>
        </div>
        <div style={{ borderTop: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: c('#0F172A', 'white'), fontSize: '16px' }}>Total</span>
          <span style={{ fontWeight: 800, color: '#6C63FF', fontSize: '18px' }}>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <Link to="/checkout" style={{ display: 'block', width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #6C63FF, #5B52E5)', color: 'white', fontWeight: 700, fontSize: '16px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 8px 24px rgba(108,99,255,0.3)', boxSizing: 'border-box' }}>
        Proceed to Checkout →
      </Link>
    </div>
  );
}
