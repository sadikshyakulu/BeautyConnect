import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getAssetUrl } from '../api/assets'
import { notify } from '../utils/notifications'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, roleHome, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const displayName = user?.profile?.fullName?.trim()
    || user?.profile?.businessName?.trim()
    || user?.email?.split('@')[0]
    || 'Account'

  const navLinks = [
    { label: 'Explore Services', to: '/search' },
    { label: 'Featured Artists', to: '/search' },
    { label: 'Bridal & Editorial', to: '/search?serviceType=bridal' },
    { label: 'How It Works', to: '/#how-it-works' },
  ]

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not contact the server to end the session.')
      navigate('/', { replace: true })
    }
  }

  if (user) {
    const dashboardLinks = user.role === 'Professional'
      ? [
          { label: 'Studio overview', to: '/dashboard/professional', icon: 'space_dashboard' },
          { label: 'Profile & services', to: '/dashboard/professional/studio', icon: 'auto_awesome' },
        ]
      : user.role === 'Admin'
        ? [{ label: 'Platform operations', to: '/admin', icon: 'admin_panel_settings' }]
        : [
            { label: 'My dashboard', to: '/dashboard/customer', icon: 'space_dashboard' },
            { label: 'Discover services', to: '/search', icon: 'travel_explore' },
            { label: 'My profile', to: '/dashboard/customer/profile', icon: 'person' },
          ]
    const displayName = user.profile?.fullName?.trim()
      || user.profile?.businessName?.trim()
      || user.email?.split('@')[0]
      || 'Account'

    return (
      <aside className="dashboard-sidebar">
        <Link to={roleHome} className="navbar-logo dashboard-sidebar-brand">
          <img src="/beautyconnectlogo.png" alt="" className="navbar-logo-mark" />
          <span className="navbar-logo-text">BeautyConnect</span>
        </Link>
        <div className="dashboard-sidebar-label">WORKSPACE</div>
        <nav className="dashboard-sidebar-links" aria-label="Dashboard navigation">
          {dashboardLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`dashboard-sidebar-link${location.pathname === link.to ? ' dashboard-sidebar-link--active' : ''}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="dashboard-sidebar-account">
          {user.profile?.avatarUrl ? (
            <img className="dashboard-sidebar-avatar dashboard-sidebar-avatar--image" src={getAssetUrl(user.profile.avatarUrl)} alt="" />
          ) : (
            <div className="dashboard-sidebar-avatar" aria-hidden="true">
              {displayName.slice(0, 1).toLocaleUpperCase()}
            </div>
          )}
          <div className="dashboard-sidebar-user">
            <strong>{displayName}</strong>
            <span>{user.role} account</span>
          </div>
          <button type="button" className="dashboard-sidebar-signout" onClick={handleSignOut} aria-label="Sign out">
            <span className="material-symbols-outlined" aria-hidden="true">logout</span>
          </button>
        </div>
      </aside>
    )
  }

  return (
    <header className="navbar-root glass">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/beautyconnectlogo.png" alt="" className="navbar-logo-mark" />
          <span className="navbar-logo-text">BeautyConnect</span>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'navbar-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {!loading && !user && <Link to="/auth" className="btn-ghost-sm">Sign In / Join</Link>}
          {user && (
            <>
              <Link to={roleHome} className="navbar-avatar-group">
                <div className="navbar-avatar-info">
                  <div className="navbar-avatar-name">{displayName}</div>
                  <span className="navbar-avatar-role">{user.role} View</span>
                </div>
              </Link>
              <Link to={roleHome} className="btn-pro-pill">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>dashboard</span>
                Dashboard
              </Link>
              <button type="button" className="btn-ghost-sm" onClick={handleSignOut}>Sign Out</button>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="navbar-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile-menu glass">
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className="navbar-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to={roleHome} className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
                {user.role} Dashboard
              </Link>
              <button
                type="button"
                className="navbar-mobile-link"
                onClick={() => {
                  setMobileOpen(false)
                  handleSignOut()
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/auth" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>Sign In / Register</Link>
          )}
        </div>
      )}
    </header>
  )
}
