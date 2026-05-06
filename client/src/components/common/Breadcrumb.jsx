// Breadcrumb — simple navigation breadcrumb for admin pages
import { Link } from 'react-router-dom';

export default function Breadcrumb({ page }) {
  return (
    <nav className="font-body" style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
      <Link
        to="/admin/overview"
        style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}
        onMouseOver={e => e.target.style.color = '#9D72FF'}
        onMouseOut={e => e.target.style.color = '#94A3B8'}
      >
        Home
      </Link>
      <span style={{ margin: '0 6px' }}>›</span>
      <span style={{ color: '#64748B' }}>{page}</span>
    </nav>
  );
}
