import { useEffect, useMemo, useState } from 'react'
import { getCustomerBookings, getIncomingBookings } from '../api/booking'
import { getAssetUrl } from '../api/assets'
import { useAuth } from '../auth/useAuth'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import './BookingHistoryPage.css'

const bookingStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status

const statusFilters = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function BookingHistoryPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const isProfessional = user?.role === 'Professional'

  useEffect(() => {
    let active = true
    const loadBookings = isProfessional ? getIncomingBookings : getCustomerBookings

    loadBookings()
      .then((result) => {
        if (active) setBookings(result ?? [])
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message ?? 'Could not load booking history.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isProfessional])

  const visibleBookings = useMemo(() => {
    const filteredBookings = filter === 'All'
      ? bookings
      : bookings.filter((booking) => bookingStatus(booking.status) === filter)
    return [...filteredBookings].sort(
      (left, right) => new Date(right.scheduledDateTime) - new Date(left.scheduledDateTime),
    )
  }, [bookings, filter])

  return (
    <div className="booking-history-page">
      <header className="booking-history-hero">
        <div>
          <p className="text-uppercase text-secondary fw-semibold small mb-2">
            {isProfessional ? 'Studio records' : 'Your appointments'}
          </p>
          <h1 className="font-headline mb-2">Booking history</h1>
          <p className="text-on-surface-variant mb-0">
            {isProfessional
              ? 'Review appointments customers have booked with your studio.'
              : 'Review your appointments, payment totals, and booking status.'}
          </p>
        </div>
        <span className="material-symbols-outlined booking-history-hero-icon" aria-hidden="true">
          history
        </span>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="booking-history-panel" aria-label="Booking records">
        <div className="booking-history-toolbar">
          <div>
            <h2 className="h4 mb-1">All bookings</h2>
            <p className="small text-on-surface-variant mb-0">
              {visibleBookings.length} {visibleBookings.length === 1 ? 'record' : 'records'}
            </p>
          </div>
          {!loading && (
            <div className="booking-history-filters" aria-label="Filter bookings by status">
              {statusFilters.map((status) => (
                <button
                  key={status}
                  className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-primary'}`}
                  type="button"
                  aria-pressed={filter === status}
                  onClick={() => setFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState label="Loading booking history…" />
        ) : visibleBookings.length === 0 ? (
          <div className="booking-history-empty">
            <span className="material-symbols-outlined" aria-hidden="true">event_busy</span>
            <h3 className="h5">{filter === 'All' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}</h3>
            <p className="text-on-surface-variant mb-0">
              {filter === 'All'
                ? 'Your appointments will appear here when a booking is made.'
                : 'Try another status filter to see more booking records.'}
            </p>
          </div>
        ) : (
          <div className="booking-history-list">
            {visibleBookings.map((booking) => {
              const status = bookingStatus(booking.status)
              const statusClass = status.toLocaleLowerCase()

              return (
                <article className="booking-history-card glass-card" key={booking.id}>
                  <div className="booking-history-card-heading">
                    {booking.service?.images?.[0] ? (
                      <img
                        className="booking-history-service-image"
                        src={getAssetUrl(booking.service.images[0])}
                        alt={`${booking.service.name} service`}
                      />
                    ) : (
                      <div className="booking-history-service-icon material-symbols-outlined" aria-hidden="true">
                        spa
                      </div>
                    )}
                    <div className="booking-history-card-title">
                      <h3>{booking.service?.name ?? 'Service appointment'}</h3>
                      <p>{isProfessional ? booking.customerName : booking.professionalBusinessName}</p>
                    </div>
                    <span className={`booking-history-status booking-history-status--${statusClass}`}>
                      {status}
                    </span>
                  </div>

                  <div className="booking-history-details">
                    <span>
                      <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                      {new Date(booking.scheduledDateTime).toLocaleString()}
                    </span>
                    {isProfessional && booking.customerEmail && (
                      <span>
                        <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                        {booking.customerEmail}
                      </span>
                    )}
                    <span>
                      <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                      <MoneyAmount value={booking.totalPrice} />
                    </span>
                  </div>

                  {(booking.refundAmount != null || booking.cancellationReason) && (
                    <div className="booking-history-extra">
                      {booking.refundAmount != null && (
                        <p>
                          Refund: <strong>{booking.refundStatus === 2 || booking.refundStatus === 'Refunded' ? 'Refunded' : 'Requested'}</strong>
                          {' · '}<MoneyAmount value={booking.refundAmount} />
                        </p>
                      )}
                      {booking.cancellationReason && <p>Cancellation reason: {booking.cancellationReason}</p>}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
