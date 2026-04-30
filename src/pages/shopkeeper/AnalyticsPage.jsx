import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, ShoppingBag, Star, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../lib/utils';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';

export default function AnalyticsPage() {
  const { shop } = useAuth();
  const [data, setData] = useState({ orders: [], topProducts: [], chartData: [] });
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Analytics 📊</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: ShoppingBag, label: 'Total Orders', value: data.orders.length, color: 'text-primary-500' },
          { icon: TrendingUp, label: 'Total Revenue', value: formatPrice(totalRevenue), color: 'text-success-500' },
          { icon: Package, label: 'Avg Order', value: formatPrice(avgOrderValue), color: 'text-purple-500' },
          { icon: Star, label: 'Rating', value: shop?.rating > 0 ? Number(shop.rating).toFixed(1) : 'N/A', color: 'text-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-dark-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Orders Chart */}
      <Card className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="font-bold text-dark-900 dark:text-white mb-4">Orders — Last 7 Days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-dark-400)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-dark-400)' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="orders" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Revenue Chart */}
      <Card className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h2 className="font-bold text-dark-900 dark:text-white mb-4">Revenue — Last 7 Days</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-dark-200)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-dark-400)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-dark-400)' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-success-500)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Products */}
      <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <h2 className="font-bold text-dark-900 dark:text-white mb-4">Top Products</h2>
        {data.topProducts.length === 0 ? (
          <p className="text-dark-500 text-sm text-center py-4">No sales data yet.</p>
        ) : (
          <div className="space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xs font-bold text-primary-500">#{i + 1}</span>
                  <span className="text-sm font-medium text-dark-900 dark:text-white">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark-900 dark:text-white">{product.count} sold</p>
                  <p className="text-xs text-dark-400">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
