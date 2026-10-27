import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getOpenSlots } from '../api/availability'
import { getProfessionalById } from '../api/search'
import { getAssetUrl } from '../api/assets'
import { aggregateServiceRatings, getReviewsForProfessional, serviceRatingKey } from '../api/review'
import RatingStars from '../components/RatingStars'
import { notify } from '../utils/notifications'
import { formatTime12Hour } from '../utils/time'
import { formatNpr } from '../utils/currency'
import './ArtistProfilePage.css'

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

export default function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedServiceId = Number(searchParams.get('serviceId'))
  const [serviceSelection, setServiceSelection] = useState(() => ({
    professionalId: id,
    serviceId: requestedServiceId || null,
  }))
  const [professional, setProfessional] = useState(null)
  const [serviceRatings, setServiceRatings] = useState(new Map())
  const [serviceRatingsError, setServiceRatingsError] = useState(false)
  const [loadedProfileId, setLoadedProfileId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => nepalDateString(new Date()))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [slotLoading, setSlotLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [slotError, setSlotError] = useState('')
  const [availabilityKey, setAvailabilityKey] = useState('')
  const selectedServiceId = serviceSelection.professionalId === id
    ? serviceSelection.serviceId
    : requestedServiceId || null

  useEffect(() => {
    let active = true
    getProfessionalById(id)
      .then((profile) => {
        if (!active) return
        if (!profile) {
          setErrorMessage('This professional profile could not be found.')
          setLoadedProfileId(id)
          return
        }
        setProfessional(profile)
        setErrorMessage('')
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message ?? 'Could not load this professional profile.')
          setLoadedProfileId(id)
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

  useEffect(() => {
    if (!professional) return undefined

    let active = true
    getReviewsForProfessional(professional.id)
      .then((reviews) => {
        if (active) {
          setServiceRatings(aggregateServiceRatings(reviews))
          setServiceRatingsError(false)
        }
      })
      .catch(() => {
        if (active) setServiceRatingsError(true)
      })

    return () => {
      active = false
    }
  }, [professional])

  useEffect(() => {
    if (!professional) return undefined
    if (!selectedServiceId) return undefined

    const selectedService = (professional.matchingServices ?? [])
      .find((service) => service.id === selectedServiceId)
    if (!selectedService || selectedService.durationMinutes >= 1440) return undefined

    let active = true
    const currentAvailabilityKey = `${professional.id}:${selectedDate}:${selectedService.id}`
    getOpenSlots(professional.id, selectedDate, selectedService.durationMinutes)
      .then((openSlots) => {
        if (active) {
          const now = new Date()
          setSlots(openSlots.filter((slot) => slotDateTime(slot) > now))
        }
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status === 404) {
          setSlots([])
        } else {
          setSlotError(error.response?.data?.message ?? 'Could not load availability.')
        }
      })
      .finally(() => {
        if (active) {
          setAvailabilityKey(currentAvailabilityKey)
          setSlotLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [professional, selectedDate, selectedServiceId])

  function startBooking(service) {
    const slot = selectedSlot
    const appointmentTime = slotDateTime(slot)
    if (appointmentTime <= new Date()) {
      setSelectedSlot(null)
      notify.error('That appointment time has passed. Please choose another available time.')
      return
    }

    const scheduledDateTime = appointmentTime.toISOString()
    navigate(
      `/booking?serviceId=${service.id}&professionalProfileId=${professional.id}&scheduledDateTime=${encodeURIComponent(scheduledDateTime)}`,
    )
  }

  if (loading || loadedProfileId !== id) return <div className="container py-5" role="status">Loading professional profile…</div>
  if (errorMessage) return <div className="container py-5"><div className="alert alert-warning" role="alert">{errorMessage}</div></div>
  if (!professional) return null

  const services = professional.matchingServices ?? []
  const profileGalleryImages = [...new Set(
    services.flatMap((service) => service.images ?? []),
  )].slice(0, 3)
  const profileCoverImages = profileGalleryImages.length
    ? profileGalleryImages
    : professional.avatarUrl ? [professional.avatarUrl] : []
  const activeAvailabilityKey = `${professional.id}:${selectedDate}:${selectedServiceId ?? 'none'}`
  const selectedService = services.find((service) => service.id === selectedServiceId)
  const visibleSlots = availabilityKey === activeAvailabilityKey ? slots : []

  return (
    <div className="container py-4 py-md-5 artist-profile-page">
      {verificationStatus(professional.verificationStatus) === 'Pending' && (
        <div className="alert alert-warning mt-3" role="status">
          This profile is pending verification and is not visible to the public until an Admin approves it.
        </div>
      )}
      <section className={`artist-profile-hero${profileCoverImages.length ? ` artist-profile-hero--images-${profileCoverImages.length}` : ''}`} aria-labelledby="artist-profile-name">
        {profileCoverImages.length > 0 ? (
          <div className="artist-profile-cover" aria-label={`${professional.businessName} portfolio images`}>
            {profileCoverImages.map((image, index) => (
              <img
                className={`artist-profile-cover-image artist-profile-cover-image--${index + 1}`}
                key={`${image}-${index}`}
                src={getAssetUrl(image)}
                alt={`${professional.businessName} service portfolio ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="artist-profile-cover artist-profile-cover--empty" aria-hidden="true">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
        )}
        <div className="glass-card artist-profile-identity">
          {professional.avatarUrl ? (
            <img className="artist-profile-avatar" src={getAssetUrl(professional.avatarUrl)} alt="" />
          ) : (
            <span className="artist-profile-avatar artist-profile-avatar--fallback" aria-hidden="true">
              {professional.businessName?.trim()?.charAt(0)?.toLocaleUpperCase() || '?'}
            </span>
          )}
          <div className="artist-profile-identity-copy">
            <div className="artist-profile-name-row">
              <div>
                <p className="artist-profile-eyebrow mb-1">{professional.speciality || 'Beauty professional'}</p>
                <h1 className="font-headline mb-1" id="artist-profile-name">{professional.businessName}</h1>
              </div>
              {verificationStatus(professional.verificationStatus) === 'Approved' && (
                <span className="artist-profile-verified">
                  <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                  Verified
                </span>
              )}
            </div>
            {professional.city && (
              <p className="artist-profile-location">
                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                {professional.city}
              </p>
            )}
            <div className="artist-rating-summary">
              {professional.totalReviews > 0 ? (
                <>
                  <span className="artist-rating-summary-score">
                    <RatingStars rating={professional.ratingAverage} />
                    <strong>{Number(professional.ratingAverage ?? 0).toFixed(1)}</strong>
                  </span>
                  <span className="artist-rating-summary-count">
                    {professional.totalReviews} {professional.totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                </>
              ) : (
                <span className="artist-rating-summary-count">No reviews yet</span>
              )}
              <span className="artist-rating-summary-note">Overall rating · all services</span>
            </div>
            {professional.bio && <p className="artist-profile-bio">{professional.bio}</p>}
          </div>
        </div>
      </section>

      <div className="row g-4 mt-1">
        <section className="col-lg-7" id="services">
          <h2 className="h4 mb-3">Services</h2>
          {services.length === 0 ? (
            <p className="text-on-surface-variant">No services are listed yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {services.map((service) => {
                const serviceRating = serviceRatings.get(serviceRatingKey(service))
                  ?? serviceRatings.get(`name:${service.name.trim().toLocaleLowerCase()}`)
                return (
                <article key={service.id} className={`glass-card rounded-2xl artist-service-card${selectedServiceId === service.id ? ' artist-service-card--selected' : ''}`}>
                  <div className={`artist-service-card-main${service.images?.length ? ' artist-service-card-main--with-gallery' : ''}`}>
                    {service.images?.length > 0 && (
                      <div className="artist-service-gallery" aria-label={`${service.name} photos`}>
                        {service.images.map((image, index) => (
                          <img key={`${image}-${index}`} src={getAssetUrl(image)} alt={`${service.name} example ${index + 1}`} />
                        ))}
                      </div>
                    )}
                    <div className="artist-service-card-copy">
                      <p className="artist-service-category">{service.category}</p>
                      <h3 className="h5 mb-2">{service.name}</h3>
                      <p className="small text-on-surface-variant mb-2">{service.durationMinutes} minutes</p>
                      {service.description && <p className="artist-service-description">{service.description}</p>}
                      <div className="artist-service-rating" aria-live="polite">
                        {serviceRatingsError ? (
                            <span className="small text-on-surface-variant">Rating unavailable</span>
                          ) : serviceRating ? (
                            <>
                              <RatingStars rating={serviceRating.total / serviceRating.count} className="rating-stars--compact" />
                              <strong>{(serviceRating.total / serviceRating.count).toFixed(1)}</strong>
                              <span className="small text-on-surface-variant">
                                ({serviceRating.count} {serviceRating.count === 1 ? 'review' : 'reviews'})
                              </span>
                            </>
                          ) : (
                            <span className="small text-on-surface-variant">No reviews yet</span>
                          )}
                      </div>
                    </div>
                    <div className="artist-service-card-actions">
                      <strong className="artist-service-price">{formatNpr(service.price)}</strong>
                      <Link className="btn btn-outline-primary" to={`/artist/${professional.id}/service/${service.id}`}>
                        Service details
                      </Link>
                      <button
                        className={`btn ${selectedServiceId === service.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        type="button"
                        disabled={service.durationMinutes >= 1440}
                        aria-pressed={selectedServiceId === service.id}
                        onClick={() => {
                          setServiceSelection({ professionalId: id, serviceId: service.id })
                          setSelectedSlot(null)
                          setSlotError('')
                        }}
                      >
                        {selectedServiceId === service.id ? 'Selected' : 'Choose service'}
                      </button>
                    </div>
                  </div>
                  {service.durationMinutes >= 1440 && (
                    <p className="small text-danger mb-0">
                      This service cannot be booked because its duration is 24 hours or longer. Please contact the professional.
                    </p>
                  )}
                </article>
                )
              })}
            </div>
          )}
        </section>

        <aside className="col-lg-5">
          <div className="glass-card rounded-2xl p-4" id="appointments">
            <h2 className="h5">Available appointments</h2>
            {!selectedService ? (
              <p className="text-on-surface-variant">Choose a service first to see appointment times that fit its duration.</p>
            ) : (
              <p className="small text-on-surface-variant">
                {selectedService.name} · {selectedService.durationMinutes} minutes
              </p>
            )}
            <label className="form-label" htmlFor="appointment-date">Choose a date</label>
            <input
              id="appointment-date"
              className="form-control mb-3"
              type="date"
              min={nepalDateString(new Date())}
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value)
                setSelectedSlot(null)
                setSlotError('')
              }}
            />
            {selectedService && (slotLoading || availabilityKey !== activeAvailabilityKey) && <p role="status">Finding bookable times…</p>}
            {slotError && <div className="alert alert-danger" role="alert">{slotError}</div>}
            {selectedService && !slotLoading && availabilityKey === activeAvailabilityKey && !slotError && visibleSlots.length === 0 && (
              <p className="text-on-surface-variant">No bookable times for this service on this date. Try another date.</p>
            )}
            <div className="d-flex flex-wrap gap-2">
              {visibleSlots.map((slot) => (
                <button
                  key={`${slot.availabilityId}-${slot.startTime}`}
                  className={`btn ${selectedSlot?.availabilityId === slot.availabilityId && selectedSlot?.startTime === slot.startTime ? 'btn-primary' : 'btn-outline-primary'}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                >
                  {formatTime12Hour(slot.startTime)}
                </button>
              ))}
            </div>
            {selectedService && selectedSlot && (
              <button className="btn btn-primary w-100 mt-3" type="button" onClick={() => startBooking(selectedService)}>
                Continue with {selectedService.name}
              </button>
            )}
          </div>
        </aside>
      </div>

    </div>
  )
}
