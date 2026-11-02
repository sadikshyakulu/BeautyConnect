import { useEffect, useMemo, useState } from 'react'
import { getCustomerBookings, getIncomingBookings } from '../api/booking'
import { getAssetUrl } from '../api/assets'
import { getProfessionalById } from '../api/search'
import { useAuth } from '../auth/useAuth'
import BookingLocationDetails from '../components/BookingLocationDetails'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import ReviewComposer from '../components/ReviewComposer'
import './BookingHistoryPage.css'

const bookingStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status

const statusFilters = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function BookingHistoryPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [professionalAvatars, setProfessionalAvatars] = useState({})
  const [filter, setFilter] = useState('All')
  const [reviewingBookingId, setReviewingBookingId] = useState(null)
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

  useEffect(() => {
    if (isProfessional || bookings.length === 0) return undefined

    let active = true
    const profileIds = [...new Set(bookings
      .filter((booking) => booking.professionalProfileId)
      .map((booking) => booking.professionalProfileId))]

    Promise.allSettled(profileIds.map(async (profileId) => {
      const profile = await getProfessionalById(profileId)
      return [profileId, profile?.avatarUrl]
    })).then((results) => {
      if (!active) return

      const avatars = Object.fromEntries(results
        .filter((result) => result.status === 'fulfilled' && result.value[1])
        .map((result) => result.value))
      setProfessionalAvatars(avatars)
    })

    return () => {
      active = false
    }
  }, [bookings, isProfessional])

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
              : 'Review your appointments, payment totals, and leave feedback after a completed service.'}
          </p>
        </div>
        <span className="material-symbols-outlined booking-history-hero-icon" aria-hidden="true">history</span>
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
              const bookingDate = new Date(booking.scheduledDateTime)
              const personName = isProfessional
                ? booking.customerName || 'BeautyConnect customer'
                : booking.professionalBusinessName || 'Beauty professional'
              const personAvatarUrl = isProfessional
                ? booking.customerAvatarUrl
                  || booking.CustomerAvatarUrl
                  || booking.customerProfile?.avatarUrl
                  || booking.customer?.avatarUrl
                  || booking.customer?.profile?.avatarUrl
                : booking.professionalAvatarUrl
                  || booking.professional?.avatarUrl
                  || booking.professional?.profile?.avatarUrl
                  || booking.professionalProfile?.avatarUrl
                    || professionalAvatars[booking.professionalProfileId]
              const personInitials = personName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase() || '?'

              return (
                <article className="booking-history-card glass-card" key={booking.id}>
                  <header className="booking-history-card-heading">
                    <div className="booking-history-service">
                      <div className="booking-history-service-image">
                        <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                        {booking.service?.images?.[0] && (
                          <img
                            src={getAssetUrl(booking.service.images[0])}
                            alt={`${booking.service.name ?? 'Booked'} service`}
                            onError={(event) => { event.currentTarget.hidden = true }}
                          />
                        )}
                      </div>
                      <div className="booking-history-card-title">
                        <p className="booking-history-kicker">Service appointment</p>
                        <h3>{booking.service?.name ?? 'Service appointment'}</h3>
                        <p className="booking-history-service-meta">
                          {[
                            booking.service?.category,
                            booking.service?.durationMinutes ? `${booking.service.durationMinutes} min` : null,
                          ].filter(Boolean).join(' · ') || (isProfessional ? 'Customer booking' : 'Professional service')}
                        </p>
                      </div>
                    </div>
                    <span className={`booking-history-status booking-history-status--${statusClass}`}>
                      {status}
                    </span>
                  </header>

                  <div className="booking-history-card-body">
                    <div className="booking-history-summary">
                      <section className="booking-history-person" aria-label={isProfessional ? 'Customer details' : 'Professional details'}>
                        <div className="booking-history-person-avatar">
                          <span aria-hidden="true">{personInitials}</span>
                          {personAvatarUrl && (
                            <img
                              src={getAssetUrl(personAvatarUrl)}
                              alt=""
                              onError={(event) => { event.currentTarget.hidden = true }}
                            />
                          )}
                        </div>
                        <div className="booking-history-person-copy">
                          <p className="booking-history-kicker">{isProfessional ? 'Customer' : 'Professional'}</p>
                          <h4>{personName}</h4>
                          {isProfessional && booking.customerEmail && (
                            <a href={`mailto:${booking.customerEmail}`}>{booking.customerEmail}</a>
                          )}
                        </div>
                      </section>

                      <div className="booking-history-info-grid">
                        <div className="booking-history-info-card">
                          <span className="material-symbols-outlined icon-tone--info" aria-hidden="true">calendar_month</span>
                          <div>
                            <small>Appointment</small>
                            <strong>{bookingDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}</strong>
                            <span>{bookingDate.toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}</span>
                          </div>
                        </div>
                        <div className="booking-history-info-card booking-history-info-card--total">
                          <span className="material-symbols-outlined icon-tone--coin" aria-hidden="true">payments</span>
                          <div>
                            <small>Booking total</small>
                            <strong><MoneyAmount value={booking.totalPrice} /></strong>
                          </div>
                        </div>
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
                      {!isProfessional && status === 'Completed' && (
                        booking.hasReview ? (
                          <span className="booking-history-reviewed">
                            <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                            Review submitted
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-primary booking-history-review-button"
                            aria-expanded={reviewingBookingId === booking.id}
                            onClick={() => setReviewingBookingId(booking.id)}
                          >
                            Write review
                          </button>
                        )
                      )}
                    </div>
                    <section className="booking-history-location" aria-label="Service location">
                      <p className="booking-history-kicker">Service location</p>
                      <BookingLocationDetails
                        location={booking.location}
                        contactPhone={isProfessional ? undefined : booking.professionalPhoneNumber ?? ''}
                        contactLabel={isProfessional ? 'Customer' : 'Professional'}
                        addressLabel={isProfessional ? 'Customer address' : 'Service address'}
                      />
                    </section>
                  </div>
                  {!isProfessional && reviewingBookingId === booking.id && !booking.hasReview && (
                    <ReviewComposer
                      booking={booking}
                      professionalAvatarUrl={personAvatarUrl}
                      onCancel={() => setReviewingBookingId(null)}
                      onSubmitted={(bookingId) => {
                        setBookings((current) => current.map((item) =>
                          item.id === bookingId ? { ...item, hasReview: true } : item,
                        ))
                        setReviewingBookingId(null)
                      }}
                    />
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
