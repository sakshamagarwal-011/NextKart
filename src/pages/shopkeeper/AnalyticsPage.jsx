import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingBag, Star, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPrice } from '../../lib/utils';
import Spinner from '../../components/ui/Spinner';

export default function AnalyticsPage() {
  const { shop } = useAuth();
  const { isDark } = useTheme();
  const [data, setData] = useState({ orders: [], topProducts: [], chartData: [] });
  const [loading, setLoading] = useState(true);

  const c = (light, dark) => isDark ? dark : light;

  useEffect(() => { if (shop) fetchAnalytics(); }, [shop]);

  async function fetchAnalytics() {
    setLoading(true);
    const { data: orders } = await supabase.from('orders').select('*, order_items(*)').eq('shop_id', shop.id);
    const allOrders = orders || [];

    // Orders over last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = allOrders.filter(o => o.created_at?.startsWith(dateStr));
      const revenue = dayOrders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0);
      last7.push({ date: date.toLocaleDateString('en-IN', { weekday: 'short' }), orders: dayOrders.length, revenue });
    }

    // Top products
    const productMap = {};
    allOrders.forEach(order => {
      order.order_items?.forEach(item => {
        if (!productMap[item.product_name]) productMap[item.product_name] = { name: item.product_name, count: 0, revenue: 0 };
        productMap[item.product_name].count += item.quantity;
        productMap[item.product_name].revenue += item.product_price * item.quantity;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.count - a.count).slice(0, 5);

    setData({ orders: allOrders, topProducts, chartData: last7 });
    setLoading(false);
  }

  if (loading) return <Spinner />;

  const totalRevenue = data.orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrderValue = data.orders.length ? totalRevenue / data.orders.filter(o => o.status === 'delivered').length || 0 : 0;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: data.orders.length, color: '#6C63FF' },
    { icon: TrendingUp, label: 'Total Revenue', value: formatPrice(totalRevenue), color: '#10B981' },
    { icon: Package, label: 'Avg Order', value: formatPrice(avgOrderValue), color: '#8B5CF6' },
    { icon: Star, label: 'Rating', value: shop?.rating > 0 ? Number(shop.rating).toFixed(1) : 'N/A', color: '#F59E0B' },
  ];

  const cardStyle = { padding: '24px', borderRadius: '20px', background: c('white', 'rgba(255,255,255,0.03)'), border: `1px solid ${c('#E2E8F0', 'rgba(255,255,255,0.08)')}`, marginBottom: '24px' };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 100px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '24px' }}>Analytics 📊</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <div key={i} style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <stat.icon size={24} color={stat.color} style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '24px', fontWeight: 800, color: c('#0F172A', 'white'), margin: '0 0 4px' }}>{stat.value}</p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Orders Chart */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '20px' }}>Orders — Last 7 Days</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={c('#E2E8F0', '#334155')} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: c('white', '#1E293B'), color: c('#0F172A', 'white'), boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="orders" fill="#6C63FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '20px' }}>Revenue — Last 7 Days</h2>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={c('#E2E8F0', '#334155')} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: c('white', '#1E293B'), color: c('#0F172A', 'white'), boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: c('white', '#0F172A') }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: c('#0F172A', 'white'), marginBottom: '20px' }}>Top Products</h2>
        {data.topProducts.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '14px', textAlign: 'center', padding: '20px 0', margin: 0 }}>No sales data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.topProducts.map((product, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: i === data.topProducts.length - 1 ? 'none' : `1px solid ${c('#F1F5F9', 'rgba(255,255,255,0.05)')}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#6C63FF' }}>#{i + 1}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: c('#0F172A', 'white') }}>{product.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: c('#0F172A', 'white'), margin: '0 0 2px' }}>{product.count} sold</p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
