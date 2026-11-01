import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import LoadingState from '../components/LoadingState'
import { notify } from '../utils/notifications'
import { NEPAL_PHONE_PREFIX, withNepalPhonePrefix } from '../utils/phone'
import './AuthPage.css'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, signIn, signUp, roleHome } = useAuth()
  const [role, setRole] = useState('client') // 'client' | 'pro'
  const [mode, setMode] = useState('login') // 'register' | 'login'
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(NEPAL_PHONE_PREFIX)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const changeMode = (nextMode) => {
    setMode(nextMode)
  }

  useEffect(() => {
    if (user) navigate(location.state?.from ?? roleHome, { replace: true })
  }, [user, roleHome, navigate, location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register') {
      const trimmedPhoneNumber = phoneNumber.trim()
      const phoneDigits = trimmedPhoneNumber.replace(/\D/g, '').length
      if (trimmedPhoneNumber.length > 30 || phoneDigits < 7 || phoneDigits > 15 || !/^[\d+\s-]+$/.test(trimmedPhoneNumber)) {
        notify.error('Enter a phone number using digits, spaces, + or - with 7 to 15 digits.')
        return
      }
    }
    setSubmitting(true)
    try {
      const authenticatedUser = mode === 'login'
        ? await signIn(email, password)
        : await signUp({
            email,
            password,
            role: role === 'pro' ? 1 : 0,
            fullName: name,
            phoneNumber: phoneNumber.trim(),
            businessName: role === 'pro' ? businessName : null,
            speciality: role === 'pro' ? specialty : null,
            city: role === 'pro' ? city : null,
          })

      const destination = authenticatedUser.role === 'Admin'
        ? '/admin'
        : authenticatedUser.role === 'Professional'
          ? '/dashboard/professional'
          : '/dashboard/customer'
      navigate(location.state?.from ?? destination, { replace: true })
    } catch (error) {
      notify.error(
        error.response?.data?.message ??
        error.response?.data?.title ??
        'Authentication failed. Please check your details and try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container py-5"><LoadingState label="Checking your session…" /></div>
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
              BeautyConnect · Nepal
            </span>
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
          </div>
          <span className="text-white text-opacity-75 tracking-wider text-xs font-semibold">BEAUTY, CLOSER TO HOME</span>
        </div>

        {/* Center Quote */}
        <div className="auth-content-layer auth-center-quote">
          <div className="auth-accent-line"></div>
          <blockquote className="auth-quote-text">
            “Find your people. Book your kind of beauty.”
          </blockquote>
          <p className="auth-quote-sub">
            Discover independent beauty professionals across Nepal, explore their real work and services, and book appointments with confidence.
          </p>

        </div>

        {/* Platform information */}
        <div className="auth-content-layer pt-3">
          <div className="auth-metrics-bar">
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">Explore</span>
              <span className="text-white text-opacity-75 text-xs">Find local beauty talent</span>
            </div>
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">Book</span>
              <span className="text-white text-opacity-75 text-xs">Choose a time that fits</span>
            </div>
            <div className="d-flex flex-column">
              <span className="text-primary-container fs-5 fw-bold">Connect</span>
              <span className="text-white text-opacity-75 text-xs">Keep bookings in one place</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Authentication Panel */}
      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Card Container */}
          <div className="auth-card">
            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom border-outline-variant">
              <h1 className="auth-heading">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-medium">
                Secured SSL
              </span>
            </div>

            {mode === 'register' && (
              <div className="mb-4">
                <label className="d-block text-on-surface-variant text-uppercase tracking-wider mb-2 text-label-sm font-semibold">
                  Register as
                </label>
                <div className="auth-segmented-pill">
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    className={`auth-persona-btn ${role === 'client' ? 'active' : ''}`}
                    aria-pressed={role === 'client'}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person</span>
                    <span>Client / Guest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('pro')}
                    className={`auth-persona-btn ${role === 'pro' ? 'active' : ''}`}
                    aria-pressed={role === 'pro'}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">brush</span>
                    <span>Beauty Professional</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pro Badge Callout */}
            {role === 'pro' && (
              <div className="mb-4 p-3 rounded-xl bg-secondary-fixed-30 d-flex align-items-start gap-2.5 border border-secondary-fixed">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5" aria-hidden="true">verified_user</span>
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
                    <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">badge</span>
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

              {mode === 'register' && (
                <div className="auth-input-group">
                  <label className="text-xs text-on-surface font-medium" htmlFor="phoneNumber">Phone number</label>
                  <div className="auth-input-wrapper">
                    <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">call</span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(withNepalPhonePrefix(event.target.value))}
                      placeholder="+977 98XXXXXXXX"
                      className="auth-input-control"
                      required
                      maxLength={30}
                      pattern="[0-9+ -]+"
                      autoComplete="tel"
                      aria-describedby="registration-phone-help"
                    />
                  </div>
                  <small id="registration-phone-help" className="form-text">Use digits, spaces, + or - and include 7 to 15 digits.</small>
                </div>
              )}

              {role === 'pro' && mode === 'register' && (
                <>
                  <div className="auth-input-group">
                    <label className="text-xs text-on-surface font-medium" htmlFor="businessName">Business / Studio Name</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">storefront</span>
                      <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={e => setBusinessName(e.target.value)}
                        placeholder="Your studio name"
                        className="auth-input-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="text-xs text-on-surface font-medium" htmlFor="city">City</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">location_on</span>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="City"
                        className="auth-input-control"
                      />
                    </div>
                  </div>
                  <div className="auth-input-group">
                    <label className="text-xs text-on-surface font-medium d-flex align-items-center justify-content-between" htmlFor="specialty">
                      <span>Primary Artistic Specialty</span>
                      <span className="text-[10px] text-primary">Required for Atelier Tier</span>
                    </label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">auto_awesome</span>
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

                </>
              )}

              <div className="auth-input-group">
                <label className="text-xs text-on-surface font-medium" htmlFor="email">Email Address</label>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
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
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="auth-input-control"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-toggle-pwd"
                  >
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
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

              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                <span>{submitting ? 'Please wait…' : mode === 'register' ? 'Create Account' : 'Sign In to BeautyConnect'}</span>
                <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </button>
            </form>

          </div>

          <p className="text-center mt-4 mb-0 auth-mode-prompt">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button type="button" onClick={() => changeMode('register')}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => changeMode('login')}>
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-[11px] text-on-surface-variant mt-4">
            Use your account to manage bookings and professional services.
          </p>
        </div>
      </section>
    </div>
  )
}
