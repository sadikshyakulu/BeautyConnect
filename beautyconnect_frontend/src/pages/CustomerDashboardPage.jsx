import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelBooking, getCustomerBookings } from '../api/booking'
import { createReview } from '../api/review'
import { useAuth } from '../auth/useAuth'

const statusName = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status

export default function CustomerDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('upcoming')
  const [reviewing, setReviewing] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

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

  const upcoming = useMemo(
    () => bookings.filter((booking) => ['Pending', 'Confirmed'].includes(statusName(booking.status))),
    [bookings],
  )
  const history = useMemo(
    () => bookings.filter((booking) => ['Completed', 'Cancelled'].includes(statusName(booking.status))),
    [bookings],
  )
  const visibleBookings = tab === 'upcoming' ? upcoming : history

  async function handleCancel(bookingId) {
    setErrorMessage('')
    try {
      await cancelBooking(bookingId)
      await loadBookings()
      setNotice('Booking cancelled.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not cancel this booking.')
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
      setNotice('Your review was submitted.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-5">
      <header className="mb-4">
        <p className="text-uppercase text-secondary fw-semibold small mb-2">Customer dashboard</p>
        <h1 className="font-headline">Welcome, {user?.email}</h1>
        <p className="text-on-surface-variant">Your bookings and appointment history.</p>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className={`btn ${tab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('upcoming')} type="button">
          Upcoming ({upcoming.length})
        </button>
        <button className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('history')} type="button">
          History ({history.length})
        </button>
        <Link className="btn btn-outline-secondary ms-sm-auto" to="/search">Find a professional</Link>
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
    </div>
  )
}
