import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOpenSlots } from '../api/availability'
import { getReviewsForProfessional } from '../api/review'
import { getProfessionalById } from '../api/search'
import { getAssetUrl } from '../api/assets'

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

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function serviceFitsSlot(service, slot) {
  return service.durationMinutes < 1440
    && service.durationMinutes <= timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)
}

export default function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [professional, setProfessional] = useState(null)
  const [loadedProfileId, setLoadedProfileId] = useState(null)
  const [reviews, setReviews] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => nepalDateString(new Date()))
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [slotLoading, setSlotLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [slotError, setSlotError] = useState('')
  const [reviewError, setReviewError] = useState('')
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
        const profile = profileResult.value
        if (!profile) {
          setErrorMessage('This professional profile could not be found.')
          setLoadedProfileId(id)
          return
        }
        setProfessional(profile)
        setErrorMessage('')
        setReviewError('')
        if (reviewResult.status === 'fulfilled') {
          setReviews(reviewResult.value ?? [])
          setReviewError('')
        } else {
          setReviewError(reviewResult.reason.response?.data?.message ?? 'Reviews could not be loaded.')
        }
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
    const currentAvailabilityKey = `${professional.id}:${selectedDate}`
    getOpenSlots(professional.id, selectedDate)
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
  }, [professional, selectedDate])

  function startBooking(service) {
    const slot = selectedSlot
    const appointmentTime = slotDateTime(slot)
    if (appointmentTime <= new Date()) {
      setSelectedSlot(null)
      setSlotError('That appointment time has passed. Please choose another available time.')
      return
    }

    const scheduledDateTime = appointmentTime.toISOString()
    navigate(
      `/booking?serviceId=${service.id}&professionalProfileId=${professional.id}&scheduledDateTime=${encodeURIComponent(scheduledDateTime)}`,
    )
  }

  if (loading || loadedProfileId !== id) return <div className="container py-5" role="status">Loading professional profile…</div>
  if (errorMessage) return <div className="container py-5"><div className="alert alert-warning" role="alert">{errorMessage}</div><Link to="/search">Back to search</Link></div>
  if (!professional) return null

  const services = professional.matchingServices ?? []
  const activeAvailabilityKey = `${professional.id}:${selectedDate}`
  const visibleSlots = availabilityKey === activeAvailabilityKey ? slots : []

  return (
    <div className="container py-5">
      <Link to="/search" className="small">← Back to professionals</Link>
      {verificationStatus(professional.verificationStatus) === 'Pending' && (
        <div className="alert alert-warning mt-3" role="status">
          This profile is pending verification and is not visible to the public until an Admin approves it.
        </div>
      )}
      <section className="glass-card rounded-2xl p-4 p-md-5 mt-3">
        <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
          {professional.avatarUrl && (
            <img className="rounded-circle object-fit-cover" style={{ width: 132, height: 132 }} src={getAssetUrl(professional.avatarUrl)} alt="" />
          )}
          <div className="flex-grow-1">
            <h1 className="font-headline">{professional.businessName}</h1>
            <p className="text-secondary mb-2">
              {[professional.speciality, professional.city].filter(Boolean).join(' · ')}
            </p>
            <p className="mb-2">★ {Number(professional.ratingAverage ?? 0).toFixed(1)} · {professional.totalReviews ?? 0} reviews</p>
            {professional.bio && <p>{professional.bio}</p>}
          </div>
        </div>
      </section>

      <div className="row g-4 mt-1">
        <section className="col-lg-7">
          <h2 className="h4 mb-3">Services</h2>
          {services.length === 0 ? (
            <p className="text-on-surface-variant">No services are listed yet.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {services.map((service) => (
                <article key={service.id} className="glass-card rounded-2xl p-4 d-flex flex-column flex-sm-row justify-content-between gap-3">
                  <div>
                    <h3 className="h5">{service.name}</h3>
                    <p className="small text-on-surface-variant">{service.category} · {service.durationMinutes} minutes</p>
                    {service.description && <p className="mb-0">{service.description}</p>}
                    {service.durationMinutes >= 1440 && (
                      <p className="small text-danger mb-0">
                        This service cannot be booked because its duration is 24 hours or longer. Please contact the professional.
                      </p>
                    )}
                  </div>
                  <div className="text-sm-end">
                    <strong className="d-block mb-2">{service.price}</strong>
                    {selectedSlot && service.durationMinutes < 1440 && !serviceFitsSlot(service, selectedSlot) && (
                      <p className="small text-danger mb-2">The selected availability is shorter than this service.</p>
                    )}
                    <button className="btn btn-primary" type="button" disabled={!selectedSlot || !serviceFitsSlot(service, selectedSlot)} onClick={() => startBooking(service)}>
                      Select to book
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="col-lg-5">
          <div className="glass-card rounded-2xl p-4">
            <h2 className="h5">Available appointments</h2>
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
            {(slotLoading || availabilityKey !== activeAvailabilityKey) && <p role="status">Loading availability…</p>}
            {slotError && <div className="alert alert-danger" role="alert">{slotError}</div>}
            {!slotLoading && availabilityKey === activeAvailabilityKey && !slotError && visibleSlots.length === 0 && (
              <p className="text-on-surface-variant">No open slots for this date.</p>
            )}
            <div className="d-flex flex-wrap gap-2">
              {visibleSlots.map((slot) => (
                <button
                  key={`${slot.availabilityId}-${slot.startTime}`}
                  className={`btn ${selectedSlot === slot ? 'btn-primary' : 'btn-outline-primary'}`}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-5">
        <h2 className="h4 mb-3">Client reviews</h2>
        {reviewError && <div className="alert alert-warning" role="alert">{reviewError}</div>}
        {!reviewError && reviews.length === 0 ? (
          <p className="text-on-surface-variant">There are no reviews to show.</p>
        ) : reviews.length > 0 ? (
          <div className="row g-3">
            {reviews.map((review) => (
              <article key={review.id} className="col-12 col-md-6">
                <div className="glass-card rounded-2xl p-4 h-100">
                  <div className="d-flex justify-content-between gap-2">
                    <strong>{review.customerName}</strong>
                    <span>★ {review.rating}/5</span>
                  </div>
                  {review.serviceName && <p className="small text-secondary mt-2 mb-1">{review.serviceName}</p>}
                  <p className="mb-0">{review.comment}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
