import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AREAS } from '../../lib/constants';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '14px 16px', borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
  color: 'white', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
};

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '8px' };

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get('role') || '';

  const [step, setStep] = useState(preselectedRole ? 2 : 1);
  const [role, setRole] = useState(preselectedRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  function selectRole(r) { setRole(r); setStep(2); }

  async function detectLocation() {
    setDetectingLocation(true);
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      });
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
      const data = await res.json();
      const locality = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.county || '';
      const match = AREAS.find(a => locality.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(locality.toLowerCase()));
      if (match) {
        setArea(match);
        toast.success(`Detected: ${match} 📍`);
      } else if (locality) {
        setArea(locality);
        toast.success(`Detected: ${locality} 📍`);
      } else {
        toast.error('Could not detect specific area. Please type manually.');
      }
    } catch (err) {
      toast.error('Location access denied. Please select area manually.');
    } finally {
      setDetectingLocation(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!area) return toast.error('Please select your area');
    setLoading(true);
    const { error } = await signUp({ email, password, fullName, phone, area, role });
    setLoading(false);
    if (!error) navigate(role === 'shopkeeper' ? '/dashboard' : '/home');
  }

  const roleCardStyle = (isSelected) => ({
    width: '100%', padding: '24px', borderRadius: '16px', textAlign: 'left',
    border: `2px solid ${isSelected ? '#6C63FF' : 'rgba(255,255,255,0.08)'}`,
    background: isSelected ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(108, 99, 255, 0.08)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(0, 217, 166, 0.06)', filter: 'blur(120px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '14px', textDecoration: 'none', marginBottom: '24px' }}>
          ← Back to home
        </Link>

        <div style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px 32px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '6px' }}>Join NearKart</h1>
                <p style={{ color: '#64748B', fontSize: '14px' }}>How would you like to use NearKart?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => selectRole('customer')} style={roleCardStyle(false)}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🛒</div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'white', fontSize: '16px', margin: 0 }}>I want to Order</h3>
                    <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0' }}>Browse shops & place orders</p>
                  </div>
                </button>

                <button onClick={() => selectRole('shopkeeper')} style={roleCardStyle(false)}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,217,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>🏪</div>
                  <div>
                    <h3 style={{ fontWeight: 700, color: 'white', fontSize: '16px', margin: 0 }}>I want to List my Shop</h3>
                    <p style={{ color: '#64748B', fontSize: '12px', margin: '4px 0 0' }}>Sell products & manage orders</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details Form */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: '28px',
                  background: role === 'customer' ? 'linear-gradient(135deg, #6C63FF, #4F46B8)' : 'linear-gradient(135deg, #00D9A6, #059669)',
                  boxShadow: role === 'customer' ? '0 8px 24px rgba(108,99,255,0.3)' : '0 8px 24px rgba(0,217,166,0.3)',
                }}>
                  {role === 'customer' ? '🛒' : '🏪'}
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                  {role === 'customer' ? 'Create Customer Account' : 'Register Your Shop'}
                </h1>
                <p style={{ color: '#64748B', fontSize: '14px' }}>Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com" required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters" minLength={6} required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit phone number" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6C63FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Area</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={area} onChange={e => setArea(e.target.value)} required
                      list="area-suggestions" placeholder="Type your area..."
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={e => e.target.style.borderColor = '#6C63FF'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    <datalist id="area-suggestions">
                      {AREAS.map(a => <option key={a} value={a} />)}
                    </datalist>
                    <button type="button" onClick={detectLocation} disabled={detectingLocation}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#CBD5E1', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600, transition: 'all 0.2s' }}>
                      {detectingLocation ? '📡 ...' : '📍 Detect'}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none', cursor: loading ? 'wait' : 'pointer',
                    background: role === 'customer' ? 'linear-gradient(135deg, #6C63FF, #5B52E5)' : 'linear-gradient(135deg, #00D9A6, #059669)',
                    color: 'white', fontWeight: 700, fontSize: '15px', opacity: loading ? 0.7 : 1,
                    boxShadow: role === 'customer' ? '0 4px 16px rgba(108,99,255,0.3)' : '0 4px 16px rgba(0,217,166,0.3)',
                    transition: 'all 0.2s',
                  }}>
                  {loading ? '⏳ Creating...' : role === 'customer' ? 'Start Shopping 🛒' : 'Create My Shop 🏪'}
                </button>

                <button type="button" onClick={() => { setStep(1); setRole(''); }}
                  style={{ width: '100%', background: 'none', border: 'none', color: '#64748B', fontSize: '13px', cursor: 'pointer', marginTop: '12px', padding: '8px' }}>
                  ← Choose different role
                </button>
              </form>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginTop: '24px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6C63FF', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
