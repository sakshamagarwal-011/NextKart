import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Star, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice, getTimeAgo } from '../../lib/utils';
import { ORDER_STATUSES } from '../../lib/constants';
import Spinner from '../../components/ui/Spinner';

export default function DashboardPage() {
  const { shop } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    if (shop) { fetchStats(); fetchRecentOrders(); }
  }, [shop]);

  const c = (light, dark) => isDark ? dark : light;

  if (!shop) return <div style={{ padding: '24px', textAlign: 'center', color: c('#64748B', '#94A3B8') }}>Setting up your shop...</div>;
  if (loading) return <Spinner />;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, bg: 'linear-gradient(135deg, #6C63FF, #4F46B8)' },
    { icon: TrendingUp, label: 'Revenue', value: formatPrice(stats.revenue), bg: 'linear-gradient(135deg, #10B981, #059669)' },
    { icon: Clock, label: 'Pending', value: stats.pending, bg: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { icon: Package, label: 'Products', value: stats.products, bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), margin: '0 0 4px' }}>Dashboard 📊</h1>
        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Welcome back, {shop.name}!</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ background: stat.bg, padding: '24px', borderRadius: '20px', color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            <stat.icon size={24} style={{ opacity: 0.8, marginBottom: '12px' }} />
            <p style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px' }}>{stat.value}</p>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, fontWeight: 500 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Shop Rating */}
      <div style={{ padding: '24px', borderRadius: '20px', background: c('white', 'rgba(255,255,255,0.03)'), border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c('#FEF3C7', 'rgba(245,158,11,0.15)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} color="#F59E0B" fill="#F59E0B" />
          </div>
          <div>
            <p style={{ color: '#64748B', fontSize: '13px', margin: '0 0 2px', fontWeight: 500 }}>Shop Rating</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), margin: 0 }}>{shop.rating > 0 ? Number(shop.rating).toFixed(1) : 'No ratings yet'}</p>
          </div>
        </div>
        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>{shop.total_ratings || 0} reviews</p>
      </div>

      {/* Recent Orders */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: c('#0F172A', 'white'), margin: 0 }}>Recent Orders</h2>
        <Link to="/dashboard/orders" style={{ color: '#6C63FF', fontSize: '14px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          View all <ArrowRight size={16} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recentOrders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: c('white', 'rgba(255,255,255,0.03)'), borderRadius: '16px', border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}` }}>
            <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>No orders yet. Share your shop to get started! 🚀</p>
          </div>
        ) : recentOrders.map(order => (
          <div key={order.id} style={{ padding: '20px', borderRadius: '16px', background: c('white', 'rgba(255,255,255,0.03)'), border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: c('#0F172A', 'white'), margin: '0 0 4px' }}>{order.order_number}</p>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>{order.profiles?.full_name} · {getTimeAgo(order.created_at)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#6C63FF', margin: '0 0 6px' }}>{formatPrice(order.total_amount)}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, background: ORDER_STATUSES[order.status]?.color?.includes('success') ? 'rgba(16,185,129,0.1)' : ORDER_STATUSES[order.status]?.color?.includes('warning') ? 'rgba(245,158,11,0.1)' : 'rgba(108,99,255,0.1)', color: ORDER_STATUSES[order.status]?.color?.includes('success') ? '#10B981' : ORDER_STATUSES[order.status]?.color?.includes('warning') ? '#F59E0B' : '#6C63FF' }}>
                {ORDER_STATUSES[order.status]?.icon} {ORDER_STATUSES[order.status]?.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
