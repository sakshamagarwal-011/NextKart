import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Star, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, getTimeAgo } from '../../lib/utils';
import { ORDER_STATUSES } from '../../lib/constants';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function DashboardPage() {
  const { shop } = useAuth();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (shop) { fetchStats(); fetchRecentOrders(); } }, [shop]);

  async function fetchStats() {
    const [ordersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('shop_id', shop.id),
      supabase.from('products').select('id', { count: 'exact' }).eq('shop_id', shop.id),
    ]);
    const orders = ordersRes.data || [];
    const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0);
    const pending = orders.filter(o => o.status === 'pending').length;
    setStats({ orders: orders.length, revenue, pending, products: productsRes.count || 0 });
  }

  async function fetchRecentOrders() {
    const { data } = await supabase.from('orders').select('*, profiles!orders_customer_id_fkey(full_name)').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(5);
    setRecentOrders(data || []);
    setLoading(false);
  }

  if (!shop) return <div className="p-6 text-center text-dark-500">Setting up your shop...</div>;
  if (loading) return <Spinner />;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: 'from-primary-500 to-primary-700', shadow: 'shadow-primary-500/25' },
    { icon: TrendingUp, label: 'Revenue', value: formatPrice(stats.revenue), color: 'from-success-400 to-success-600', shadow: 'shadow-success-400/25' },
    { icon: Clock, label: 'Pending', value: stats.pending, color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-400/25' },
    { icon: Package, label: 'Products', value: stats.products, color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/25' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-1">Dashboard 📊</h1>
        <p className="text-dark-500 text-sm">Welcome back, {shop.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className={`animate-fade-in bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} border-none`} style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={22} className="opacity-80" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-80 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Shop Rating */}
      <Card className="mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Star size={24} className="fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500">Shop Rating</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'No ratings yet'}</p>
            </div>
          </div>
          <p className="text-dark-400 text-sm">{shop.total_ratings || 0} reviews</p>
        </div>
      </Card>

      {/* Recent Orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark-900 dark:text-white">Recent Orders</h2>
        <Link to="/dashboard/orders" className="text-primary-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight size={14} /></Link>
      </div>

      <div className="space-y-3">
        {recentOrders.length === 0 ? (
          <Card><p className="text-dark-500 text-sm text-center py-4">No orders yet. Share your shop to get started! 🚀</p></Card>
        ) : recentOrders.map(order => (
          <Card key={order.id} className="animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-dark-900 dark:text-white text-sm">{order.order_number}</p>
                <p className="text-dark-400 text-xs mt-0.5">{order.profiles?.full_name} · {getTimeAgo(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-500 text-sm">{formatPrice(order.total_amount)}</p>
                <Badge status={order.status} className="mt-1">{ORDER_STATUSES[order.status]?.label}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
