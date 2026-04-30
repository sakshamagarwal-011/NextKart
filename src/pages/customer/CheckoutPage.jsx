import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice, generateWhatsAppLink, generateOrderNumber } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [address, setAddress] = useState(profile?.area || '');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const c = (light, dark) => isDark ? dark : light;

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.1)')}`,
    background: c('white', 'rgba(255,255,255,0.05)'),
    color: c('#0F172A', 'white'), fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  async function handlePlaceOrder() {
    if (!address.trim()) return toast.error('Please enter delivery address');
    if (items.length === 0) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const shopId = items[0]?.shopId;
      const { data: order, error } = await supabase.from('orders').insert({
        order_number: orderNumber, customer_id: user.id, shop_id: shopId,
        payment_method: paymentMethod, total_amount: totalAmount,
        delivery_address: address, note,
      }).select().single();
      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id, product_id: item.id,
        product_name: item.name, product_price: item.price, quantity: item.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Notify shopkeeper
      const { data: shop } = await supabase.from('shops').select('owner_id, name').eq('id', shopId).single();
      if (shop) {
        await supabase.from('notifications').insert({
          user_id: shop.owner_id, title: 'New Order! 🎉',
          message: `${profile?.full_name} placed order ${orderNumber} (${formatPrice(totalAmount)})`,
          type: 'new_order',
        });
      }

      clearCart();
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) { toast.error(err.message); } finally { setLoading(false); }
  }

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Checkout 📝</h1>

      {/* Order Summary */}
      <div style={{ padding: '20px', borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 700, color: c('#0F172A', 'white'), marginBottom: '12px', fontSize: '15px' }}>Order Summary</h3>
        {items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
            <span style={{ color: c('#475569', '#94A3B8') }}>{item.name} × {item.quantity}</span>
            <span style={{ color: c('#334155', '#CBD5E1'), fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, color: c('#0F172A', 'white') }}>Total</span>
          <span style={{ fontWeight: 800, color: '#6C63FF', fontSize: '18px' }}>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Address */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '8px' }}>Delivery Address *</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} placeholder="Full delivery address..."
          style={{ ...inputStyle, resize: 'none', fontFamily: 'Inter, sans-serif' }} />
      </div>

      {/* Note */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '8px' }}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Any special instructions..." style={inputStyle} />
      </div>

      {/* Payment */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: c('#334155', '#CBD5E1'), marginBottom: '12px' }}>Payment Method</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[{ id: 'cod', label: '💵 Cash on Delivery', desc: 'Pay when delivered' }, { id: 'upi', label: '📱 UPI', desc: 'Pay via UPI app' }].map(pm => (
            <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
              style={{ flex: 1, padding: '16px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${paymentMethod === pm.id ? '#6C63FF' : c('#E2E8F0', 'rgba(255,255,255,0.08)')}`,
                background: paymentMethod === pm.id ? c('rgba(108,99,255,0.06)', 'rgba(108,99,255,0.12)') : c('white', 'rgba(255,255,255,0.03)'),
              }}>
              <p style={{ fontWeight: 700, fontSize: '14px', color: c('#0F172A', 'white'), margin: 0 }}>{pm.label}</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>{pm.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Place Order */}
      <button onClick={handlePlaceOrder} disabled={loading}
        style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #6C63FF, #5B52E5)', color: 'white', fontWeight: 700, fontSize: '16px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
        {loading ? '⏳ Placing Order...' : `Place Order — ${formatPrice(totalAmount)}`}
      </button>
    </div>
  );
}
