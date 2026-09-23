import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AuthPage.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const [role, setRole] = useState('client') // 'client' | 'pro'
  const [mode, setMode] = useState('register') // 'register' | 'login'
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [portfolio, setPortfolio] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (role === 'pro') {
      navigate('/dashboard/professional')
    } else {
      navigate('/dashboard/customer')
    }
  }

  return (
    <div className="auth-page-root">
      {/* Left Editorial Brand Panel */}
      <section className="auth-brand-panel">
        {/* Background Image with Scrim */}
        <div
          className="auth-bg-layer"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1400&auto=format&fit=crop')`
          }}
        ></div>
        <div className="auth-bg-scrim"></div>

        {/* Top Watermark */}
        <div className="auth-content-layer d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="auth-brand-tag">
              Atelier Edition № 04
            </span>
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          </div>
          <span className="text-white text-opacity-75 tracking-wider text-xs font-semibold">PARIS • NEW YORK • LONDON</span>
        </div>

        {/* Center Quote */}
        <div className="auth-content-layer auth-center-quote">
          <div className="auth-accent-line"></div>
          <blockquote className="auth-quote-text">
            “The premier atelier network for visionary freelance artists and discerning clients.”
          </blockquote>
          <p className="auth-quote-sub">
            Where tactile intimacy meets seamless appointments. Curated master portfolios, protected escrow payouts, and bespoke styling experiences crafted without compromise.
          </p>

          {/* Artist Preview Inset */}
          <div className="auth-artist-preview">
            <img
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
              alt="Elena Rostova"
            />
            <div className="d-flex flex-column">
              <span className="text-white text-sm font-semibold">Elena Rostova</span>
              <span className="text-secondary-fixed text-xs d-flex align-items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Master Bridal Stylist • NYC
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Metrics */}
        <div className="auth-content-layer pt-3">
          <div className="auth-metrics-bar">
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">380+</span>
              <span className="text-white text-opacity-75 text-xs">Vetted Master Artists</span>
            </div>
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">$0</span>
              <span className="text-white text-opacity-75 text-xs">Subscription Fee</span>
            </div>
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">100%</span>
              <span className="text-white text-opacity-75 text-xs">Stripe Escrow Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Authentication Panel */}
      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Role Segmented Controller */}
          <div className="mb-4">
            <label className="d-block text-on-surface-variant text-uppercase tracking-wider mb-2 text-label-sm font-semibold">
              Select Your Platform Persona
            </label>
            <div className="auth-segmented-pill">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`auth-persona-btn ${role === 'client' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Client / Guest</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('pro')}
                className={`auth-persona-btn ${role === 'pro' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined text-[18px]">brush</span>
                <span>Beauty Professional</span>
              </button>
            </div>
          </div>

          {/* Card Container */}
          <div className="auth-card">
            {/* Mode Switcher */}
            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-outline-variant">
              <div className="d-flex align-items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
                >
                  Create Account
                  {mode === 'register' && <div className="auth-mode-indicator"></div>}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
                >
                  Welcome Back
                  {mode === 'login' && <div className="auth-mode-indicator"></div>}
                </button>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                Secured SSL
              </span>
            </div>

            {/* Pro Badge Callout */}
            {role === 'pro' && (
              <div className="mb-4 p-3 rounded-xl bg-secondary-fixed-30 d-flex align-items-start gap-2.5 border border-secondary-fixed">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5">verified_user</span>
                <div>
                  <h4 className="text-xs font-semibold text-on-surface m-0">Artist Verification Charter</h4>
                  <p className="text-[11px] text-on-surface-variant m-0 mt-0.5 leading-snug">
                    Verified profiles receive higher search placement, escrow protection, and direct concierge booking access.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="auth-input-group">
                  <label className="text-xs text-on-surface font-medium" htmlFor="name">Full Legal Name</label>
                  <div className="auth-input-wrapper">
                    <span className="material-symbols-outlined auth-input-icon">badge</span>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Vivienne St. Claire"
                      className="auth-input-control"
                      required
                    />
                  </div>
                </div>
              )}

              {role === 'pro' && mode === 'register' && (
                <>
                  <div className="auth-input-group">
                    <label className="text-xs text-on-surface font-medium d-flex align-items-center justify-content-between" htmlFor="specialty">
                      <span>Primary Artistic Specialty</span>
                      <span className="text-[10px] text-primary">Required for Atelier Tier</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined auth-input-icon">auto_awesome</span>
                      <select
                        id="specialty"
                        value={specialty}
                        onChange={e => setSpecialty(e.target.value)}
                        className="auth-input-control"
                        required
                      >
                        <option value="">Select specialty discipline...</option>
                        <option value="bridal-makeup">Bridal Makeup &amp; Sculpting</option>
                        <option value="editorial-hair">Editorial &amp; Couture Hair Styling</option>
                        <option value="master-esthetician">Master Esthetician &amp; Skin Care</option>
                        <option value="nail-couture">High-Fashion Nail Artistry</option>
                        <option value="colorist">Balayage &amp; Precision Colorist</option>
                        <option value="lash-brow">Lash &amp; Micro-Pigment Specialist</option>
                      </select>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="text-xs text-on-surface font-medium d-flex align-items-center justify-content-between" htmlFor="portfolio">
                      <span>Portfolio / Instagram Link</span>
                      <span className="text-[10px] text-on-surface-variant">Optional</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined auth-input-icon">link</span>
                      <input
                        id="portfolio"
                        type="text"
                        value={portfolio}
                        onChange={e => setPortfolio(e.target.value)}
                        placeholder="instagram.com/yourhandle or portfolio URL"
                        className="auth-input-control"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-input-group">
                <label className="text-xs text-on-surface font-medium" htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">mail</span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@beautyatelier.com"
                    className="auth-input-control"
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="d-flex align-items-center justify-content-between">
                  <label className="text-xs text-on-surface font-medium" htmlFor="password">Password</label>
                  {mode === 'login' && (
                    <a href="#" className="text-[11px] text-primary hover-underline font-medium">Forgot password?</a>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="auth-input-control"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-pwd"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="d-flex align-items-start gap-2 pt-1">
                  <input id="terms" type="checkbox" className="mt-1 accent-primary cursor-pointer" required />
                  <label htmlFor="terms" className="text-[11px] text-on-surface-variant cursor-pointer leading-normal">
                    I agree to the <a href="#" className="text-primary">Terms of Service</a>, Atelier Booking Escrow Code, and Privacy Policy.
                  </label>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                <span>{mode === 'register' ? 'Create Free Account' : 'Sign In to BeautyConnect'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            {/* Social Authentication */}
            <div className="mt-4 pt-3 border-top border-outline-variant">
              <span className="d-block text-center text-[10px] text-uppercase tracking-wider text-on-surface-variant mb-3 font-semibold">
                Or Continue With
              </span>
              <div className="d-flex gap-3">
                <button type="button" className="auth-social-btn">
                  <span className="font-bold"></span>
                  <span>Apple</span>
                </button>
                <button type="button" className="auth-social-btn">
                  <span className="fw-bold text-danger">G</span>
                  <span>Google</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-on-surface-variant mt-4">
            Protected by 256–bit AES encryption. Trusted by independent stylists nationwide.
          </p>
        </div>
      </section>
    </div>
  )
}
