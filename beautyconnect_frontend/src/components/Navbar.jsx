import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getAssetUrl } from '../api/assets'
import { notify } from '../utils/notifications'
import './Navbar.css'

function DashboardAccountAvatar({ user, displayName }) {
  const [imageFailed, setImageFailed] = useState(false)

  if (user.role === 'Admin') {
    return <img className="dashboard-sidebar-avatar dashboard-sidebar-avatar--admin" src="/beautyconnectlogo.png" alt="" />
  }

  if (user.profile?.avatarUrl && !imageFailed) {
    return (
      <img
        className="dashboard-sidebar-avatar dashboard-sidebar-avatar--image"
        src={getAssetUrl(user.profile.avatarUrl)}
        alt=""
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div className="dashboard-sidebar-avatar" aria-hidden="true">
      {displayName.slice(0, 1).toLocaleUpperCase()}
    </div>
  )
}

function getNavigationIconTone(icon) {
  if (icon === 'account_balance_wallet') return 'cash'
  if (icon === 'pending_actions') return 'warning'
  if (icon === 'history' || icon === 'travel_explore') return 'info'
  if (icon === 'groups' || icon === 'person') return 'people'
  if (icon === 'auto_awesome') return 'beauty'
  return 'brand'
}

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
          { label: 'Payouts', to: '/dashboard/professional/payouts', icon: 'account_balance_wallet' },
          { label: 'Booking history', to: '/dashboard/professional/history', icon: 'history' },
          { label: 'Profile & services', to: '/dashboard/professional/studio', icon: 'auto_awesome' },
        ]
      : user.role === 'Admin'
        ? [
            { label: 'Platform operations', to: '/admin', icon: 'admin_panel_settings' },
            { label: 'Users & professionals', to: '/admin/users', icon: 'groups' },
            { label: 'Payout balances', to: '/admin/payouts', icon: 'account_balance_wallet' },
            { label: 'Payout requests', to: '/admin/payouts/requests', icon: 'pending_actions' },
            { label: 'Payout history', to: '/admin/payouts/history', icon: 'history' },
          ]
        : [
            { label: 'My dashboard', to: '/dashboard/customer', icon: 'space_dashboard' },
            { label: 'Booking history', to: '/dashboard/customer/history', icon: 'history' },
            { label: 'Discover services', to: '/search', icon: 'travel_explore' },
            { label: 'My profile', to: '/dashboard/customer/profile', icon: 'person' },
          ]
    const displayName = user.profile?.fullName?.trim()
      || user.profile?.businessName?.trim()
      || user.email?.split('@')[0]
      || 'Account'

    const activeLink = dashboardLinks.reduce((bestMatch, link) => {
      const matchesExactly = location.pathname === link.to
      const matchesNested = location.pathname.startsWith(`${link.to}/`)
      if (!matchesExactly && !matchesNested) return bestMatch

      if (!bestMatch || link.to.length > bestMatch.to.length) return link
      return bestMatch
    }, null)

    return (
      <aside className="dashboard-sidebar">
        <Link to={roleHome} className="navbar-logo dashboard-sidebar-brand">
          <img src="/beautyconnectlogo.png" alt="" className="navbar-logo-mark" />
          <span className="navbar-logo-text">BeautyConnect</span>
        </Link>
        <div className="dashboard-sidebar-label">WORKSPACE</div>
        <nav className="dashboard-sidebar-links" aria-label="Dashboard navigation">
          {dashboardLinks.map((link) => {
            const isActive = activeLink?.to === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`dashboard-sidebar-link${isActive ? ' dashboard-sidebar-link--active' : ''} dashboard-sidebar-link--${link.icon}`}
              >
                <span className={`material-symbols-outlined icon-tone--${getNavigationIconTone(link.icon)}`} aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="dashboard-sidebar-account">
          <DashboardAccountAvatar user={user} displayName={displayName} />
          <div className="dashboard-sidebar-user">
            <strong>{displayName}</strong>
            <span>{user.role} account</span>
          </div>
          <button type="button" className="dashboard-sidebar-signout" onClick={handleSignOut} aria-label="Sign out">
            <span className="material-symbols-outlined icon-tone--logout" aria-hidden="true">logout</span>
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
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>dashboard</span>
                Dashboard
              </Link>
              <button type="button" className="btn-ghost-sm" onClick={handleSignOut}>Sign Out</button>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="navbar-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className="material-symbols-outlined" aria-hidden="true">{mobileOpen ? 'close' : 'menu'}</span>
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
