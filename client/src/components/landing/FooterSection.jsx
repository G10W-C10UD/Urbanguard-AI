// Footer — dark footer with logo, copyright, and system status
export default function FooterSection() {
  return (
    <footer style={{
      background: '#1A1A1E', padding: '40px 80px',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left — logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px', background: '#9D72FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg className="w-4 h-4" style={{ color: 'white' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="font-body" style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>
            Urban<span style={{ color: '#9D72FF' }}>Guard-AI</span>
          </span>
        </div>

        {/* Center — copyright */}
        <p className="font-body" style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.5)', textAlign: 'center',
        }}>
          © 2026 UrbanGuard-AI · Chennai Municipal Corporation · Government Infrastructure Monitoring
        </p>

        {/* Right — system online pill */}
        <div style={{
          background: 'rgba(34,197,94,0.15)', color: '#22C55E',
          border: '1px solid rgba(34,197,94,0.3)', borderRadius: '9999px',
          padding: '4px 12px', fontSize: '12px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E',
            display: 'inline-block', animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span className="font-body">System Online</span>
        </div>
      </div>
    </footer>
  );
}
