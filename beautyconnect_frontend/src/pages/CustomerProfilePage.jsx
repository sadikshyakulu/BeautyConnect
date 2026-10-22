import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerBookings } from '../api/booking'
import { useAuth } from '../auth/useAuth'
import './DashboardPages.css'

const statusName = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const displayName = user?.profile?.fullName?.trim()
    || user?.fullName?.trim()
    || user?.email?.split('@')[0]
    || 'BeautyConnect member'
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase()

  useEffect(() => {
    let active = true
    getCustomerBookings()
      .then((result) => {
        if (active) setBookings(result ?? [])
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Your appointment summary could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const completedCount = bookings.filter((booking) => statusName(booking.status) === 'Completed').length
  const upcomingCount = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(statusName(booking.status))).length

  return (
    <div className="dashboard-page dashboard-profile-page">
      <header className="dashboard-hero dashboard-profile-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">YOUR BEAUTYCONNECT ACCOUNT</span>
          <h1 className="font-headline">Your profile</h1>
          <p>Your account details and appointment activity, together in one place.</p>
        </div>
        <div className="profile-avatar-large" aria-label={`${displayName} profile`}>
          {initials || 'BC'}
        </div>
        <div className="dashboard-hero-decoration" aria-hidden="true">✳</div>
      </header>

      {errorMessage && <div className="alert alert-warning" role="alert">{errorMessage}</div>}

      <div className="row g-4">
        <section className="col-12 col-lg-7">
          <article className="dashboard-panel h-100">
            <div className="dashboard-panel-heading">
              <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
              <div>
                <h2>Account details</h2>
                <p>Information attached to your signed-in account.</p>
              </div>
            </div>
            <dl className="profile-detail-list">
              <div>
                <dt>Full name</dt>
                <dd>{displayName}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{user?.email ?? 'Not available'}</dd>
              </div>
              <div>
                <dt>Account type</dt>
                <dd>Customer</dd>
              </div>
            </dl>
            <p className="profile-details-note mb-0">
              Your sign-in details are securely managed by your BeautyConnect account.
            </p>
          </article>
        </section>

        <section className="col-12 col-lg-5">
          <article className="dashboard-panel h-100">
            <div className="dashboard-panel-heading">
              <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
              <div>
                <h2>Appointment snapshot</h2>
                <p>A quick look at your BeautyConnect visits.</p>
              </div>
            </div>
            {loading ? (
              <p className="text-on-surface-variant mb-0" role="status">Loading your appointments…</p>
            ) : (
              <div className="profile-stat-grid">
                <div><strong>{upcomingCount}</strong><span>Upcoming</span></div>
                <div><strong>{completedCount}</strong><span>Completed</span></div>
              </div>
            )}
            <Link to="/dashboard/customer" className="btn btn-outline-primary w-100 mt-4">View my appointments</Link>
          </article>
        </section>
      </div>
    </div>
  )
}
