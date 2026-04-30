import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { profile, signOut, isShopkeeper } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const customerLinks = [
    { path: '/home', label: '🏪 Shops' },
    { path: '/orders', label: '📦 Orders' },
    { path: '/favorites', label: '❤️ Saved' },
  ];

  const shopkeeperLinks = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/dashboard/products', label: '📦 Products' },
    { path: '/dashboard/orders', label: '🧾 Orders' },
    { path: '/dashboard/analytics', label: '📈 Analytics' },
    { path: '/home', label: '🛍️ Marketplace' },
  ];

  const links = isShopkeeper ? shopkeeperLinks : customerLinks;

  const navStyle = {
    position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    background: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
  };

  const linkStyle = (active) => ({
    padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.2s',
    background: active ? (isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.08)') : 'transparent',
    color: active ? '#6C63FF' : (isDark ? '#94A3B8' : '#475569'),
  });

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        {/* Logo */}
        <Link to={isShopkeeper ? '/dashboard' : '/home'} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '13px' }}>NK</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #6C63FF, #00D9A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NearKart</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
          {links.map(link => (
            <Link key={link.path} to={link.path} style={linkStyle(isActive(link.path))}>{link.label}</Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Area chip */}
          {profile?.area && !isShopkeeper && (
            <div style={{ padding: '6px 12px', borderRadius: '8px', background: isDark ? 'rgba(108,99,255,0.12)' : 'rgba(108,99,255,0.08)', color: '#6C63FF', fontSize: '12px', fontWeight: 600 }} className="hidden sm:flex">
              📍 {profile.area}
            </div>
          )}

          {/* Theme */}
          <button onClick={toggleTheme} style={{ padding: '10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Cart */}
          {!isShopkeeper && (
            <Link to="/cart" style={{ position: 'relative', padding: '10px', borderRadius: '10px', textDecoration: 'none', fontSize: '18px' }}>
              🛒
              {totalItems > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', background: '#FF6B6B', color: 'white', fontSize: '10px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button onClick={() => setProfileOpen(!profileOpen)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>{profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <span style={{ fontSize: '12px', color: isDark ? '#64748B' : '#94A3B8' }}>{profileOpen ? '▲' : '▼'}</span>
            </button>

            {profileOpen && (
              <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '220px', borderRadius: '16px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', background: isDark ? '#0F172A' : 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden', zIndex: 50 }}>
                <div style={{ padding: '16px', borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: isDark ? 'white' : '#0F172A' }}>{profile?.full_name}</p>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{profile?.email}</p>
                  <span style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, background: isDark ? 'rgba(108,99,255,0.15)' : 'rgba(108,99,255,0.1)', color: '#6C63FF', textTransform: 'capitalize' }}>
                    {profile?.role}
                  </span>
                </div>
                <div style={{ padding: '8px' }}>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', color: isDark ? '#CBD5E1' : '#334155', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    👤 Profile
                  </Link>
                  {isShopkeeper && (
                    <Link to="/dashboard/shop" onClick={() => setProfileOpen(false)} style={{ display: 'block', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', color: isDark ? '#CBD5E1' : '#334155' }}
                      onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      🏪 Shop Settings
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setProfileOpen(false); navigate('/'); }}
                    style={{ width: '100%', display: 'block', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
