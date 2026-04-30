import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function MobileNav() {
  const { isShopkeeper } = useAuth();
  const { totalItems } = useCart();
  const { isDark } = useTheme();
  const location = useLocation();

  const customerTabs = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/orders', icon: '📦', label: 'Orders' },
    { path: '/favorites', icon: '❤️', label: 'Saved' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  const shopkeeperTabs = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/products', icon: '📦', label: 'Products' },
    { path: '/dashboard/orders', icon: '🧾', label: 'Orders' },
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
  ];

  const tabs = isShopkeeper ? shopkeeperTabs : customerTabs;

  return (
    <div className="md:hidden" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      background: isDark ? 'rgba(2, 6, 23, 0.92)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '8px 8px 12px' }}>
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <Link key={tab.path} to={tab.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '4px 12px', borderRadius: '10px', textDecoration: 'none', position: 'relative' }}>
              <div style={{ padding: '4px 8px', borderRadius: '8px', background: isActive ? (isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)') : 'transparent', position: 'relative' }}>
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                {tab.label === 'Home' && !isShopkeeper && totalItems > 0 && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-4px', width: '14px', height: '14px', background: '#FF6B6B', color: 'white', fontSize: '8px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, color: isActive ? '#6C63FF' : '#94A3B8' }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
