import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { cancelBooking, getCustomerBookings } from '../api/booking'
import { aggregateServiceRatings, getReviewsForProfessional, serviceRatingKey } from '../api/review'
import { getProfessionalById, getProfessionals } from '../api/search'
import { getAssetUrl } from '../api/assets'
import BookingLocationDetails from '../components/BookingLocationDetails'
import RatingStars from '../components/RatingStars'
import ExpandableText from '../components/ExpandableText'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import ReviewComposer from '../components/ReviewComposer'
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
  const [professionalAvatars, setProfessionalAvatars] = useState({})
  const [professionals, setProfessionals] = useState([])
  const [serviceRatings, setServiceRatings] = useState(new Map())
  const [serviceRatingFailures, setServiceRatingFailures] = useState(new Set())
  const [serviceRatingsLoading, setServiceRatingsLoading] = useState(true)
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All services')
  const [serviceSearch, setServiceSearch] = useState('')
  const [tab, setTab] = useState('upcoming')
  const [reviewing, setReviewing] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [reviewedBookingIds, setReviewedBookingIds] = useState([])
  const [cancellationReason, setCancellationReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const reviewServiceId = Number(searchParams.get('reviewServiceId'))

  useEffect(() => {
    if (bookings.length === 0) return undefined

    let active = true
    const profileIds = [...new Set(bookings
      .filter((booking) => booking.professionalProfileId)
      .map((booking) => booking.professionalProfileId))]

    Promise.allSettled(profileIds.map(async (profileId) => {
      const profile = await getProfessionalById(profileId)
      return [profileId, profile?.avatarUrl]
    })).then((results) => {
      if (!active) return

      setProfessionalAvatars(Object.fromEntries(results
        .filter((result) => result.status === 'fulfilled' && result.value[1])
        .map((result) => result.value)))
    })

    return () => {
      active = false
    }
  }, [bookings])

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
        if (!active) return
        const customerBookings = result ?? []
        setBookings(customerBookings)

        if (reviewServiceId) {
          const completedBookings = customerBookings.filter((booking) =>
            statusName(booking.status) === 'Completed'
            && booking.service?.id === reviewServiceId,
          )
          const completedBooking = completedBookings.find((booking) => !booking.hasReview)
          if (completedBooking) {
            setTab('history')
            setCancelling(null)
            setReviewing(completedBooking)
          } else {
            notify.info(
              completedBookings.length
                ? 'You have already reviewed this service.'
                : 'You can review this service after completing an appointment.',
            )
          }
          navigate('/dashboard/customer', { replace: true })
        }
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
  }, [navigate, reviewServiceId])

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
    if (catalogLoading) return undefined

    let active = true
    Promise.allSettled(professionals.map(async (professional) => ({
      professionalId: professional.id,
      ratings: aggregateServiceRatings(await getReviewsForProfessional(professional.id)),
    })))
      .then((results) => {
        if (!active) return
        const ratings = new Map()
        const failedProfessionalIds = new Set()
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            ratings.set(result.value.professionalId, result.value.ratings)
          } else {
            failedProfessionalIds.add(professionals[index].id)
          }
        })
        setServiceRatings(ratings)
        setServiceRatingFailures(failedProfessionalIds)
        setServiceRatingsLoading(false)
      })

    return () => {
      active = false
    }
  }, [catalogLoading, professionals])

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

  async function handleCancel(event) {
    event.preventDefault()
    if (!cancelling) return
    setErrorMessage('')
    setSubmitting(true)
    try {
      const cancelledBooking = await cancelBooking(cancelling.id, cancellationReason.trim())
      setBookings((current) => current.map((booking) =>
        booking.id === cancelledBooking.id ? cancelledBooking : booking,
      ))
      await loadBookings()
      setCancelling(null)
      setCancellationReason('')
      notify.success(
        refundStatusName(cancelledBooking.refundStatus) === 'Requested'
          ? 'Booking cancelled and your reason was shared with the professional. A full refund was requested; it will show as refunded after eSewa confirms it.'
          : 'Booking cancelled and your reason was shared with the professional.',
      )
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not cancel this booking.')
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
                <span className="material-symbols-outlined icon-tone--people" aria-hidden="true">person</span>
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
            <span className="material-symbols-outlined customer-stat-icon icon-tone--info" aria-hidden="true">event_upcoming</span>
            <span className="small text-on-surface-variant">Upcoming appointments</span>
            <strong className="d-block fs-3">{upcoming.length}</strong>
          </article>
        </div>
        <div className="customer-dashboard-stat">
          <article className="glass-card rounded-2xl p-3 p-md-4 h-100">
            <span className="material-symbols-outlined customer-stat-icon icon-tone--info" aria-hidden="true">history</span>
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
          <LoadingState label="Loading services…" />
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
                        <span className="material-symbols-outlined icon-tone--beauty" aria-hidden="true">face_3</span>
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
                    {professional.visibleServices.map((service) => {
                      const serviceRating = serviceRatings.get(professional.id)?.get(serviceRatingKey(service))
                        ?? serviceRatings.get(professional.id)?.get(`name:${service.name.trim().toLocaleLowerCase()}`)
                      return (
                      <div className={`customer-offering${service.images?.length ? ' customer-offering--with-gallery' : ''}`} key={service.id}>
                        {service.images?.length > 0 && (
                          <div className="customer-offering-gallery" aria-label={`${service.name} photos`}>
                            {service.images.slice(0, 3).map((image, index) => (
                              <img key={`${image}-${index}`} src={getAssetUrl(image)} alt={`${service.name} example ${index + 1}`} />
                            ))}
                          </div>
                        )}
                        <div className="customer-offering-info">
                          <div className="customer-offering-heading">
                            <Link
                              className="customer-offering-name"
                              to={`/artist/${professional.id}/service/${service.id}`}
                            >
                              {service.name}
                            </Link>
                            <strong className="customer-offering-price"><MoneyAmount value={service.price} /></strong>
                          </div>
                          <div className="customer-offering-meta">
                            <span>{service.category}</span>
                            <span>{service.durationMinutes} min</span>
                          </div>
                          {service.description && (
                            <ExpandableText
                              className="customer-offering-description"
                              text={service.description}
                              lines={2}
                            />
                          )}
                          <div className="customer-offering-rating" aria-live="polite">
                            {serviceRatingsLoading ? (
                              <LoadingState className="small" variant="inline" label="Loading rating…" />
                            ) : serviceRatingFailures.has(professional.id) ? (
                              <span className="small text-on-surface-variant">Rating unavailable</span>
                            ) : serviceRating ? (
                              <>
                                <RatingStars
                                  rating={serviceRating.total / serviceRating.count}
                                  className="rating-stars--compact"
                                />
                                <strong>
                                  {(serviceRating.total / serviceRating.count).toFixed(1)}
                                </strong>
                                <span className="small text-on-surface-variant">
                                  ({serviceRating.count})
                                </span>
                              </>
                            ) : (
                              <span className="small text-on-surface-variant">No reviews yet</span>
                            )}
                          </div>
                          <Link
                            className="customer-offering-link"
                            to={`/artist/${professional.id}/service/${service.id}`}
                          >
                            Service details
                          </Link>
                        </div>
                      </div>
                      )
                    })}
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
        <LoadingState label="Loading your bookings…" />
      ) : visibleBookings.length === 0 ? (
        <div className="glass-card rounded-2xl p-5 text-center">
          <h2 className="h5">No {tab === 'upcoming' ? 'upcoming bookings' : 'booking history'}</h2>
          <p className="text-on-surface-variant mb-3">{tab === 'upcoming' ? 'When you book an appointment, it will appear here.' : 'Completed and cancelled appointments will appear here.'}</p>
          {tab === 'upcoming' && <Link className="btn btn-primary" to="/search">Browse professionals</Link>}
        </div>
      ) : (
        <div className="customer-booking-list">
          {visibleBookings.map((booking) => {
            const status = statusName(booking.status)
            const professionalName = booking.professionalBusinessName || 'Beauty professional'
            const professionalAvatarUrl = professionalAvatars[booking.professionalProfileId]
              || professionals.find((professional) => professional.id === booking.professionalProfileId)?.avatarUrl
            const professionalInitial = professionalName.trim().charAt(0).toLocaleUpperCase() || '?'
            const appointmentDate = new Date(booking.scheduledDateTime)
            return (
              <article className={`customer-booking-card customer-booking-card--${status.toLocaleLowerCase()}`} key={booking.id}>
                <header className="customer-booking-card-header">
                  <div className="customer-booking-service">
                    <div className="customer-booking-service-image">
                      <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                      {booking.service?.images?.[0] && (
                        <img
                          src={getAssetUrl(booking.service.images[0])}
                          alt={`${booking.service.name ?? 'Booked'} service`}
                          onError={(event) => { event.currentTarget.hidden = true }}
                        />
                      )}
                    </div>
                    <div className="customer-booking-service-copy">
                      <p className="customer-booking-kicker">Service appointment</p>
                      <h3>{booking.service?.name ?? 'Service appointment'}</h3>
                      <span>
                        {[booking.service?.category, booking.service?.durationMinutes ? `${booking.service.durationMinutes} min` : null]
                          .filter(Boolean).join(' · ') || 'Beauty service'}
                      </span>
                    </div>
                  </div>
                  <div className="customer-booking-header-tools">
                    <span className={`customer-booking-status customer-booking-status--${status.toLocaleLowerCase()}`}>
                      <span aria-hidden="true" />
                      {status}
                    </span>
                    {['Pending', 'Confirmed'].includes(status) && (
                      <button
                        type="button"
                        className="btn btn-outline-danger customer-booking-cancel"
                        onClick={() => {
                          setCancelling(booking)
                          setCancellationReason('')
                          setReviewing(null)
                        }}
                      >
                        Cancel booking
                      </button>
                    )}
                    {status === 'Completed' && (booking.hasReview || reviewedBookingIds.includes(booking.id)) && (
                      <span className="customer-booking-reviewed">Review submitted</span>
                    )}
                  </div>
                </header>

                <div className="customer-booking-card-body">
                  <div className="customer-booking-summary">
                    <section className="customer-booking-professional" aria-label="Professional details">
                      <div className="customer-booking-avatar">
                        <span aria-hidden="true">{professionalInitial}</span>
                        {professionalAvatarUrl && (
                          <img
                            src={getAssetUrl(professionalAvatarUrl)}
                            alt=""
                            onError={(event) => { event.currentTarget.hidden = true }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="customer-booking-kicker">Professional</p>
                        <h4>{professionalName}</h4>
                      </div>
                    </section>

                    <div className="customer-booking-info-card">
                      <span className="material-symbols-outlined icon-tone--info" aria-hidden="true">calendar_month</span>
                      <div>
                        <small>Appointment</small>
                        <strong>{appointmentDate.toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}</strong>
                        <span>{appointmentDate.toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}</span>
                      </div>
                    </div>

                    <div className="customer-booking-info-card customer-booking-total">
                      <span className="material-symbols-outlined icon-tone--coin" aria-hidden="true">payments</span>
                      <div>
                        <small>Booking total</small>
                        <strong><MoneyAmount value={booking.totalPrice} /></strong>
                      </div>
                    </div>

                    {(refundStatusName(booking.refundStatus) !== 'Not requested' || booking.notes || (status === 'Cancelled' && booking.cancellationReason)) && (
                      <div className="customer-booking-extra">
                        {refundStatusName(booking.refundStatus) !== 'Not requested' && (
                          <p>
                            Refund: <strong>{refundStatusName(booking.refundStatus)}</strong>
                            {booking.refundAmount != null && <> · <MoneyAmount value={booking.refundAmount} /></>}
                          </p>
                        )}
                        {booking.notes && <p><strong>Your notes:</strong> {booking.notes}</p>}
                        {status === 'Cancelled' && booking.cancellationReason && (
                          <p><strong>Cancellation reason:</strong> {booking.cancellationReason}</p>
                        )}
                      </div>
                    )}
                    {status === 'Completed' && !booking.hasReview && !reviewedBookingIds.includes(booking.id) && (
                      <button
                        type="button"
                        className="btn btn-outline-primary customer-booking-review"
                        onClick={() => {
                          setReviewing(booking)
                          setCancelling(null)
                        }}
                      >
                        Write review
                      </button>
                    )}
                  </div>

                  <section className="customer-booking-location" aria-label="Service location">
                    <p className="customer-booking-kicker">Service location</p>
                    <BookingLocationDetails
                      location={booking.location}
                      contactPhone={booking.professionalPhoneNumber ?? ''}
                      contactLabel="Professional"
                      addressLabel="Service address"
                    />
                  </section>
                </div>
                {reviewing?.id === booking.id && (
                  <ReviewComposer
                    booking={booking}
                    professionalAvatarUrl={professionalAvatarUrl}
                    onCancel={() => setReviewing(null)}
                    onSubmitted={(bookingId) => {
                      setReviewedBookingIds((current) => [...current, bookingId])
                      setReviewing(null)
                    }}
                  />
                )}
                {cancelling?.id === booking.id && (
                  <form className="customer-feedback-form mt-4" onSubmit={handleCancel}>
                    <h3 className="h5">Why are you cancelling?</h3>
                    <p className="small text-on-surface-variant">Your reason will be shared with the professional and saved with this appointment.</p>
                    <label className="form-label" htmlFor={`cancellation-reason-${booking.id}`}>Cancellation reason</label>
                    <textarea
                      id={`cancellation-reason-${booking.id}`}
                      className="form-control mb-3"
                      maxLength="1000"
                      minLength="3"
                      required
                      value={cancellationReason}
                      onChange={(event) => setCancellationReason(event.target.value)}
                    />
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-danger" disabled={submitting}>
                        {submitting ? 'Cancelling…' : 'Confirm cancellation'}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setCancelling(null)}>Keep booking</button>
                    </div>
                  </form>
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
