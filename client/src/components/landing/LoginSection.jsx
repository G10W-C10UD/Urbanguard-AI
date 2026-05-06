// Login section — three role-based portal login cards
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, User, Wrench } from 'lucide-react';

function LoginCard({ title, description, icon, iconBg, accentColor, username: defaultUser, password: defaultPass, rolePath }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(rolePath, { replace: true });
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF', border: '1.5px solid #E8E8F0', borderRadius: '20px',
        padding: '36px 32px', borderTop: `4px solid ${accentColor}`, transition: 'all 0.2s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = '#9D72FF';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(157,114,255,0.15)';
        e.currentTarget.style.borderTopColor = accentColor;
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = '#E8E8F0';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderTopColor = accentColor;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <h3 className="font-body" style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A1E' }}>{title}</h3>
      </div>
      <p className="font-body" style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>{description}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label htmlFor={`${title}-user`} className="font-body" style={{
            display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em',
            color: '#64748B', textTransform: 'uppercase', marginBottom: '6px',
          }}>Username</label>
          <input
            id={`${title}-user`} type="text" value={username}
            onChange={(e) => setUsername(e.target.value)} placeholder={defaultUser}
            autoComplete="username"
            style={{
              width: '100%', padding: '12px 16px', background: '#F9F9FB',
              border: '1.5px solid #E8E8F0', color: '#1A1A1E', borderRadius: '8px',
              fontSize: '15px', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = '#9D72FF'; e.target.style.boxShadow = '0 0 0 3px rgba(157,114,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8E8F0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label htmlFor={`${title}-pass`} className="font-body" style={{
            display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em',
            color: '#64748B', textTransform: 'uppercase', marginBottom: '6px',
          }}>Password</label>
          <input
            id={`${title}-pass`} type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={defaultPass}
            autoComplete="current-password"
            style={{
              width: '100%', padding: '12px 16px', background: '#F9F9FB',
              border: '1.5px solid #E8E8F0', color: '#1A1A1E', borderRadius: '8px',
              fontSize: '15px', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onFocus={e => { e.target.style.borderColor = '#9D72FF'; e.target.style.boxShadow = '0 0 0 3px rgba(157,114,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8E8F0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        {error && <p className="font-body" style={{ fontSize: '14px', marginBottom: '12px', color: '#EF4444' }}>{error}</p>}
        <button type="submit" disabled={isLoading} className="font-body" style={{
          width: '100%', padding: '13px', background: '#9D72FF', color: 'white',
          borderRadius: '8px', fontSize: '15px', fontWeight: 600, letterSpacing: '0.03em',
          marginTop: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          opacity: isLoading ? 0.5 : 1,
        }}
          onMouseOver={e => { if (!isLoading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(157,114,255,0.3)'; }}
          onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Authenticating...
            </span>
          ) : 'Login'}
        </button>
      </form>
      <p className="font-body" style={{ color: '#94A3B8', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
        Demo: {defaultUser} / {defaultPass}
      </p>
    </div>
  );
}

export default function LoginSection() {
  return (
    <section id="login" style={{
      padding: '80px 80px', background: '#FFFFFF', borderTop: '1px solid #E8E8F0',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="font-body" style={{
            fontSize: '11px', fontWeight: 700, color: '#9D72FF',
            letterSpacing: '0.15em', display: 'block', marginBottom: '16px',
          }}>SECURE ACCESS</span>
          <h2 className="font-body" style={{
            fontSize: '40px', fontWeight: 800, color: '#1A1A1E',
            letterSpacing: '-0.02em', marginBottom: '12px',
          }}>Choose Your Portal</h2>
          <p className="font-body" style={{ fontSize: '16px', color: '#64748B' }}>
            Three role-based portals — each designed for a specific user.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
          maxWidth: '960px', margin: '0 auto',
        }}>
          <LoginCard
            title="Admin Portal" description="Full system access"
            icon={<Shield size={20} color="#9D72FF" />} iconBg="#F3EEFF"
            accentColor="#9D72FF" username="admin" password="admin123" rolePath="/admin"
          />
          <LoginCard
            title="Citizen Portal" description="Report infrastructure issues"
            icon={<User size={20} color="#3B82F6" />} iconBg="#DBEAFE"
            accentColor="#3B82F6" username="user" password="user123" rolePath="/complaint"
          />
          <LoginCard
            title="Contractor Portal" description="Accept and complete repair jobs"
            icon={<Wrench size={20} color="#22C55E" />} iconBg="#DCFCE7"
            accentColor="#22C55E" username="contractor" password="contractor123" rolePath="/contractor"
          />
        </div>
      </div>
    </section>
  );
}
