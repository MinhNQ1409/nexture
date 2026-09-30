import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { currentOrg, getSession } from '../api'

const items = [
  { to: '/hub', label: 'Tổng quan' },
  { to: '/library', label: 'Culture Library' },
  { to: '/stories', label: 'Culture Stories' },
  { to: '/events', label: 'Culture Events' },
  { to: '/people-products', label: 'People & Products' },
  { to: '/reviews', label: 'Pending Review' },
  { to: '/timeline', label: 'Culture Timeline' },
  { to: '/atlas-management', label: 'Culture Atlas' }
]

export default function Layout() {
  const nav = useNavigate()
  const session = getSession()
  const org = currentOrg()

  function handleLogout() {
    localStorage.clear()
    nav('/login')
  }

  return (
    <div className="shell">
      <aside className="hub-sidebar">
        <div className="brand-header">
          <div className="brand-icon">
            <svg viewBox="0 0 100 100" fill="none" width="32" height="32">
              <rect width="100" height="100" rx="22" fill="#10b981" />
              <path d="M28 72V28L52 56V28H72V72L48 44V72H28Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">NexTure</span>
            <span className="brand-subtitle">Digital Culture Hub</span>
          </div>
        </div>

        <div className="org-badge-card">
          <span className="org-pulse" />
          <div className="org-info">
            <small>Doanh nghiệp</small>
            <b>NexTure Technology</b>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/hub'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a className="atlas-public-btn" href="/atlas" target="_blank" rel="noreferrer">
            <span>Xem Culture Atlas</span>
          </a>

          <div className="user-profile-row">
            <div className="user-avatar">
              {(session?.user?.displayName || session?.user?.email || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{session?.user?.displayName || 'NexTure Admin'}</span>
              <span className="user-email">{session?.user?.email || 'admin@nexture.io'}</span>
            </div>
            <button className="btn-logout" title="Đăng xuất" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="hub-content">
        <Outlet />
      </main>
    </div>
  )
}
