import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignup() {
    setLoading(true);
    await signInWithGoogle();
    // No set loading false needed, as it redirects
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.08)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0, 217, 166, 0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          ← Back to home
        </Link>

        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Join NearKart</h1>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Sign up securely with your Google account</p>
          </div>

          <button onClick={handleGoogleSignup} disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'white', color: '#0F172A', fontWeight: 700, fontSize: '15px', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
              <strong>Want to be a Shopkeeper?</strong><br />
              Sign in with Google first, then you can upgrade your account to a Shopkeeper from your Profile page!
            </p>
          </div>

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
