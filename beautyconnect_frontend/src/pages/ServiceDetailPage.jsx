import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOpenSlots } from '../api/availability'
import { getAssetUrl } from '../api/assets'
import { getReviewAvatarUrl, getReviewsForProfessional } from '../api/review'
import { getProfessionalById } from '../api/search'
import { useAuth } from '../auth/useAuth'
import ExpandableText from '../components/ExpandableText'
import RatingStars from '../components/RatingStars'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import { notify } from '../utils/notifications'
import { formatTime12Hour } from '../utils/time'
import './ServiceDetailPage.css'

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status

function nepalDateString(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

function slotDateTime(slot) {
  const [wholeSeconds, fraction = ''] = slot.startTime.split('.')
  const milliseconds = fraction ? `.${fraction.slice(0, 3).padEnd(3, '0')}` : ''
  return new Date(`${slot.date}T${wholeSeconds}${milliseconds}+05:45`)
}

export default function ServiceDetailPage() {
  const { id, serviceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [professional, setProfessional] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadedProfileId, setLoadedProfileId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [showAvailability, setShowAvailability] = useState(false)
  const [minimumAppointmentDate] = useState(() => nepalDateString(new Date()))
  const [selectedDate, setSelectedDate] = useState(minimumAppointmentDate)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityKey, setAvailabilityKey] = useState('')

  useEffect(() => {
    let active = true

    Promise.allSettled([
      getProfessionalById(id),
      getReviewsForProfessional(id),
    ])
      .then(([profileResult, reviewResult]) => {
        if (!active) return
        if (profileResult.status === 'rejected') throw profileResult.reason
        if (!profileResult.value) {
          setErrorMessage('This professional profile could not be found.')
          return
        }

        setProfessional(profileResult.value)
        if (reviewResult.status === 'fulfilled') {
          setReviews(reviewResult.value ?? [])
        } else {
          setReviewError(reviewResult.reason.response?.data?.message ?? 'Reviews could not be loaded.')
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message ?? 'Could not load this service.')
        }
      })
      .finally(() => {
        if (active) {
          setLoadedProfileId(id)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id])

  const service = professional?.matchingServices?.find((item) => item.id === Number(serviceId))
  const activeAvailabilityKey = service
    ? `${professional?.id}:${selectedDate}:${service.id}`
    : ''

  useEffect(() => {
    if (!showAvailability || !professional || !service || service.durationMinutes >= 1440) return undefined

    let active = true
    const requestKey = `${professional.id}:${selectedDate}:${service.id}`

    getOpenSlots(professional.id, selectedDate, service.durationMinutes)
      .then((slots) => {
        if (active) {
          const now = new Date()
          setAvailableSlots((slots ?? []).filter((slot) => slotDateTime(slot) > now))
        }
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setAvailableSlots([])
        } else {
          setAvailabilityError(error.response?.data?.message ?? 'Could not load appointment times.')
        }
      })
      .finally(() => {
        if (active) {
          setAvailabilityKey(requestKey)
        }
      })

    return () => {
      active = false
    }
  }, [professional, selectedDate, service, showAvailability])

  function continueToBooking() {
    if (!service || !selectedSlot) return

    const appointmentTime = slotDateTime(selectedSlot)
    if (appointmentTime <= new Date()) {
      setSelectedSlot(null)
      notify.error('That appointment time has passed. Please choose another available time.')
      return
    }

    navigate(
      `/booking?serviceId=${service.id}&professionalProfileId=${professional.id}&scheduledDateTime=${encodeURIComponent(appointmentTime.toISOString())}`,
    )
  }

  const serviceReviews = useMemo(() => {
    if (!service) return []
    const serviceName = service.name.trim().toLocaleLowerCase()
    return reviews.filter((review) => review.serviceName?.trim().toLocaleLowerCase() === serviceName)
  }, [reviews, service])
  const averageRating = serviceReviews.length
    ? serviceReviews.reduce((total, review) => total + Number(review.rating), 0) / serviceReviews.length
    : 0

  if (loading || loadedProfileId !== id) {
    return <div className="container py-5"><LoadingState label="Loading service details…" /></div>
  }
  if (errorMessage) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">{errorMessage}</div>
      </div>
    )
  }
  if (!service) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">This service could not be found.</div>
      </div>
    )
  }

  return (
    <div className="container py-4 py-md-5 service-detail-page">
      <div className="service-detail-topbar">
        <span className="service-detail-breadcrumb">{professional.businessName} <span aria-hidden="true">/</span> {service.name}</span>
      </div>
      {verificationStatus(professional.verificationStatus) === 'Pending' && (
        <div className="alert alert-warning mt-3" role="status">
          This profile is pending verification and is not visible to the public until an Admin approves it.
        </div>
      )}

      <header className={`glass-card rounded-2xl service-detail-header${service.images?.length ? '' : ' service-detail-header--no-gallery'}`}>
        {service.images?.length > 0 && (
          <div className="service-detail-header-gallery" aria-label="Service photos">
            {service.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={getAssetUrl(image)}
                alt={`${service.name} example ${index + 1}`}
              />
            ))}
          </div>
        )}
        <div className="service-detail-heading">
          <p className="service-detail-eyebrow">{service.category}</p>
          <h1 className="font-headline">{service.name}</h1>
          <p className="text-on-surface-variant mb-0">
            By <Link to={`/artist/${professional.id}`}>{professional.businessName}</Link>
            {professional.city && ` · ${professional.city}`}
          </p>
          <div className="service-detail-rating" aria-label={`${averageRating.toFixed(1)} out of 5 from ${serviceReviews.length} reviews`}>
            <RatingStars rating={averageRating} />
            <strong>{averageRating.toFixed(1)}</strong>
            <span className="text-on-surface-variant">({serviceReviews.length} {serviceReviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
        <div className="service-detail-price">
          <span>Service price</span>
          <strong><MoneyAmount value={service.price} /></strong>
          <span>{service.durationMinutes} minutes</span>
          {service.durationMinutes >= 1440 ? (
            <p className="small text-danger mt-3 mb-0">
              This service cannot be booked online because its duration is 24 hours or longer.
            </p>
          ) : (
            <button
              className="btn btn-primary mt-3"
              type="button"
              aria-expanded={showAvailability}
              aria-controls="service-detail-availability"
              onClick={() => {
                if (!showAvailability) {
                  setAvailabilityError('')
                  setSelectedSlot(null)
                  setAvailabilityKey('')
                }
                setShowAvailability((visible) => !visible)
              }}
            >
              {showAvailability ? 'Hide appointment times' : 'Choose appointment time'}
            </button>
          )}
        </div>
      </header>

      {showAvailability && service.durationMinutes < 1440 && (
        <section className="glass-card service-detail-availability" id="service-detail-availability" aria-label="Choose appointment time">
          <div className="service-detail-availability-heading">
            <div>
              <p className="service-detail-eyebrow mb-1">Book this service</p>
              <h2 className="h5 mb-1">Choose an appointment time</h2>
              <p className="small text-on-surface-variant mb-0">
                {service.name} · {service.durationMinutes} minutes
              </p>
            </div>
          </div>
          <div className="service-detail-availability-controls">
            <label className="form-label" htmlFor="service-appointment-date">Choose a date</label>
            <input
              id="service-appointment-date"
              className="form-control"
              type="date"
              min={minimumAppointmentDate}
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value)
                setSelectedSlot(null)
                setAvailabilityKey('')
                setAvailabilityError('')
              }}
            />
          </div>
          {availabilityKey !== activeAvailabilityKey ? (
            <LoadingState variant="inline" label="Finding available times…" />
          ) : availabilityError ? (
            <p className="small text-danger mb-0" role="alert">{availabilityError}</p>
          ) : availableSlots.length === 0 ? (
            <p className="small text-on-surface-variant mb-0">No available times on this date. Try another date.</p>
          ) : (
            <div className="service-detail-time-slots" aria-label="Available appointment times">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot?.availabilityId === slot.availabilityId
                  && selectedSlot?.startTime === slot.startTime
                return (
                  <button
                    key={`${slot.availabilityId}-${slot.startTime}`}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatTime12Hour(slot.startTime)}
                  </button>
                )
              })}
            </div>
          )}
          {selectedSlot && (
            <button className="btn btn-primary w-100 service-detail-availability-continue" type="button" onClick={continueToBooking}>
              Continue to location &amp; payment
            </button>
          )}
        </section>
      )}

      <section className="service-detail-content" aria-label="Service information">
        <div className="service-detail-main">
          <article className="glass-card rounded-2xl p-4 p-md-5">
            <h2 className="h4 mb-3">About this service</h2>
            <ExpandableText
              className="service-detail-description"
              text={service.description || 'Contact the professional for more information about this service.'}
              lines={3}
            />
          </article>

          <section className="service-detail-reviews mt-5" aria-labelledby="service-reviews-heading">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
              <div>
                <p className="service-detail-eyebrow mb-1">Customer feedback</p>
                <h2 className="font-headline h3 mb-0" id="service-reviews-heading">Reviews for {service.name}</h2>
              </div>
              <Link className="btn btn-outline-primary" to={`/dashboard/customer?reviewServiceId=${service.id}`}>
                Write a review
              </Link>
            </div>
            <p className="small text-on-surface-variant">
              Reviews are available after a completed appointment. You can submit one from your appointments.
            </p>
            {reviewError && <div className="alert alert-warning" role="alert">{reviewError}</div>}
            {!reviewError && serviceReviews.length === 0 && (
              <div className="glass-card rounded-2xl p-4">
                <p className="mb-0 text-on-surface-variant">There are no reviews for this service yet.</p>
              </div>
            )}
            {!reviewError && serviceReviews.length > 0 && (
              <div className="service-review-list">
                {serviceReviews.map((review) => {
                  const avatarUrl = getReviewAvatarUrl(review, user)
                  return (
                    <article className="glass-card rounded-2xl p-4" key={review.id}>
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="d-flex align-items-center gap-3">
                          {avatarUrl ? (
                            <img
                              className="service-review-avatar rounded-circle"
                              src={getAssetUrl(avatarUrl)}
                              alt=""
                            />
                          ) : (
                            <span className="service-review-avatar service-review-avatar--fallback rounded-circle" aria-hidden="true">
                              {review.customerName?.trim()?.charAt(0)?.toLocaleUpperCase() || '?'}
                            </span>
                          )}
                          <div>
                            <h3 className="h6 mb-1">{review.customerName}</h3>
                            <time className="small text-on-surface-variant" dateTime={review.createdAt}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </time>
                          </div>
                        </div>
                        <RatingStars rating={review.rating} className="service-review-stars" />
                      </div>
                      <p className="mb-0 mt-3">{review.comment}</p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="service-detail-sidebar">
          <section className="glass-card rounded-2xl p-4">
            <h2 className="h5">About the professional</h2>
            <div className="service-professional-identity">
              {professional.avatarUrl ? (
                <img
                  className="service-detail-avatar rounded-circle"
                  src={getAssetUrl(professional.avatarUrl)}
                  alt=""
                />
              ) : (
                <span className="service-detail-avatar service-detail-avatar--fallback rounded-circle" aria-hidden="true">
                  {professional.businessName?.trim()?.charAt(0)?.toLocaleUpperCase() || '?'}
                </span>
              )}
              <div>
                <h3 className="h6 mb-1">{professional.businessName}</h3>
                <p className="small text-on-surface-variant mb-0">
                  {[professional.speciality, professional.city].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            {professional.bio && (
              <ExpandableText
                className="service-detail-professional-bio"
                text={professional.bio}
                lines={4}
              />
            )}
            <Link className="btn btn-outline-primary w-100 mt-3" to={`/artist/${professional.id}`}>
              View all services
            </Link>
          </section>
        </aside>
      </section>
    </div>
  )
}
