import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Explore Services', to: '/search' },
    { label: 'Featured Artists', to: '/artist/aria-sterling' },
    { label: 'Bridal & Editorial', to: '/search?cat=bridal' },
    { label: 'How It Works', to: '/#how-it-works' },
  ]

  return (
    <header className="navbar-root glass">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-mark">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>spa</span>
          </div>
          <span className="navbar-logo-text">BeautyConnect</span>
        </Link>

        {/* Nav Links */}
        <nav className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'navbar-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          <Link to="/auth" className="btn-ghost-sm">Become a Pro</Link>

          <Link to="/dashboard/customer" className="navbar-icon-btn" aria-label="Saved Artists">
            <span className="material-symbols-outlined">favorite</span>
            <span className="navbar-badge"></span>
          </Link>

          <Link to="/dashboard/customer" className="navbar-avatar-group">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
              alt="Elena Vance"
              className="navbar-avatar"
            />
            <div className="navbar-avatar-info">
              <div className="navbar-avatar-name">
                Elena Vance
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>expand_more</span>
              </div>
              <span className="navbar-avatar-role">Customer View</span>
            </div>
          </Link>

          <Link to="/dashboard/professional" className="btn-pro-pill">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>sync_alt</span>
            Pro Studio
          </Link>

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
              key={link.to}
              to={link.to}
              className="navbar-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/auth" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>Sign In / Register</Link>
        </div>
      )}
    </header>
  )
}
