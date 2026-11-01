import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { getAssetUrl } from '../api/assets'
import { verifyBookingRefund } from '../api/payment'
import { useAuth } from '../auth/useAuth'
import BookingLocationDetails from '../components/BookingLocationDetails'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import VerifiedBadge from '../components/VerifiedBadge'
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

function ClockTimePicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selection, setSelection] = useState('hour')
  const [draftTime, setDraftTime] = useState(value)
  useEffect(() => {
    if (!isOpen) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const [hour, minute] = draftTime.split(':').map(Number)
  const hour12 = hour % 12 || 12
  const period = hour >= 12 ? 'PM' : 'AM'
  const selectedValue = selection === 'hour' ? hour12 : minute
  const dialValues = selection === 'hour'
    ? Array.from({ length: 12 }, (_, index) => index + 1)
    : Array.from({ length: 12 }, (_, index) => index * 5)
  const selectedDialIndex = selection === 'hour'
    ? hour12 % 12
    : Math.round(minute / 5) % 12

  function updateTime(nextHour, nextMinute, nextPeriod = period) {
    const hour24 = nextHour % 12 + (nextPeriod === 'PM' ? 12 : 0)
    setDraftTime(`${String(hour24).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`)
  }

  return (
    <div className="professional-time-picker">
      <span className="professional-time-picker-label">{label}</span>
      <button
        className="professional-time-picker-trigger professional-clock-control professional-modal-control"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setSelection('hour')
          setDraftTime(value)
          setIsOpen(true)
        }}
      >
        <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
        <span>{formatTime12Hour(value)}</span>
        <span className="material-symbols-outlined professional-time-picker-trigger-arrow" aria-hidden="true">expand_more</span>
      </button>
      {isOpen && createPortal(
        <div
          className="professional-clock-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <section className="professional-clock-modal" role="dialog" aria-modal="true" aria-label={`Choose ${label.toLowerCase()} time`}>
            <div className="professional-clock-picker-heading">
              <div>
                <span className="professional-clock-modal-eyebrow">Working hours</span>
                <h2>Choose {label.toLowerCase()}</h2>
              </div>
              <button className="professional-clock-control professional-modal-control" type="button" aria-label="Close time picker" onClick={() => setIsOpen(false)}>
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
            <div className="professional-clock-display">
              <button
                className={`professional-clock-control professional-modal-control${selection === 'hour' ? ' is-selected' : ''}`}
                type="button"
                aria-label="Choose hour"
                onClick={() => setSelection('hour')}
              >
                {String(hour12).padStart(2, '0')}
              </button>
              <span>:</span>
              <button
                className={`professional-clock-control professional-modal-control${selection === 'minute' ? ' is-selected' : ''}`}
                type="button"
                aria-label="Choose minute"
                onClick={() => setSelection('minute')}
              >
                {String(minute).padStart(2, '0')}
              </button>
              <div className="professional-clock-period" aria-label="Choose AM or PM">
                {['AM', 'PM'].map((option) => (
                  <button
                    className={`professional-clock-control professional-modal-control${period === option ? ' is-selected' : ''}`}
                    type="button"
                    key={option}
                    aria-pressed={period === option}
                    onClick={() => updateTime(hour12, minute, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="professional-clock-face"
              style={{ '--clock-hand-angle': `${selectedDialIndex * 30}deg` }}
              aria-label={selection === 'hour' ? 'Select an hour' : 'Select minutes'}
            >
              <span className="professional-clock-hand" aria-hidden="true" />
              {dialValues.map((dialValue, index) => {
                const angle = (index * 30 - 90) * Math.PI / 180
                const isSelected = selectedValue === dialValue
                  || (selection === 'minute' && selectedDialIndex === index)
                return (
                  <button
                    className={`professional-clock-control professional-modal-control${isSelected ? ' is-selected' : ''}`}
                    type="button"
                    key={dialValue}
                    style={{
                      left: `${50 + Math.cos(angle) * 39}%`,
                      top: `${50 + Math.sin(angle) * 39}%`,
                    }}
                    aria-label={selection === 'hour' ? `${dialValue} o'clock` : `${dialValue} minutes`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (selection === 'hour') {
                        updateTime(dialValue, minute)
                        setSelection('minute')
                      } else {
                        updateTime(hour12, dialValue)
                      }
                    }}
                  >
                    {selection === 'hour' ? dialValue : String(dialValue).padStart(2, '0')}
                  </button>
                )
              })}
              <span className="professional-clock-center" aria-hidden="true" />
            </div>
            <p className="professional-clock-hint">
              {selection === 'hour' ? 'Select an hour' : 'Select minutes'}
            </p>
            <div className="professional-clock-modal-actions">
              <button className="btn btn-sm btn-outline-secondary professional-clock-control professional-modal-control" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-sm btn-primary professional-clock-control professional-modal-control"
                type="button"
                onClick={() => {
                  onChange(draftTime)
                  setIsOpen(false)
                }}
              >
                Set time
              </button>
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}

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

  useEffect(() => {
    if (availabilityEditorDay === null) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !document.querySelector('.professional-clock-backdrop')) {
        setAvailabilityEditorDay(null)
        setEditingAvailabilityId(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [availabilityEditorDay])

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
      notify.success(<>eSewa confirmed the full refund of <MoneyAmount value={result.refundAmount} />.</>)
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

  if (loading) return <div className="container py-5"><LoadingState label="Loading professional dashboard…" /></div>

  const incoming = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(bookingStatus(booking.status)))
  const cancellationFeedback = bookings.filter((booking) =>
    bookingStatus(booking.status) === 'Cancelled' && booking.cancellationReason,
  )
  const pendingCount = bookings.filter((booking) => bookingStatus(booking.status) === 'Pending').length
  const revenue = bookings.reduce((total, booking) => (
    bookingStatus(booking.status) === 'Completed'
      ? total + Number(booking.totalPrice ?? 0)
      : total
  ), 0)
  const weeklyAvailability = availability.filter((slot) => slot.specificDate == null)
  const dateOverrides = availability.filter((slot) => slot.specificDate != null)

  return (
    <div className="container-fluid px-3 px-lg-5 py-5">
      <header className="professional-dashboard-header mb-4">
        <div className="professional-dashboard-identity">
          <div className="professional-dashboard-avatar">
            {profile?.avatarUrl ? (
              <img src={getAssetUrl(profile.avatarUrl)} alt="" />
            ) : (
              <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
            )}
          </div>
          <div className="professional-dashboard-heading">
            <p className="professional-dashboard-eyebrow">
              <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
              Professional studio
            </p>
            <h1 className="font-headline">
              <span>{profile?.businessName ?? user?.email}</span>
              {profileStatus(profile?.verificationStatus) === 'Approved' && <VerifiedBadge className="verified-badge--large" />}
            </h1>
            <div className="professional-dashboard-meta">
              {profile?.speciality && (
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">palette</span>
                  {profile.speciality}
                </span>
              )}
              {profile?.city && (
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                  {profile.city}
                </span>
              )}
              {profile?.verificationStatus !== undefined && profileStatus(profile.verificationStatus) !== 'Approved' && (
                <span className={`professional-dashboard-verification professional-dashboard-verification--${profileStatus(profile.verificationStatus).toLowerCase()}`}>
                  {profileStatus(profile.verificationStatus)}
                </span>
              )}
            </div>
          </div>
        </div>
        {profile && (
          <Link className="professional-dashboard-profile-link" to={`/artist/${profile.id}`}>
            <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
            <span>View public profile</span>
            <span className="material-symbols-outlined professional-dashboard-profile-arrow" aria-hidden="true">arrow_outward</span>
          </Link>
        )}
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
        <div className="col-6 col-lg-3">
          <div className="glass-card rounded-2xl p-4 professional-dashboard-stat">
            <span className="material-symbols-outlined professional-stat-icon" aria-hidden="true">event_available</span>
            <span className="text-on-surface-variant">Active bookings</span>
            <strong className="d-block fs-3">{incoming.length}</strong>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="glass-card rounded-2xl p-4 professional-dashboard-stat">
            <span className="material-symbols-outlined professional-stat-icon" aria-hidden="true">pending_actions</span>
            <span className="text-on-surface-variant">Pending requests</span>
            <strong className="d-block fs-3">{pendingCount}</strong>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="glass-card rounded-2xl p-4 professional-dashboard-stat">
            <span className="material-symbols-outlined professional-stat-icon" aria-hidden="true">payments</span>
            <span className="text-on-surface-variant">Revenue</span>
            <strong className="d-block fs-3"><MoneyAmount value={revenue} /></strong>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="glass-card rounded-2xl p-4 professional-dashboard-stat">
            <span className="material-symbols-outlined professional-stat-icon" aria-hidden="true">spa</span>
            <span className="text-on-surface-variant">Services</span>
            <strong className="d-block fs-3">{profile?.services?.length ?? 0}</strong>
          </div>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <section className="col-12">
          <div className="glass-card rounded-2xl p-4">
            <header className="professional-incoming-heading">
              <div>
                <p className="professional-incoming-eyebrow mb-1">Client appointments</p>
                <h2 className="h4 mb-1">Incoming bookings</h2>
                <p className="small text-on-surface-variant mb-0">Review appointment details and prepare to travel to the customer.</p>
              </div>
              <span className="professional-incoming-count">{incoming.length} active</span>
            </header>
            {incoming.length === 0 ? (
              <div className="professional-incoming-empty">
                <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
                <p className="text-on-surface-variant mb-0">No active bookings. New customer appointments will appear here.</p>
              </div>
            ) : (
              <div className="professional-incoming-list">
                {incoming.map((booking) => {
                  const status = bookingStatus(booking.status)
                  const customerAvatarUrl = booking.customerAvatarUrl
                    || booking.CustomerAvatarUrl
                    || booking.customerProfile?.avatarUrl
                    || booking.customer?.avatarUrl
                    || booking.customer?.profile?.avatarUrl
                  return (
                    <article className={`professional-booking-card professional-booking-card--${status.toLowerCase()}`} key={booking.id}>
                      <header className="professional-booking-card-header">
                        <div className="professional-booking-service">
                          <div className="professional-booking-service-image">
                            <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                            {booking.service?.images?.[0] && (
                              <img
                                src={getAssetUrl(booking.service.images[0])}
                                alt={`${booking.service.name || 'Booked service'} preview`}
                                onError={(event) => { event.currentTarget.hidden = true }}
                              />
                            )}
                          </div>
                          <div>
                            <p className="professional-booking-kicker mb-1">Service appointment</p>
                            <h3>{booking.service?.name ?? 'Service booking'}</h3>
                            <span className="professional-booking-service-meta">
                              {booking.service?.category}
                              {booking.service?.durationMinutes
                                ? `${booking.service.category ? ' · ' : ''}${booking.service.durationMinutes} min`
                                : ''}
                            </span>
                          </div>
                        </div>
                        <div className="professional-booking-header-tools">
                          <span className={`professional-booking-status professional-booking-status--${status.toLowerCase()}`}>
                            <span className="professional-booking-status-dot" aria-hidden="true" />
                            {status}
                          </span>
                          <div className="professional-booking-actions">
                            {status === 'Pending' && (
                              <>
                                <button className="btn btn-primary" type="button" onClick={() => updateBooking(booking.id, acceptBooking)}>
                                  <span className="material-symbols-outlined" aria-hidden="true">check</span>
                                  Accept
                                </button>
                                <button className="btn btn-outline-danger" type="button" onClick={() => updateBooking(booking.id, rejectBooking)}>
                                  Decline
                                </button>
                              </>
                            )}
                            {status === 'Confirmed' && (
                              <button className="btn btn-outline-primary" type="button" onClick={() => updateBooking(booking.id, completeBooking)}>
                                <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
                                Mark complete
                              </button>
                            )}
                          </div>
                        </div>
                      </header>
                      <div className="professional-booking-card-body">
                        <div className="professional-booking-summary">
                          <section className="professional-booking-client" aria-label="Customer details">
                            <div className="professional-booking-client-avatar">
                              <span aria-hidden="true">
                                {booking.customerName?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CU'}
                              </span>
                              {customerAvatarUrl && (
                                <img
                                  src={getAssetUrl(customerAvatarUrl)}
                                  alt={`${booking.customerName || 'Customer'} profile`}
                                  onError={(event) => { event.currentTarget.hidden = true }}
                                />
                              )}
                            </div>
                            <div className="professional-booking-client-copy">
                              <p className="professional-booking-kicker mb-1">Customer</p>
                              <h4>{booking.customerName || 'BeautyConnect customer'}</h4>
                              {booking.customerEmail && <a href={`mailto:${booking.customerEmail}`}>{booking.customerEmail}</a>}
                            </div>
                          </section>
                          <div className="professional-booking-appointment">
                            <div className="professional-booking-appointment-row">
                              <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                              <span>
                                <small>Appointment</small>
                                <strong>{new Date(booking.scheduledDateTime).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}</strong>
                                <span>{new Date(booking.scheduledDateTime).toLocaleTimeString(undefined, {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}</span>
                              </span>
                            </div>
                            {booking.notes && (
                              <p className="professional-booking-notes">
                                <strong>Customer note:</strong> {booking.notes}
                              </p>
                            )}
                          </div>
                          <div className="professional-booking-total">
                            <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                            <span>
                              <small>Booking total</small>
                              <strong><MoneyAmount value={booking.totalPrice} /></strong>
                            </span>
                          </div>
                        </div>
                        <section className="professional-booking-location" aria-label="Customer service location">
                          <BookingLocationDetails location={booking.location} />
                        </section>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {cancellationFeedback.length > 0 && (
          <section className="col-12">
            <div className="glass-card rounded-2xl p-4">
              <h2 className="h5">Customer cancellation feedback</h2>
              <div className="row g-3">
                {cancellationFeedback.map((booking) => (
                  <div className="col-12 col-md-6 col-xxl-4" key={booking.id}>
                    <article className="border rounded-3 p-3 h-100">
                      <strong className="d-block">{booking.customerName} · {booking.service?.name ?? 'Service booking'}</strong>
                      <span className="small text-on-surface-variant d-block mt-1">
                        {new Date(booking.scheduledDateTime).toLocaleString()}
                      </span>
                      <p className="mb-0 mt-2">{booking.cancellationReason}</p>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

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
                          Booking #{booking.id} · Full refund: <MoneyAmount value={booking.refundAmount} /> · Requested {new Date(booking.refundRequestedAt).toLocaleString()}
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
                          Booking #{booking.id} · Refunded <MoneyAmount value={booking.refundAmount} /> · eSewa reference {booking.refundGatewayReference}
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
                  </article>
                )
              })}
            </div>
            {availabilityEditorDay !== null && createPortal(
              <div
                className="professional-hours-modal-backdrop"
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setAvailabilityEditorDay(null)
                    setEditingAvailabilityId(null)
                  }
                }}
              >
                <form
                  className="professional-hours-editor"
                  onSubmit={handleAvailability}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="professional-hours-modal-title"
                >
                  <div className="professional-hours-modal-heading">
                    <div>
                      <span className="professional-clock-modal-eyebrow">Weekly hours</span>
                      <h2 id="professional-hours-modal-title">
                        {editingAvailabilityId !== null ? 'Update shift' : 'Add a shift'}
                      </h2>
                      <p>{weekDays[Number(availabilityEditorDay)]}</p>
                    </div>
                    <button
                      className="professional-hours-modal-close professional-modal-control"
                      type="button"
                      aria-label="Close shift editor"
                      onClick={() => {
                        setAvailabilityEditorDay(null)
                        setEditingAvailabilityId(null)
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                  </div>
                  <div className="professional-time-picker-grid">
                    <ClockTimePicker label="Starts" value={startTime} onChange={setStartTime} />
                    <ClockTimePicker label="Ends" value={endTime} onChange={setEndTime} />
                  </div>
                  <div className="professional-hours-modal-actions">
                    <button className="btn btn-sm btn-outline-secondary professional-modal-control" type="button" onClick={() => {
                      setAvailabilityEditorDay(null)
                      setEditingAvailabilityId(null)
                    }}>Cancel</button>
                    <button className="btn btn-sm btn-primary professional-modal-control" type="submit">{editingAvailabilityId !== null ? 'Save shift' : 'Add shift'}</button>
                  </div>
                </form>
              </div>,
              document.body,
            )}
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
                  {service.images?.[0] ? (
                    <img
                      className="professional-service-icon professional-service-image"
                      src={getAssetUrl(service.images[0])}
                      alt={`${service.name} service`}
                      loading="lazy"
                    />
                  ) : (
                    <span className="professional-service-icon material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                  )}
                  <div className="professional-service-content">
                      <div className="professional-service-heading">
                        <strong>{service.name}</strong>
                        <span className="professional-service-category">{service.category}</span>
                      </div>
                      {service.description && <p>{service.description}</p>}
                      <div className="professional-service-meta">
                        <strong><MoneyAmount value={service.price} /></strong>
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
