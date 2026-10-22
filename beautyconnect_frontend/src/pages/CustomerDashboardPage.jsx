import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { cancelBooking, getCustomerBookings } from '../api/booking'
import { createReview } from '../api/review'
import { getProfessionals } from '../api/search'
import { getAssetUrl } from '../api/assets'
import { notify } from '../utils/notifications'
import './CustomerDashboardPage.css'
import { useAuth } from '../auth/useAuth'

const statusName = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status
const refundStatusName = (status) => typeof status === 'number'
  ? ['Not requested', 'Requested', 'Refunded'][status] ?? 'Unknown'
  : status

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All services')
  const [serviceSearch, setServiceSearch] = useState('')
  const [tab, setTab] = useState('upcoming')
  const [reviewing, setReviewing] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadBookings() {
    try {
      const result = await getCustomerBookings()
      setBookings(result ?? [])
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not load your bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getCustomerBookings()
      .then((result) => {
        if (active) setBookings(result ?? [])
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Could not load your bookings.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    getProfessionals({ page: 1, pageSize: 12 })
      .then((response) => {
        if (active) setProfessionals(response.results ?? [])
      })
      .catch((error) => {
        if (active) {
          setCatalogError(error.response?.data?.message ?? 'Could not load services right now.')
        }
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (!payment) return

    navigate('/dashboard/customer', {
      replace: true,
      state: { payment, bookingId: searchParams.get('bookingId') },
    })
  }, [navigate, searchParams])

  useEffect(() => {
    const { payment, bookingId } = location.state ?? {}
    if (!payment) return

    const messages = {
      success: `Payment successful. Your appointment is confirmed.${bookingId ? ` Booking #${bookingId}.` : ''}`,
      pending: 'Payment is still processing. No booking has been created yet; it will appear here after eSewa confirms payment.',
      failed: 'Payment was not completed, so no booking was created. You can select the appointment again and retry.',
      error: 'We could not verify the payment. Please check your bookings or contact support.',
    }
    const toastType = payment === 'success' ? 'success' : payment === 'error' ? 'error' : 'warning'
    if (messages[payment]) notify[toastType](messages[payment])
    navigate(`${location.pathname}${location.search}${location.hash}`, { replace: true, state: null })
  }, [location.hash, location.pathname, location.search, location.state, navigate])

  const upcoming = useMemo(
    () => bookings.filter((booking) => ['Pending', 'Confirmed'].includes(statusName(booking.status))),
    [bookings],
  )
  const history = useMemo(
    () => bookings.filter((booking) => ['Completed', 'Cancelled'].includes(statusName(booking.status))),
    [bookings],
  )
  const visibleBookings = tab === 'upcoming' ? upcoming : history
  const serviceCategories = useMemo(() => [
    'All services',
    ...new Set(professionals.flatMap((professional) =>
      (professional.matchingServices ?? [])
        .map((service) => service.category?.trim())
        .filter(Boolean),
    )),
  ], [professionals])
  const displayedProfessionals = useMemo(() => {
    const normalizedSearch = serviceSearch.trim().toLocaleLowerCase()
    return professionals
      .map((professional) => ({
        ...professional,
        visibleServices: (professional.matchingServices ?? []).filter((service) => {
          const matchesCategory = serviceFilter === 'All services'
            || service.category?.toLocaleLowerCase() === serviceFilter.toLocaleLowerCase()
          const matchesSearch = !normalizedSearch
            || [service.name, service.category, service.description, professional.businessName]
              .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch))
          return matchesCategory && matchesSearch
        }),
      }))
      .filter((professional) => professional.visibleServices.length > 0)
  }, [professionals, serviceFilter, serviceSearch])
  const customerName = user?.profile?.fullName?.trim()
    || user?.fullName?.trim()
    || user?.email?.split('@')[0]
    || 'there'

  async function handleCancel(bookingId) {
    setErrorMessage('')
    try {
      const cancelledBooking = await cancelBooking(bookingId)
      await loadBookings()
      notify.success(
        refundStatusName(cancelledBooking.refundStatus) === 'Requested'
          ? 'Booking cancelled. A full refund has been requested from the professional; it will show as refunded after eSewa confirms it.'
          : 'Booking cancelled.',
      )
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not cancel this booking.')
    }
  }

  async function handleReview(event) {
    event.preventDefault()
    if (!reviewing) return
    setSubmitting(true)
    setErrorMessage('')
    try {
      await createReview({ bookingId: reviewing.id, rating, comment })
      setReviewing(null)
      setComment('')
      notify.success('Your review was submitted.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="customer-dashboard">
      <header className="glass-card rounded-2xl customer-dashboard-hero mb-4">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-4">
          <div>
            <p className="text-uppercase text-secondary fw-semibold small mb-2">Your BeautyConnect</p>
            <h1 className="font-headline mb-2">Welcome, {customerName}</h1>
            <p className="text-on-surface-variant mb-0">Manage your appointments and discover your next beauty service.</p>
          </div>
          <div className="customer-dashboard-actions">
            {user?.profile?.avatarUrl ? (
              <img className="customer-dashboard-avatar" src={getAssetUrl(user.profile.avatarUrl)} alt="" />
            ) : (
              <Link className="customer-dashboard-avatar customer-dashboard-avatar--empty" to="/dashboard/customer/profile" aria-label="Add a profile photo">
                <span className="material-symbols-outlined" aria-hidden="true">person</span>
              </Link>
            )}
            <Link className="btn btn-primary" to="/search">Explore professionals</Link>
            <Link className="customer-dashboard-profile-link" to="/dashboard/customer/profile">My profile</Link>
          </div>
        </div>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <div className="customer-dashboard-stats mb-5">
        <div className="customer-dashboard-stat">
          <article className="glass-card rounded-2xl p-3 p-md-4 h-100">
            <span className="material-symbols-outlined customer-stat-icon" aria-hidden="true">event_upcoming</span>
            <span className="small text-on-surface-variant">Upcoming appointments</span>
            <strong className="d-block fs-3">{upcoming.length}</strong>
          </article>
        </div>
        <div className="customer-dashboard-stat">
          <article className="glass-card rounded-2xl p-3 p-md-4 h-100">
            <span className="material-symbols-outlined customer-stat-icon" aria-hidden="true">history</span>
            <span className="small text-on-surface-variant">Past appointments</span>
            <strong className="d-block fs-3">{history.length}</strong>
          </article>
        </div>
      </div>

      <section className="mb-5" aria-labelledby="customer-services-heading">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
          <div>
            <p className="text-uppercase text-secondary fw-semibold small mb-1">Find your next appointment</p>
            <h2 className="font-headline mb-0" id="customer-services-heading">Explore beauty services</h2>
          </div>
          <label className="visually-hidden" htmlFor="customer-service-search">Search services</label>
          <input
            id="customer-service-search"
            className="form-control"
            style={{ maxWidth: 360 }}
            type="search"
            placeholder="Search services or professionals"
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
          />
        </div>

        {!catalogLoading && serviceCategories.length > 1 && (
          <div className="d-flex flex-wrap gap-2 mb-4" aria-label="Filter by service category">
            {serviceCategories.map((category) => (
              <button
                className={`btn btn-sm ${serviceFilter === category ? 'btn-primary' : 'btn-outline-primary'}`}
                type="button"
                key={category}
                aria-pressed={serviceFilter === category}
                onClick={() => setServiceFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {catalogError && <div className="alert alert-warning" role="alert">{catalogError}</div>}
        {catalogLoading ? (
          <p className="text-on-surface-variant" role="status">Loading services…</p>
        ) : displayedProfessionals.length === 0 ? (
          <div className="glass-card rounded-2xl p-4 p-md-5 text-center">
            <h3 className="h5">No verified services match yet</h3>
            <p className="text-on-surface-variant mb-0">Try another search or category. New services appear here as professionals are verified.</p>
          </div>
        ) : (
          <div className={`customer-professional-grid${displayedProfessionals.length === 1 ? ' customer-professional-grid--featured' : ''}`}>
            {displayedProfessionals.map((professional) => (
                <article className="glass-card rounded-2xl customer-professional-card" key={professional.id}>
                  <div className="customer-professional-summary">
                    {professional.avatarUrl ? (
                      <img
                        className="rounded-circle object-fit-cover"
                        style={{ width: 72, height: 72 }}
                        src={getAssetUrl(professional.avatarUrl)}
                        alt=""
                      />
                    ) : (
                      <span className="rounded-circle bg-surface-container d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }} aria-hidden="true">
                        <span className="material-symbols-outlined">face_3</span>
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="customer-card-kicker mb-1">BEAUTY PROFESSIONAL</p>
                      <h3 className="h5 mb-1">{professional.businessName}</h3>
                      <p className="small text-on-surface-variant mb-0">
                        {[professional.speciality, professional.city].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="customer-professional-offerings">
                    {professional.visibleServices.map((service) => (
                      <div className="customer-offering" key={service.id}>
                        <div>
                          <strong className="d-block">{service.name}</strong>
                          <span className="small text-on-surface-variant">
                            {service.category} · {service.durationMinutes} min
                          </span>
                        </div>
                        <strong className="text-nowrap">{service.price}</strong>
                      </div>
                    ))}
                  </div>
                  <Link className="btn btn-outline-primary customer-professional-cta" to={`/artist/${professional.id}`}>
                    View times &amp; book
                  </Link>
                </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="customer-bookings-heading">
        <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
          <h2 className="font-headline h3 mb-0 me-auto" id="customer-bookings-heading">Your appointments</h2>
          <button className={`btn ${tab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('upcoming')} type="button">
            Upcoming ({upcoming.length})
          </button>
          <button className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('history')} type="button">
            History ({history.length})
          </button>
        </div>
      {loading ? (
        <p role="status">Loading your bookings…</p>
      ) : visibleBookings.length === 0 ? (
        <div className="glass-card rounded-2xl p-5 text-center">
          <h2 className="h5">No {tab === 'upcoming' ? 'upcoming bookings' : 'booking history'}</h2>
          <p className="text-on-surface-variant mb-3">{tab === 'upcoming' ? 'When you book an appointment, it will appear here.' : 'Completed and cancelled appointments will appear here.'}</p>
          {tab === 'upcoming' && <Link className="btn btn-primary" to="/search">Browse professionals</Link>}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {visibleBookings.map((booking) => {
            const status = statusName(booking.status)
            return (
              <article className="glass-card rounded-2xl p-4" key={booking.id}>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h2 className="h5">{booking.service?.name ?? 'Service appointment'}</h2>
                    <p className="mb-1">{booking.professionalBusinessName}</p>
                    <p className="small text-on-surface-variant mb-1">{new Date(booking.scheduledDateTime).toLocaleString()}</p>
                    <p className="small mb-0">Status: <strong>{status}</strong> · Total: {booking.totalPrice}</p>
                    {refundStatusName(booking.refundStatus) !== 'Not requested' && (
                      <p className="small mb-0 mt-1">
                        Refund: <strong>{refundStatusName(booking.refundStatus)}</strong>
                        {booking.refundAmount != null && ` · ${booking.refundAmount}`}
                      </p>
                    )}
                    {booking.notes && <p className="small mt-2 mb-0">{booking.notes}</p>}
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-items-start">
                    {['Pending', 'Confirmed'].includes(status) && (
                      <button type="button" className="btn btn-outline-danger" onClick={() => handleCancel(booking.id)}>Cancel booking</button>
                    )}
                    {status === 'Completed' && (
                      <button type="button" className="btn btn-outline-primary" onClick={() => setReviewing(booking)}>Write review</button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {reviewing && (
        <div className="glass-card rounded-2xl p-4 mt-4">
          <h2 className="h5">Review {reviewing.professionalBusinessName}</h2>
          <form onSubmit={handleReview}>
            <label className="form-label" htmlFor="review-rating">Rating</label>
            <select id="review-rating" className="form-select mb-3" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
            </select>
            <label className="form-label" htmlFor="review-comment">Your review</label>
            <textarea id="review-comment" className="form-control mb-3" maxLength="2000" required value={comment} onChange={(event) => setComment(event.target.value)} />
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setReviewing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      </section>
    </div>
  )
}
