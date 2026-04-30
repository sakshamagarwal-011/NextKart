import { useState, useEffect } from 'react';
import { Check, X, Truck, ChevronDown, ChevronUp, Filter, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice, getTimeAgo } from '../../lib/utils';
import { ORDER_STATUSES } from '../../lib/constants';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ShopkeeperOrdersPage() {
  const { shop } = useAuth();
  const { isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const c = (light, dark) => isDark ? dark : light;

  useEffect(() => { if (shop) { fetchOrders(); subscribeOrders(); } }, [shop]);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase.from('orders')
      .select('*, profiles!orders_customer_id_fkey(full_name, phone, area), order_items(*)')
      .eq('shop_id', shop.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  function subscribeOrders() {
    const channel = supabase.channel('shop-orders').on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders', filter: `shop_id=eq.${shop.id}` },
      () => { fetchOrders(); toast.success('New order received! 🎉'); new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==').play().catch(() => {}); }
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }

  async function updateOrderStatus(orderId, status, customerId) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    await supabase.from('notifications').insert({
      user_id: customerId, title: `Order ${ORDER_STATUSES[status]?.label}`,
      message: `Your order status has been updated to ${status}`, type: 'order_update',
    });
    toast.success(`Order ${status}`);
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const filterTabs = ['all', 'pending', 'accepted', 'preparing', 'delivered', 'rejected'];

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Orders 📋</h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {filterTabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize', border: 'none',
              background: filter === tab ? '#6C63FF' : c('#F1F5F9', 'rgba(255,255,255,0.05)'),
              color: filter === tab ? 'white' : c('#475569', '#94A3B8'),
              boxShadow: filter === tab ? '0 4px 12px rgba(108,99,255,0.3)' : 'none'
            }}>
            {tab} {tab !== 'all' && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({orders.filter(o => o.status === tab).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: c('white', 'rgba(255,255,255,0.03)'), borderRadius: '20px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}` }}>
          <ShoppingBag size={48} color="#6C63FF" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: c('#1E293B', 'white'), margin: '0 0 8px' }}>No orders</h3>
          <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(order => (
            <div key={order.id} style={{ padding: '20px', borderRadius: '16px', background: c('white', 'rgba(255,255,255,0.03)'), border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 800, color: c('#0F172A', 'white'), fontSize: '15px', margin: 0 }}>{order.order_number}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: ORDER_STATUSES[order.status]?.color?.includes('success') ? 'rgba(16,185,129,0.1)' : ORDER_STATUSES[order.status]?.color?.includes('warning') ? 'rgba(245,158,11,0.1)' : ORDER_STATUSES[order.status]?.color?.includes('accent') ? 'rgba(239,68,68,0.1)' : 'rgba(108,99,255,0.1)', color: ORDER_STATUSES[order.status]?.color?.includes('success') ? '#10B981' : ORDER_STATUSES[order.status]?.color?.includes('warning') ? '#F59E0B' : ORDER_STATUSES[order.status]?.color?.includes('accent') ? '#EF4444' : '#6C63FF' }}>
                      {ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}
                    </span>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>{order.profiles?.full_name} · {getTimeAgo(order.created_at)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, color: '#6C63FF', fontSize: '16px' }}>{formatPrice(order.total_amount)}</span>
                  {expandedOrder === order.id ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${c('#F1F5F9', 'rgba(255,255,255,0.05)')}` }}>
                  {/* Customer Info */}
                  <div style={{ background: c('#F8FAFC', 'rgba(255,255,255,0.02)'), borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>Customer Details</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: c('#0F172A', 'white'), margin: '0 0 4px' }}>{order.profiles?.full_name}</p>
                    {order.profiles?.phone && <p style={{ fontSize: '13px', color: c('#475569', '#94A3B8'), margin: '0 0 4px' }}>📞 {order.profiles.phone}</p>}
                    {order.delivery_address && <p style={{ fontSize: '13px', color: c('#475569', '#94A3B8'), margin: '0 0 4px' }}>📍 {order.delivery_address}</p>}
                    {order.note && <p style={{ fontSize: '13px', color: c('#475569', '#94A3B8'), margin: '0', fontStyle: 'italic' }}>📝 "{order.note}"</p>}
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase' }}>Items</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.order_items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: c('#334155', '#CBD5E1') }}>{item.product_name} × <span style={{ fontWeight: 600 }}>{item.quantity}</span></span>
                          <span style={{ fontWeight: 600, color: c('#0F172A', 'white') }}>{formatPrice(item.product_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals & Payment */}
                  <div style={{ borderTop: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, paddingTop: '12px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}><span style={{ color: '#64748B' }}>Payment</span><span style={{ fontWeight: 600, color: c('#334155', '#CBD5E1'), textTransform: 'uppercase' }}>{order.payment_method} · {order.payment_status}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white') }}><span>Total Amount</span><span style={{ color: '#6C63FF' }}>{formatPrice(order.total_amount)}</span></div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {order.status === 'pending' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'accepted', order.customer_id); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#10B981', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Check size={18} /> Accept Order
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'rejected', order.customer_id); }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#EF4444', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <X size={18} /> Reject
                        </button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'preparing', order.customer_id); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#F59E0B', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Check size={18} /> Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'delivered', order.customer_id); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#6C63FF', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Truck size={18} /> Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
