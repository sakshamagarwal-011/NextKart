import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    await signInWithGoogle();
    // No set loading false needed, as it redirects
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)', padding: '16px', position: 'relative', overflow: 'hidden' }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.08)', filter: 'blur(120px)' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0, 217, 166, 0.06)', filter: 'blur(120px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          ← Back to home
        </Link>

        <div style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6C63FF, #4F46B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>NK</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>Welcome Back</h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Sign in securely with Google</p>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', color: '#0F172A', fontWeight: 700, fontSize: '15px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginTop: '24px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
