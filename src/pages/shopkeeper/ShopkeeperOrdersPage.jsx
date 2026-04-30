import { useState, useEffect } from 'react';
import { Check, X, Truck, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getTimeAgo } from '../../lib/utils';
import { ORDER_STATUSES } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function ShopkeeperOrdersPage() {
  const { shop, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Orders 📋</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filterTabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-all capitalize
              ${filter === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200'}`}>
            {tab} {tab !== 'all' && <span className="ml-1 opacity-70">({orders.filter(o => o.status === tab).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders" description={filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`} />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <Card key={order.id} className="animate-fade-in">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-dark-900 dark:text-white text-sm">{order.order_number}</p>
                    <Badge status={order.status}>{ORDER_STATUSES[order.status]?.label}</Badge>
                  </div>
                  <p className="text-dark-400 text-xs mt-0.5">{order.profiles?.full_name} · {getTimeAgo(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary-500">{formatPrice(order.total_amount)}</span>
                  {expandedOrder === order.id ? <ChevronUp size={16} className="text-dark-400" /> : <ChevronDown size={16} className="text-dark-400" />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700 animate-fade-in">
                  {/* Customer Info */}
                  <div className="bg-dark-50 dark:bg-dark-900 rounded-xl p-3 mb-3">
                    <p className="text-xs text-dark-400 mb-1">Customer</p>
                    <p className="text-sm font-semibold text-dark-900 dark:text-white">{order.profiles?.full_name}</p>
                    {order.profiles?.phone && <p className="text-xs text-dark-500">📞 {order.profiles.phone}</p>}
                    {order.delivery_address && <p className="text-xs text-dark-500 mt-1">📍 {order.delivery_address}</p>}
                    {order.note && <p className="text-xs text-dark-500 mt-1">📝 {order.note}</p>}
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 mb-3">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-dark-600 dark:text-dark-400">{item.product_name} × {item.quantity}</span>
                        <span className="text-dark-700 dark:text-dark-300">{formatPrice(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-dark-400">Payment</span><span className="font-medium uppercase text-dark-700 dark:text-dark-300">{order.payment_method} · {order.payment_status}</span></div>
                  <div className="flex justify-between font-bold text-dark-900 dark:text-white mb-4"><span>Total</span><span className="text-primary-500">{formatPrice(order.total_amount)}</span></div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <>
                        <Button size="sm" variant="success" icon={Check} onClick={() => updateOrderStatus(order.id, 'accepted', order.customer_id)}>Accept</Button>
                        <Button size="sm" variant="danger" icon={X} onClick={() => updateOrderStatus(order.id, 'rejected', order.customer_id)}>Reject</Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <Button size="sm" icon={Check} onClick={() => updateOrderStatus(order.id, 'preparing', order.customer_id)}>Start Preparing</Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button size="sm" variant="success" icon={Truck} onClick={() => updateOrderStatus(order.id, 'delivered', order.customer_id)}>Mark Delivered</Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
