import { Link } from 'react-router-dom';

export default function LandingPage() {
  const cardStyle = {
    position: 'relative', padding: '32px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)', textDecoration: 'none', color: 'white',
    transition: 'all 0.3s ease', cursor: 'pointer', display: 'block',
  };

  const featureStyle = {
    padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(255,255,255,0.02)', textAlign: 'center',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020617 0%, #0F172A 40%, #020617 100%)', color: 'white', overflow: 'hidden', position: 'relative' }}>
      {/* Glow decorations */}
      <div style={{ position: 'absolute', top: '-200px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.08)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-200px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(0, 217, 166, 0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      {/* Navbar */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(108,99,255,0.4)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>NK</span>
          </div>
          <span style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(to right, white, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NearKart</span>
        </div>
        <Link to="/login" style={{ padding: '10px 20px', borderRadius: '10px', color: '#CBD5E1', fontSize: '14px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}>
          Sign In
        </Link>
      </header>

      {/* Hero */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', border: '1px solid rgba(108,99,255,0.3)', background: 'rgba(108,99,255,0.1)', color: '#A5B4FC', fontSize: '13px', fontWeight: 600, marginBottom: '32px' }}>
          ⚡ Hyperlocal Shopping, Reimagined
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '20px' }}>
          Your Local Shops,<br />
          <span style={{ background: 'linear-gradient(135deg, #818CF8, #6C63FF, #00D9A6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Now Online</span>
        </h1>

        <p style={{ fontSize: '18px', color: '#64748B', maxWidth: '520px', margin: '0 auto 48px', lineHeight: 1.7 }}>
          Discover nearby shops, browse products, and get everything delivered to your doorstep. Support local businesses with every order.
        </p>

        {/* Role Cards - 4 Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Sign Up Customer */}
          <Link to="/signup?role=customer" style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>🆕 🛒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>New User?</h3>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>Create a new account to browse local shops and order.</p>
            <span style={{ color: '#818CF8', fontSize: '13px', fontWeight: 700 }}>Sign up as User →</span>
          </Link>

          {/* Sign Up Shopkeeper */}
          <Link to="/signup?role=shopkeeper" style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,217,166,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,217,166,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,217,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>🆕 🏪</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>New Shopkeeper?</h3>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>Create an online store to receive orders from customers.</p>
            <span style={{ color: '#00D9A6', fontSize: '13px', fontWeight: 700 }}>Sign up as Shopkeeper →</span>
          </Link>

          {/* Sign In Customer */}
          <Link to="/login?role=customer" style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>👋 🛒</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Returning User?</h3>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>Log back in to track your orders and discover shops.</p>
            <span style={{ color: '#818CF8', fontSize: '13px', fontWeight: 700 }}>Sign in as User →</span>
          </Link>

          {/* Sign In Shopkeeper */}
          <Link to="/login?role=shopkeeper" style={cardStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,217,166,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,217,166,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,217,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>👋 🏪</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Returning Shopkeeper?</h3>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.5, marginBottom: '12px' }}>Manage your products, orders, and shop analytics.</p>
            <span style={{ color: '#00D9A6', fontSize: '13px', fontWeight: 700 }}>Sign in as Shopkeeper →</span>
          </Link>

        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '800px', margin: '80px auto 0' }}>
          {[
            { emoji: '📍', title: 'Location Based', desc: 'Auto-detect your area and find shops nearby on the map' },
            { emoji: '🔒', title: 'Secure Payments', desc: 'Pay via UPI or Cash on Delivery — your choice, always safe' },
            { emoji: '⭐', title: 'Shop Ratings', desc: 'Rate and review shops to help others find the best stores' },
          ].map((f, i) => (
            <div key={i} style={featureStyle}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{f.emoji}</div>
              <h4 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '16px' }}>{f.title}</h4>
              <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>
        © 2026 NearKart — Built with ❤️ for local businesses
      </footer>
    </div>
  );
}
