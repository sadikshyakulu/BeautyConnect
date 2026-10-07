import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, roleHome, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  const navLinks = [
    { label: 'Explore Services', to: '/search' },
    { label: 'Featured Artists', to: '/search' },
    { label: 'Bridal & Editorial', to: '/search?serviceType=bridal' },
    { label: 'How It Works', to: '/#how-it-works' },
  ]

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch (error) {
      setSignOutError(error.response?.data?.message ?? 'Could not contact the server to end the session.')
      navigate('/', { replace: true })
    }
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
                  <div className="navbar-avatar-name">{user.email}</div>
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
      {signOutError && <div className="container"><div className="alert alert-warning mb-0" role="alert">{signOutError}</div></div>}
    </header>
  )
}
