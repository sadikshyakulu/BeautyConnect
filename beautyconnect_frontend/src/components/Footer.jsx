import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="container footer-inner">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-mark">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>spa</span>
              </div>
              <span className="footer-logo-text">BeautyConnect</span>
            </Link>
            <p className="footer-tagline">
              An artisanal marketplace uniting master beauty artists with clients seeking thoughtful, high-touch services. Curated with editorial precision and authentic trust.
            </p>
            <div className="footer-sub-bar">
              <span className="footer-kicker">Editorial Portfolio Lookbook</span>
              <div className="footer-icons">
                <span className="material-symbols-outlined footer-icon">photo_camera</span>
                <span className="material-symbols-outlined footer-icon">auto_stories</span>
                <span className="material-symbols-outlined footer-icon">spa</span>
              </div>
            </div>
          </div>

          {/* Col 1: Curation */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Curation</h4>
            <nav className="footer-links">
              <Link to="/search?cat=bridal">Bridal Makeup</Link>
              <Link to="/search?cat=hair">Editorial Hair</Link>
              <Link to="/search?cat=skincare">Clean Skincare</Link>
              <Link to="/search?cat=nails">Precision Nails</Link>
              <Link to="/search?cat=lashes">Aesthetic Lash &amp; Brow</Link>
            </nav>
          </div>

          {/* Col 2: Professionals */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Professionals</h4>
            <nav className="footer-links">
              <Link to="/auth">Become a Pro Partner</Link>
              <Link to="/dashboard/professional">Pro Studio Portal</Link>
              <Link to="/#how-it-works">Standards &amp; Verification</Link>
              <Link to="/#how-it-works">Artist Community</Link>
            </nav>
          </div>

          {/* Col 3: Trust & Safety */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Trust &amp; Safety</h4>
            <nav className="footer-links">
              <Link to="/#how-it-works">Verified Pro Guarantee</Link>
              <Link to="/#how-it-works">Transparent Pricing Policy</Link>
              <Link to="/#how-it-works">Hygiene &amp; Safety Code</Link>
              <Link to="/#how-it-works">Cancellation Terms</Link>
            </nav>
          </div>

          {/* Col 4: Client Care */}
          <div className="footer-nav-col">
            <h4 className="footer-heading">Client Care</h4>
            <nav className="footer-links">
              <Link to="/#how-it-works">Help Center</Link>
              <Link to="/dashboard/customer">Saved Portfolios</Link>
              <Link to="/#how-it-works">Concierge Inquiries</Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 BeautyConnect Inc. Pure craft, authentic care. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Editorial Standards</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
