// Coming Soon — placeholder for admin pages not yet built
export default function ComingSoon({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #E8E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg className="w-8 h-8" style={{ color: '#9D72FF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.383a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 010-2.121l5.384-5.384m2.828 2.829a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243zm4.243-4.243L21 7.5m0 0l-2.25-2.25M21 7.5v2.25" />
          </svg>
        </div>
        <h1 className="font-body text-3xl mb-3" style={{ fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em' }}>{title}</h1>
        <p className="font-body text-base" style={{ color: '#64748B' }}>This module is under development and will be available soon.</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ background: '#FFFFFF', border: '1px solid #E8E8F0' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#9D72FF' }} />
          <span className="font-body text-xs" style={{ color: '#94A3B8' }}>Coming in Phase 4+</span>
        </div>
      </div>
    </div>
  );
}
