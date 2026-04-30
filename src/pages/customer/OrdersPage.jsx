import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice, getTimeAgo } from '../../lib/utils';
import { ORDER_STATUSES } from '../../lib/constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const c = (light, dark) => isDark ? dark : light;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data } = await supabase.from('orders').select('*, shops(name, logo_url), order_items(*)').eq('customer_id', user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }

    function subscribeToOrders() {
      const channel = supabase.channel(`order-updates-${user.id}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'orders',
            filter: `customer_id=eq.${user.id}` 
          },
          (payload) => {
            console.log('Order update received:', payload);
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
            const statusLabel = ORDER_STATUSES[payload.new.status]?.label || payload.new.status;
            toast.success(`Order updated: ${statusLabel}`, {
              icon: '📦',
              duration: 4000
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
        
      return () => {
        supabase.removeChannel(channel);
      };
    }

    if (supabase) {
      fetchOrders();
      return subscribeToOrders();
    }
  }, [user.id]);

  const statusColors = { pending: '#F59E0B', accepted: '#6C63FF', preparing: '#8B5CF6', delivered: '#10B981', rejected: '#EF4444', cancelled: '#94A3B8' };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), margin: 0 }}>My Orders 📦</h1>
        <button 
          onClick={() => {
            const fetchOrders = async () => {
              setLoading(true);
              const { data } = await supabase.from('orders').select('*, shops(name, logo_url), order_items(*)').eq('customer_id', user.id).order('created_at', { ascending: false });
              setOrders(data || []);
              setLoading(false);
              toast.success('Orders refreshed');
            };
            fetchOrders();
          }}
          style={{ padding: '8px 12px', borderRadius: '10px', background: c('#F1F5F9', 'rgba(255,255,255,0.05)'), border: 'none', cursor: 'pointer', color: '#6C63FF', fontWeight: 600, fontSize: '13px' }}
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontWeight: 700, color: c('#1E293B', 'white') }}>No orders yet</h3>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Place your first order from a nearby shop!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, background: c('white', 'rgba(255,255,255,0.03)'), padding: '16px', cursor: 'pointer' }}
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c('#F1F5F9', '#1E293B'), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '20px', flexShrink: 0 }}>
                    {order.shops?.logo_url ? <img src={order.shops.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏪'}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: c('#0F172A', 'white'), fontSize: '14px', margin: 0 }}>{order.shops?.name}</h3>
                    <p style={{ color: '#94A3B8', fontSize: '12px', margin: '2px 0 0' }}>{order.order_number} · {getTimeAgo(order.created_at)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, color: 'white', background: statusColors[order.status] || '#94A3B8' }}>
                    {ORDER_STATUSES[order.status]?.label || order.status}
                  </span>
                  <span style={{ color: '#94A3B8', fontSize: '12px' }}>{expandedOrder === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}` }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    {order.order_items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: c('#475569', '#94A3B8') }}>{item.product_name} × {item.quantity}</span>
                        <span style={{ color: c('#334155', '#CBD5E1') }}>{formatPrice(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: '#94A3B8' }}>Payment</span>
                    <span style={{ color: c('#334155', '#CBD5E1'), fontWeight: 600, textTransform: 'uppercase' }}>{order.payment_method}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: c('#0F172A', 'white') }}>Total</span>
                    <span style={{ fontWeight: 800, color: '#6C63FF' }}>{formatPrice(order.total_amount)}</span>
                  </div>
                  <button onClick={() => { order.order_items?.forEach(item => addItem({ id: item.product_id, name: item.product_name, price: item.product_price, unit: 'piece' }, { id: order.shop_id, name: order.shops?.name })); toast.success('Items added to cart! 🔄'); }}
                    style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '10px', background: c('rgba(108,99,255,0.06)', 'rgba(108,99,255,0.15)'), color: '#6C63FF', fontWeight: 700, fontSize: '12px', border: 'none', cursor: 'pointer' }}>
                    🔄 Reorder
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
