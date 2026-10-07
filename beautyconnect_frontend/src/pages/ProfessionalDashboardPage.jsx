import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  acceptBooking,
  completeBooking,
  getIncomingBookings,
  rejectBooking,
} from '../api/booking'
import {
  createAvailability,
  getMyAvailability,
} from '../api/availability'
import {
  addService,
  getMyProfile,
} from '../api/professionalProfile'
import { useAuth } from '../auth/useAuth'

const bookingStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status
const profileStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status

export default function ProfessionalDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [serviceName, setServiceName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('60')

  const loadDashboard = useCallback(async () => {
    const results = await Promise.allSettled([
      getMyProfile(),
      getIncomingBookings(),
      getMyAvailability(),
    ])
    if (results[0].status === 'fulfilled') setProfile(results[0].value)
    if (results[1].status === 'fulfilled') setBookings(results[1].value ?? [])
    if (results[2].status === 'fulfilled') setAvailability(results[2].value ?? [])

    const errors = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.response?.data?.message ?? 'Some professional data could not be loaded.')
    if (errors.length) setErrorMessage([...new Set(errors)].join(' '))
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      getMyProfile(),
      getIncomingBookings(),
      getMyAvailability(),
    ])
      .then((results) => {
        if (!active) return
        if (results[0].status === 'fulfilled') setProfile(results[0].value)
        if (results[1].status === 'fulfilled') setBookings(results[1].value ?? [])
        if (results[2].status === 'fulfilled') setAvailability(results[2].value ?? [])
        const errors = results
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason.response?.data?.message ?? 'Some professional data could not be loaded.')
        if (errors.length) setErrorMessage([...new Set(errors)].join(' '))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadDashboard])

  async function updateBooking(bookingId, action) {
    setErrorMessage('')
    try {
      await action(bookingId)
      await loadDashboard()
      setNotice('Booking status updated.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not update this booking.')
    }
  }

  async function handleAvailability(event) {
    event.preventDefault()
    setErrorMessage('')
    try {
      await createAvailability({
        dayOfWeek: Number(dayOfWeek),
        specificDate: null,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        isAvailable: true,
      })
      await loadDashboard()
      setNotice('Availability added.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not add availability.')
    }
  }

  async function handleAddService(event) {
    event.preventDefault()
    setErrorMessage('')
    try {
      await addService({
        name: serviceName,
        description: '',
        category: serviceCategory,
        price: Number(servicePrice),
        durationMinutes: Number(serviceDuration),
      })
      await loadDashboard()
      setServiceName('')
      setServiceCategory('')
      setServicePrice('')
      setNotice('Service added to your profile.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not add this service.')
    }
  }

  if (loading) return <div className="container py-5" role="status">Loading professional dashboard…</div>

  const incoming = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(bookingStatus(booking.status)))
  const pendingCount = bookings.filter((booking) => bookingStatus(booking.status) === 'Pending').length

  return (
    <div className="container py-5">
      <header className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <div>
          <p className="text-uppercase text-secondary fw-semibold small mb-2">Professional studio</p>
          <h1 className="font-headline">{profile?.businessName ?? user?.email}</h1>
          <p className="text-on-surface-variant mb-0">
            {[profile?.speciality, profile?.city].filter(Boolean).join(' · ')}
            {profile?.verificationStatus !== undefined && ` · Verification: ${profileStatus(profile.verificationStatus)}`}
          </p>
        </div>
        {profile && <Link className="btn btn-outline-primary align-self-start" to={`/artist/${profile.id}`}>View public profile</Link>}
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Active bookings</span><strong className="d-block fs-3">{incoming.length}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Pending requests</span><strong className="d-block fs-3">{pendingCount}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Availability slots</span><strong className="d-block fs-3">{availability.length}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Services</span><strong className="d-block fs-3">{profile?.services?.length ?? 0}</strong></div></div>
      </div>

      <div className="row g-4">
        <section className="col-12 col-xl-7">
          <div className="glass-card rounded-2xl p-4">
            <h2 className="h4 mb-3">Incoming bookings</h2>
            {incoming.length === 0 ? (
              <p className="text-on-surface-variant mb-0">No active bookings.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {incoming.map((booking) => {
                  const status = bookingStatus(booking.status)
                  return (
                    <article className="border rounded-3 p-3" key={booking.id}>
                      <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                        <div>
                          <h3 className="h6 mb-1">{booking.service?.name ?? 'Service booking'}</h3>
                          <p className="small mb-1">{booking.customerName} · {booking.customerEmail}</p>
                          <p className="small text-on-surface-variant mb-1">{new Date(booking.scheduledDateTime).toLocaleString()}</p>
                          <span className="small">{status} · {booking.totalPrice}</span>
                          {booking.notes && <p className="small mt-2 mb-0">{booking.notes}</p>}
                        </div>
                        <div className="d-flex flex-wrap align-items-start gap-2">
                          {status === 'Pending' && (
                            <>
                              <button className="btn btn-sm btn-primary" type="button" onClick={() => updateBooking(booking.id, acceptBooking)}>Accept</button>
                              <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => updateBooking(booking.id, rejectBooking)}>Reject</button>
                            </>
                          )}
                          {status === 'Confirmed' && (
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => updateBooking(booking.id, completeBooking)}>Mark complete</button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <div className="col-12 col-xl-5 d-flex flex-column gap-4">
          <section className="glass-card rounded-2xl p-4">
            <h2 className="h5">Weekly availability</h2>
            <form onSubmit={handleAvailability}>
              <label className="form-label" htmlFor="availability-day">Day of week</label>
              <select id="availability-day" className="form-select mb-3" value={dayOfWeek} onChange={(event) => setDayOfWeek(event.target.value)}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, value) => <option key={day} value={value}>{day}</option>)}
              </select>
              <div className="row g-2 mb-3">
                <div className="col-6"><label className="form-label" htmlFor="availability-start">Start</label><input id="availability-start" className="form-control" type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} /></div>
                <div className="col-6"><label className="form-label" htmlFor="availability-end">End</label><input id="availability-end" className="form-control" type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} /></div>
              </div>
              <button className="btn btn-outline-primary" type="submit">Add availability</button>
            </form>
            <ul className="list-group list-group-flush mt-3">
              {availability.map((slot) => (
                <li className="list-group-item px-0" key={slot.id}>
                  {slot.specificDate ?? (slot.dayOfWeek === null ? 'Date not set' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.dayOfWeek])}
                  {' · '}{slot.startTime}–{slot.endTime}{!slot.isAvailable && ' · unavailable'}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-card rounded-2xl p-4">
            <h2 className="h5">Services</h2>
            {profile?.services?.length ? (
              <ul className="list-group list-group-flush mb-3">
                {profile.services.map((service) => <li className="list-group-item px-0" key={service.id}>{service.name} · {service.price} · {service.durationMinutes} min</li>)}
              </ul>
            ) : <p className="small text-on-surface-variant">No services are listed yet.</p>}
            <form onSubmit={handleAddService}>
              <label className="form-label" htmlFor="service-name">Service name</label>
              <input id="service-name" className="form-control mb-2" required value={serviceName} onChange={(event) => setServiceName(event.target.value)} />
              <label className="form-label" htmlFor="service-category">Category</label>
              <input id="service-category" className="form-control mb-2" required value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} />
              <div className="row g-2 mb-3">
                <div className="col-6"><label className="form-label" htmlFor="service-price">Price</label><input id="service-price" className="form-control" type="number" min="0.01" step="0.01" required value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} /></div>
                <div className="col-6"><label className="form-label" htmlFor="service-duration">Minutes</label><input id="service-duration" className="form-control" type="number" min="1" max="1440" required value={serviceDuration} onChange={(event) => setServiceDuration(event.target.value)} /></div>
              </div>
              <button className="btn btn-outline-primary" type="submit">Add service</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
