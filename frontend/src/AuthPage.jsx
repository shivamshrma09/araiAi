import { useState } from 'react';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { login, signup } from './api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = mode === 'login'
        ? await login(form.email, form.password)
        : await signup(form.name, form.email, form.password);
      localStorage.setItem('aria_token', res.data.token);
      localStorage.setItem('aria_user', JSON.stringify(res.data.user));
      onAuth(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000000', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle ambient glow */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(23,43,77,0.4) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '10%',
        width: '400px', height: '300px', borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(29,158,117,0.08) 0%, transparent 70%)',
        filter: 'blur(80px)',
      }} />

      <div style={{ width: '100%', maxWidth: '380px', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.03em', color: '#FAFAFA' }}>Aria</span>
          </div>
          <p style={{ fontSize: '13px', color: '#737373', lineHeight: 1.5 }}>
            Autonomous Multi-Agent Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid rgba(115,115,115,0.25)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.02), 0 24px 48px rgba(0,0,0,0.6)',
        }}>

          {/* Tab toggle */}
          <div style={{
            display: 'flex', borderRadius: '10px', padding: '3px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.2)',
            marginBottom: '20px',
          }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '7px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                fontFamily: "'Inter', sans-serif", border: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === m ? '#172B4D' : 'transparent',
                color: mode === m ? '#FAFAFA' : '#737373',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'signup' && (
              <Field label="Full Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
            )}
            <Field label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" required />

            {/* Password field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#737373', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', height: '40px', padding: '0 40px 0 12px', borderRadius: '10px',
                    fontSize: '13px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)',
                    color: '#FAFAFA', fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#737373', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: '#FAFAFA', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #172B4D 0%, #1e3a6e 100%)',
              opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
              marginTop: '4px', boxShadow: '0 1px 8px rgba(23,43,77,0.5)',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: '#505050', fontFamily: "'Inter', sans-serif" }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}
              style={{ fontSize: '12px', fontWeight: 600, color: '#FAFAFA', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textDecoration: 'underline', textUnderlineOffset: '2px' }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#333', marginTop: '20px', fontFamily: "'Inter', sans-serif" }}>
          Secured with JWT · ET AI Hackathon 2026
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#737373', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>{label}</label>
      <input
        {...props}
        style={{
          width: '100%', height: '40px', padding: '0 12px', borderRadius: '10px',
          fontSize: '13px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(115,115,115,0.25)',
          color: '#FAFAFA', fontFamily: "'Inter', sans-serif",
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(23,43,77,0.25)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(115,115,115,0.25)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}
