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
  updateAvailability,
} from '../api/availability'
import {
  getMyProfile,
  submitForVerification,
} from '../api/professionalProfile'
import { verifyBookingRefund } from '../api/payment'
import { useAuth } from '../auth/useAuth'
import { notify } from '../utils/notifications'
import { formatTime12Hour } from '../utils/time'
import './ProfessionalDashboardPage.css'

const bookingStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status
const profileStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status
const refundStatus = (status) => typeof status === 'number'
  ? ['Not requested', 'Requested', 'Refunded'][status] ?? 'Unknown'
  : status
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ProfessionalDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [availabilityEditorDay, setAvailabilityEditorDay] = useState(null)
  const [expandedScheduleDay, setExpandedScheduleDay] = useState(null)
  const [editingAvailabilityId, setEditingAvailabilityId] = useState(null)
  const [verifyingRefundId, setVerifyingRefundId] = useState(null)

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
      notify.success('Booking status updated.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not update this booking.')
    }
  }

  async function handleVerifyRefund(bookingId) {
    setVerifyingRefundId(bookingId)
    try {
      const result = await verifyBookingRefund(bookingId)
      await loadDashboard()
      notify.success(`eSewa confirmed the full refund of ${result.refundAmount}.`)
    } catch (error) {
      const message = error.response?.status === 409
        ? 'eSewa has not confirmed this refund yet. If you already processed it through your merchant account, wait for the status to update and check again.'
        : error.response?.data?.message ?? 'Could not verify the eSewa refund.'
      notify.warning(message)
    } finally {
      setVerifyingRefundId(null)
    }
  }

  async function handleAvailability(event) {
    event.preventDefault()
    setErrorMessage('')
    const nextStart = `${startTime}:00`
    const nextEnd = `${endTime}:00`
    if (startTime >= endTime) {
      notify.error('Choose an end time later than the start time.')
      return
    }

    const overlapsExistingHours = availability.some((slot) =>
      slot.specificDate == null
      && Number(slot.dayOfWeek) === Number(dayOfWeek)
      && slot.isAvailable
      && slot.id !== editingAvailabilityId
      && startTime < slot.endTime.slice(0, 5)
      && endTime > slot.startTime.slice(0, 5),
    )
    if (overlapsExistingHours) {
      notify.error('These hours overlap another active shift. Edit that shift or choose a different time.')
      return
    }

    try {
      const schedule = {
        dayOfWeek: Number(dayOfWeek),
        specificDate: null,
        startTime: nextStart,
        endTime: nextEnd,
        isAvailable: true,
      }
      if (editingAvailabilityId !== null) {
        await updateAvailability(editingAvailabilityId, schedule)
      } else {
        await createAvailability(schedule)
      }
      await loadDashboard()
      setAvailabilityEditorDay(null)
      setEditingAvailabilityId(null)
      notify.success(editingAvailabilityId !== null ? 'Working hours updated.' : 'Working hours added.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not save these working hours.')
    }
  }

  function beginAddAvailability(dayIndex, daySlots) {
    const activeWindows = daySlots
      .filter((slot) => slot.isAvailable)
      .sort((left, right) => left.endTime.localeCompare(right.endTime))
    const lastEnd = activeWindows.at(-1)?.endTime?.slice(0, 5)
    const start = lastEnd ?? '09:00'
    const [hours, minutes] = start.split(':').map(Number)
    const endMinutes = Math.min(hours * 60 + minutes + (lastEnd ? 120 : 480), 1439)
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
    setDayOfWeek(String(dayIndex))
    setStartTime(start)
    setEndTime(end)
    setEditingAvailabilityId(null)
    setAvailabilityEditorDay(String(dayIndex))
    setExpandedScheduleDay(String(dayIndex))
    setErrorMessage('')
  }

  function beginEditAvailability(slot) {
    setDayOfWeek(String(slot.dayOfWeek))
    setStartTime(slot.startTime.slice(0, 5))
    setEndTime(slot.endTime.slice(0, 5))
    setEditingAvailabilityId(slot.id)
    setAvailabilityEditorDay(String(slot.dayOfWeek))
    setExpandedScheduleDay(String(slot.dayOfWeek))
    setErrorMessage('')
  }

  async function toggleAvailability(slot) {
    setErrorMessage('')
    try {
      await updateAvailability(slot.id, {
        dayOfWeek: slot.dayOfWeek,
        specificDate: slot.specificDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !slot.isAvailable,
      })
      await loadDashboard()
      notify.success(slot.isAvailable ? 'This shift is now paused.' : 'This shift is available again.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not update this shift.')
    }
  }

  async function handleSubmitForVerification() {
    setErrorMessage('')
    try {
      await submitForVerification()
      await loadDashboard()
      notify.success('Your profile has been submitted for verification.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not submit your profile for verification.')
    }
  }

  if (loading) return <div className="container py-5" role="status">Loading professional dashboard…</div>

  const incoming = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(bookingStatus(booking.status)))
  const pendingCount = bookings.filter((booking) => bookingStatus(booking.status) === 'Pending').length
  const weeklyAvailability = availability.filter((slot) => slot.specificDate == null)
  const dateOverrides = availability.filter((slot) => slot.specificDate != null)

  return (
    <div className="container-fluid px-3 px-lg-5 py-5">
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
      {profile && profileStatus(profile.verificationStatus) === 'Pending' && (
        <div className="alert alert-warning d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3" role="status">
          <span>Your profile is pending Admin verification and won’t appear publicly until it is approved.</span>
          <button className="btn btn-outline-primary align-self-start align-self-sm-auto" type="button" onClick={handleSubmitForVerification}>
            Submit for verification
          </button>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Active bookings</span><strong className="d-block fs-3">{incoming.length}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Pending requests</span><strong className="d-block fs-3">{pendingCount}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Active work shifts</span><strong className="d-block fs-3">{weeklyAvailability.filter((slot) => slot.isAvailable).length}</strong></div></div>
        <div className="col-6 col-lg-3"><div className="glass-card rounded-2xl p-4"><span className="text-on-surface-variant">Services</span><strong className="d-block fs-3">{profile?.services?.length ?? 0}</strong></div></div>
      </div>

      <div className="row g-4 align-items-start">
        <section className="col-12">
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

        {bookings.some((booking) => refundStatus(booking.refundStatus) === 'Requested' || refundStatus(booking.refundStatus) === 'Refunded') && (
          <div className="col-12 d-flex flex-column gap-4">
          {bookings.some((booking) => refundStatus(booking.refundStatus) === 'Requested') && (
            <section className="glass-card rounded-2xl p-4">
              <h2 className="h5">Refund requests</h2>
              <p className="small text-on-surface-variant">
                Process the refund through your eSewa merchant account first. Once eSewa updates the transaction, check its status here.{' '}
                <a href="https://developer.esewa.com.np/pages/Epay" target="_blank" rel="noreferrer">About eSewa refund statuses</a>
              </p>
              <div className="row g-3">
                {bookings
                  .filter((booking) => refundStatus(booking.refundStatus) === 'Requested')
                  .map((booking) => (
                    <div className="col-12 col-md-6 col-xxl-4" key={booking.id}>
                      <article className="glass-card rounded-2xl p-3 h-100">
                        <strong className="d-block">{booking.customerName} · {booking.service?.name ?? 'Service booking'}</strong>
                        <span className="small text-on-surface-variant d-block mt-1">
                          Booking #{booking.id} · Full refund: {booking.refundAmount} · Requested {new Date(booking.refundRequestedAt).toLocaleString()}
                        </span>
                        <button
                          className="btn btn-sm btn-primary mt-3"
                          type="button"
                          onClick={() => handleVerifyRefund(booking.id)}
                          disabled={verifyingRefundId === booking.id}
                        >
                          {verifyingRefundId === booking.id ? 'Checking eSewa…' : 'Check refund status'}
                        </button>
                      </article>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {bookings.some((booking) => refundStatus(booking.refundStatus) === 'Refunded') && (
            <section className="glass-card rounded-2xl p-4">
              <h2 className="h5">Completed refunds</h2>
              <div className="row g-3">
                {bookings
                  .filter((booking) => refundStatus(booking.refundStatus) === 'Refunded')
                  .map((booking) => (
                    <div className="col-12 col-md-6 col-xxl-4" key={booking.id}>
                      <article className="glass-card rounded-2xl p-3 h-100">
                        <strong className="d-block">{booking.customerName} · {booking.service?.name ?? 'Service booking'}</strong>
                        <span className="small text-on-surface-variant">
                          Booking #{booking.id} · Refunded {booking.refundAmount} · eSewa reference {booking.refundGatewayReference}
                        </span>
                      </article>
                    </div>
                  ))}
              </div>
            </section>
          )}
          </div>
        )}

          <section className="col-12 col-xl-6">
            <div className="glass-card rounded-2xl p-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
              <div>
                <h2 className="h5 mb-1">Weekly working hours</h2>
                <p className="small text-on-surface-variant mb-0">Set your regular shifts. Customers see bookable start times that fit each service.</p>
              </div>
              <span className="material-symbols-outlined text-secondary" aria-hidden="true">calendar_month</span>
            </div>
            <div className="professional-weekly-schedule mt-3">
              {weekDays.map((day, dayIndex) => {
                const daySlots = weeklyAvailability
                  .filter((slot) => Number(slot.dayOfWeek) === dayIndex)
                  .sort((left, right) => left.startTime.localeCompare(right.startTime))
                const isEditingThisDay = availabilityEditorDay === String(dayIndex)
                const isExpanded = expandedScheduleDay === String(dayIndex)
                const hasActiveWindow = daySlots.some((slot) => slot.isAvailable)
                return (
                  <article className={`professional-schedule-day${isExpanded ? ' professional-schedule-day--expanded' : ''}`} key={day}>
                    <div className="professional-schedule-day-heading">
                      <div>
                        <strong>{day}</strong>
                        <span className={`professional-day-status${hasActiveWindow ? ' professional-day-status--open' : ''}`}>
                          {hasActiveWindow ? 'Open' : 'Day off'}
                        </span>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedScheduleDay(null)
                            setAvailabilityEditorDay(null)
                            setEditingAvailabilityId(null)
                          } else {
                            setExpandedScheduleDay(String(dayIndex))
                          }
                        }}
                      >
                        {isExpanded ? 'Done' : daySlots.length ? 'Manage' : 'Set hours'}
                      </button>
                    </div>
                    {daySlots.length > 0 ? (
                      <div className="professional-shift-summary">
                        {daySlots.map((slot) => (
                          <span className={`professional-shift-chip${slot.isAvailable ? '' : ' professional-shift-chip--paused'}`} key={slot.id}>
                            {!slot.isAvailable && <span className="material-symbols-outlined" aria-hidden="true">pause</span>}
                            {formatTime12Hour(slot.startTime)}–{formatTime12Hour(slot.endTime)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="professional-day-empty">No hours</p>
                    )}
                    {isExpanded && (
                      <div className="professional-day-details">
                        {daySlots.length > 0 && (
                          <div className="professional-shift-list">
                            {daySlots.map((slot) => (
                              <div className={`professional-shift${slot.isAvailable ? '' : ' professional-shift--paused'}`} key={slot.id}>
                                <div className="professional-shift-time">
                                  <span className="material-symbols-outlined" aria-hidden="true">{slot.isAvailable ? 'schedule' : 'pause_circle'}</span>
                                  <span>{formatTime12Hour(slot.startTime)}–{formatTime12Hour(slot.endTime)}</span>
                                  {!slot.isAvailable && <small>Paused</small>}
                                </div>
                                <div className="professional-shift-actions">
                                  <button className="btn btn-sm btn-light" type="button" onClick={() => beginEditAvailability(slot)}>Edit</button>
                                  <button className="btn btn-sm btn-light" type="button" onClick={() => toggleAvailability(slot)}>
                                    {slot.isAvailable ? 'Pause' : 'Open'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!isEditingThisDay && (
                          <button className="btn btn-sm btn-outline-primary mt-2" type="button" onClick={() => beginAddAvailability(dayIndex, daySlots)}>
                            <span className="material-symbols-outlined" aria-hidden="true">add</span>
                            Add shift
                          </button>
                        )}
                      </div>
                    )}
                    {isEditingThisDay && (
                      <form className="professional-hours-editor" onSubmit={handleAvailability}>
                        <span className="small fw-semibold">{editingAvailabilityId !== null ? 'Update this shift' : `Add a shift on ${day}`}</span>
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small mb-1" htmlFor={`availability-start-${dayIndex}`}>Starts</label>
                            <input id={`availability-start-${dayIndex}`} className="form-control form-control-sm" type="time" required value={startTime} onChange={(event) => setStartTime(event.target.value)} />
                          </div>
                          <div className="col-6">
                            <label className="form-label small mb-1" htmlFor={`availability-end-${dayIndex}`}>Ends</label>
                            <input id={`availability-end-${dayIndex}`} className="form-control form-control-sm" type="time" required value={endTime} onChange={(event) => setEndTime(event.target.value)} />
                          </div>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-sm btn-primary" type="submit">{editingAvailabilityId !== null ? 'Save shift' : 'Add shift'}</button>
                          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => {
                            setAvailabilityEditorDay(null)
                            setEditingAvailabilityId(null)
                          }}>Cancel</button>
                        </div>
                      </form>
                    )}
                  </article>
                )
              })}
            </div>
            {dateOverrides.length > 0 && (
              <div className="professional-date-overrides mt-3">
                <h3 className="small fw-bold mb-2">Date-specific hours</h3>
                {dateOverrides.map((slot) => (
                  <div className="professional-date-override" key={slot.id}>
                    <span>{slot.specificDate} · {formatTime12Hour(slot.startTime)}–{formatTime12Hour(slot.endTime)}</span>
                    <span className={slot.isAvailable ? 'text-success' : 'text-secondary'}>
                      {slot.isAvailable ? 'Extra hours' : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            </div>
          </section>

          <section className="col-12 col-xl-6">
            <div className="glass-card rounded-2xl p-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h2 className="h5 mb-1">Services</h2>
                <p className="small text-on-surface-variant mb-0">Your current offerings</p>
              </div>
              <Link className="btn btn-sm btn-outline-primary text-nowrap" to="/dashboard/professional/studio">Manage services</Link>
            </div>
            {profile?.services?.length ? (
              <div className="professional-service-list mb-3">
                {profile.services.map((service) => (
                  <article className="professional-service-card" key={service.id}>
                    <span className="professional-service-icon material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                    <div className="professional-service-content">
                      <div className="professional-service-heading">
                        <strong>{service.name}</strong>
                        <span className="professional-service-category">{service.category}</span>
                      </div>
                      {service.description && <p>{service.description}</p>}
                      <div className="professional-service-meta">
                        <strong>{service.price}</strong>
                        <span><span className="material-symbols-outlined" aria-hidden="true">schedule</span>{service.durationMinutes} min</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : <p className="small text-on-surface-variant">No services are listed yet. Create your first one in your studio profile.</p>}
            </div>
          </section>
      </div>
    </div>
  )
}
