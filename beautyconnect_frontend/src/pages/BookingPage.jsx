import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { initiatePayment, refreshPayment } from '../api/payment'
import { getAssetUrl } from '../api/assets'
import { getProfessionalById } from '../api/search'
import './BookingPage.css'
import LoadingState from '../components/LoadingState'
import LocationPicker from '../components/LocationPicker'
import MoneyAmount from '../components/MoneyAmount'
import { notify } from '../utils/notifications'

function EsewaLogo({ compact = false }) {
  return (
    <span className={`booking-esewa-logo${compact ? ' booking-esewa-logo--compact' : ''}`} aria-label="eSewa">
      <img src="/esewa.png" alt="" />
      <span>Sewa</span>
    </span>
  )
}

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const serviceId = Number(searchParams.get('serviceId'))
  const professionalId = Number(searchParams.get('professionalProfileId'))
  const scheduledDateTime = searchParams.get('scheduledDateTime') ?? ''
  const hasValidScheduledTime = Number.isFinite(Date.parse(scheduledDateTime))
  const [appointmentHasPassed, setAppointmentHasPassed] = useState(false)
  const hasValidIds = Number.isInteger(serviceId) && serviceId > 0 &&
    Number.isInteger(professionalId) && professionalId > 0
  const [professional, setProfessional] = useState(null)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState({
    addressLine: '',
    city: '',
    landmark: '',
    latitude: null,
    longitude: null,
    contactPhone: '',
  })
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const paymentFormRef = useRef(null)
  const submitRefreshedPaymentRef = useRef(false)
  const updateLocation = useCallback((updates) => {
    setLocation((current) => ({ ...current, ...updates }))
  }, [])

  useEffect(() => {
    if (!hasValidScheduledTime) {
      return undefined
    }

    const updateAppointmentStatus = () => {
      setAppointmentHasPassed(Date.parse(scheduledDateTime) <= Date.now())
    }
    const initialCheck = window.setTimeout(updateAppointmentStatus, 0)
    const interval = window.setInterval(updateAppointmentStatus, 30_000)
    return () => {
      window.clearTimeout(initialCheck)
      window.clearInterval(interval)
    }
  }, [hasValidScheduledTime, scheduledDateTime])

  useEffect(() => {
    if (submitRefreshedPaymentRef.current && paymentFormRef.current) {
      paymentFormRef.current.requestSubmit()
    }
  }, [payment])

  useEffect(() => {
    let active = true
    if (!hasValidIds) return undefined

    getProfessionalById(professionalId)
      .then((result) => {
        if (active) setProfessional(result)
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error.response?.data?.message ?? 'Could not load the selected service.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [serviceId, professionalId, hasValidIds])

  const service = professional?.matchingServices?.find((item) => item.id === serviceId)
  const serviceImage = service?.images?.find(Boolean)
    || professional?.portfolioImages?.find(Boolean)
    || professional?.avatarUrl
  const addressLength = location.addressLine.trim().length
  const cityLength = location.city.trim().length
  const phone = location.contactPhone.trim()
  const phoneDigits = phone.replace(/\D/g, '').length
  const isAddressValid = addressLength >= 5 && addressLength <= 300
  const isCityValid = cityLength >= 2 && cityLength <= 100
  const hasValidCoordinates = Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
    && !(location.latitude === 0 && location.longitude === 0)
    && location.latitude >= 26.3
    && location.latitude <= 30.5
    && location.longitude >= 80
    && location.longitude <= 88.3
  const isPhoneValid = phone.length <= 30
    && /^[\d+\s-]+$/.test(phone)
    && phoneDigits >= 7
    && phoneDigits <= 15
  const isLocationValid = isAddressValid
    && isCityValid
    && hasValidCoordinates
    && isPhoneValid

  function getLocationValidationMessage() {
    if (!isAddressValid) return 'Address must be between 5 and 300 characters.'
    if (!isCityValid) return 'City must be between 2 and 100 characters.'
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      return 'Choose the service location on the map.'
    }
    if (location.latitude === 0 && location.longitude === 0) return 'The selected coordinates are not valid.'
    if (!hasValidCoordinates) return 'Choose a location within Nepal.'
    if (!phone || phone.length > 30 || !/^[\d+\s-]+$/.test(phone) || phoneDigits < 7 || phoneDigits > 15) {
      return 'Enter a contact phone with 7 to 15 digits.'
    }
    return ''
  }

  function getCoordinateValidationMessage() {
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
      return 'Choose the service location on the map.'
    }
    if (location.latitude === 0 && location.longitude === 0) return 'The selected coordinates are not valid.'
    return 'Choose a location within Nepal.'
  }

  async function handleBooking(event) {
    event.preventDefault()
    if (!service || !hasValidScheduledTime) {
      notify.error('The selected service or appointment time is no longer available. Please choose another slot.')
      return
    }
    if (Date.parse(scheduledDateTime) <= Date.now()) {
      notify.error('This appointment time has passed. Go back to the professional profile and choose another available time.')
      return
    }
    if (!isLocationValid) {
      notify.error(getLocationValidationMessage())
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      const paymentForm = await initiatePayment({
        serviceId,
        scheduledDateTime,
        notes: notes.trim() || null,
        location: {
          addressLine: location.addressLine.trim(),
          city: location.city.trim(),
          landmark: location.landmark.trim() || null,
          latitude: location.latitude,
          longitude: location.longitude,
          contactPhone: phone,
        },
      })
      setPayment(paymentForm)
    } catch (error) {
      notify.error(
        error.response?.data?.message ??
        'Could not prepare payment. No booking has been created. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePaymentFormSubmit(event) {
    if (submitRefreshedPaymentRef.current) {
      submitRefreshedPaymentRef.current = false
      logPaymentFormSubmission(event)
      return
    }

    event.preventDefault()
    if (!payment?.transaction_uuid) return

    setSubmitting(true)
    setErrorMessage('')
    try {
      const refreshedPayment = await refreshPayment(payment.transaction_uuid)
      submitRefreshedPaymentRef.current = true
      setPayment(refreshedPayment)
    } catch (error) {
      notify.error(
        error.response?.data?.message ??
        'Could not refresh the eSewa payment. Choose the appointment again and retry.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  function logPaymentFormSubmission(event) {
    if (!import.meta.env.DEV) return

    const formData = new FormData(event.currentTarget)
    const formValues = Object.fromEntries(formData.entries())
    const signedFieldNames = String(formValues.signed_field_names ?? '').split(',')
    const signatureMessage = signedFieldNames
      .map((fieldName) => `${fieldName}=${formValues[fieldName] ?? ''}`)
      .join(',')

    console.info('eSewa form POST payload', formValues)
    console.info(`eSewa form signature message: [[[${signatureMessage}]]]`)
    console.info('eSewa form signature message character codes', Array.from(
      signatureMessage,
      (character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
    ))
  }

  if (loading) return <div className="container py-5"><LoadingState label="Loading booking details…" /></div>

  if (!hasValidIds) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">Booking details are missing. Choose a service and available time from a professional profile.</div>
        <Link to="/search">Browse professionals</Link>
      </div>
    )
  }

  if (errorMessage && !payment) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">{errorMessage}</div>
        <Link to="/search">Browse professionals</Link>
      </div>
    )
  }

  return (
    <section className="container py-5 booking-checkout">
      {!payment ? (
        <>
          <header className="booking-checkout-heading">
            <p className="booking-checkout-eyebrow">One last step</p>
            <h1 className="font-headline">Confirm your appointment</h1>
            <p className="booking-checkout-subtitle">
              Add your service address, then continue securely to <EsewaLogo compact />.
            </p>
          </header>
          <ol className="booking-checkout-stepper" aria-label="Booking progress">
            <li className="booking-checkout-step booking-checkout-step--complete">
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
              <span><strong>Service &amp; time</strong><small>Selected</small></span>
            </li>
            <li className="booking-checkout-step booking-checkout-step--active" aria-current="step">
              <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
              <span><strong>Details &amp; location</strong><small>Current step</small></span>
            </li>
            <li className="booking-checkout-step">
              <span className="material-symbols-outlined" aria-hidden="true">payments</span>
              <span><strong>Payment</strong><small><EsewaLogo compact /></small></span>
            </li>
          </ol>
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-7">
              <div className="glass-card rounded-2xl p-3 p-md-4 booking-form-card">
                <header className="booking-professional-heading">
                  <span className="booking-professional-avatar">
                    <span aria-hidden="true">{professional?.businessName?.trim()?.charAt(0)?.toLocaleUpperCase() || '?'}</span>
                    {professional?.avatarUrl && (
                      <img
                        src={getAssetUrl(professional.avatarUrl)}
                        alt={`${professional?.businessName ?? 'Professional'} profile`}
                        onError={(event) => { event.currentTarget.hidden = true }}
                      />
                    )}
                  </span>
                  <div>
                    <p className="booking-checkout-eyebrow mb-1">Your beauty professional</p>
                    <h2 className="h5 mb-0">{professional?.businessName}</h2>
                  </div>
                </header>
                {hasValidScheduledTime && appointmentHasPassed && (
                  <div className="alert alert-warning" role="alert">
                    This appointment time has passed. <Link to={`/artist/${professionalId}`}>Return to the professional profile</Link> and choose another available time.
                  </div>
                )}
                {!service && <div className="alert alert-warning" role="alert">The selected service is not available in this profile.</div>}
                <form onSubmit={handleBooking}>
                  <section className="booking-location-section mb-4" aria-labelledby="service-location-heading">
                    <header className="booking-location-heading">
                      <span className="booking-location-heading-icon material-symbols-outlined" aria-hidden="true">location_on</span>
                      <div>
                        <p className="booking-checkout-eyebrow mb-1">Where should we meet?</p>
                        <h3 id="service-location-heading" className="h5 mb-1">Service location</h3>
                        <p className="small text-on-surface-variant mb-0">Your professional travels to you. Choose the address for this appointment.</p>
                      </div>
                      <span className="booking-required-badge">Required</span>
                    </header>
                    <LocationPicker location={location} onChange={updateLocation} />
                    <div className="booking-address-fields row g-3 mt-1">
                      <div className="col-12">
                        <label className="form-label" htmlFor="booking-address">Street address</label>
                        <input
                          id="booking-address"
                          type="text"
                          required
                          minLength="5"
                          maxLength="300"
                          autoComplete="street-address"
                          value={location.addressLine}
                          aria-invalid={!isAddressValid}
                          aria-describedby={!isAddressValid ? 'booking-address-error' : undefined}
                          className={`form-control${!isAddressValid ? ' booking-field-invalid' : ''}`}
                          onChange={(event) => updateLocation({ addressLine: event.target.value })}
                        />
                        {!isAddressValid && (
                          <p id="booking-address-error" className="booking-field-error" role="alert">
                            <span className="material-symbols-outlined" aria-hidden="true">error</span>
                            Address must be between 5 and 300 characters.
                          </p>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="booking-city">City</label>
                        <input
                          id="booking-city"
                          type="text"
                          required
                          minLength="2"
                          maxLength="100"
                          autoComplete="address-level2"
                          value={location.city}
                          aria-invalid={!isCityValid}
                          aria-describedby={!isCityValid ? 'booking-city-error' : undefined}
                          className={`form-control${!isCityValid ? ' booking-field-invalid' : ''}`}
                          onChange={(event) => updateLocation({ city: event.target.value })}
                        />
                        {!isCityValid && (
                          <p id="booking-city-error" className="booking-field-error" role="alert">
                            <span className="material-symbols-outlined" aria-hidden="true">error</span>
                            City must be between 2 and 100 characters.
                          </p>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label" htmlFor="booking-phone">Contact phone</label>
                        <input
                          id="booking-phone"
                          type="tel"
                          required
                          maxLength="30"
                          pattern="[0-9+ -]+"
                          autoComplete="tel"
                          value={location.contactPhone}
                          aria-invalid={!isPhoneValid}
                          aria-describedby={!isPhoneValid ? 'booking-phone-error' : undefined}
                          className={`form-control${!isPhoneValid ? ' booking-field-invalid' : ''}`}
                          onChange={(event) => updateLocation({ contactPhone: event.target.value })}
                        />
                        {!isPhoneValid && (
                          <p id="booking-phone-error" className="booking-field-error" role="alert">
                            <span className="material-symbols-outlined" aria-hidden="true">error</span>
                            Enter a contact phone with 7 to 15 digits.
                          </p>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label" htmlFor="booking-landmark">Landmark / arrival directions (optional)</label>
                        <textarea
                          id="booking-landmark"
                          className="form-control"
                          rows="2"
                          maxLength="500"
                          value={location.landmark}
                          onChange={(event) => updateLocation({ landmark: event.target.value })}
                        />
                      </div>
                    </div>
                    {!hasValidCoordinates && (
                      <p className="booking-field-error booking-coordinate-error" role="alert">
                        <span className="material-symbols-outlined" aria-hidden="true">error</span>
                        {getCoordinateValidationMessage()}
                      </p>
                    )}
                  </section>
                  <div className="booking-notes-section">
                    <label className="form-label" htmlFor="booking-notes">
                      <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                      Notes for the professional <span>(optional)</span>
                    </label>
                    <textarea id="booking-notes" className="form-control mb-3" rows="3" maxLength="2000" placeholder="Anything they should know before arriving?" value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </div>
                  {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                  <button className="btn btn-primary booking-continue-button" type="submit" disabled={!service || !hasValidScheduledTime || appointmentHasPassed || !isLocationValid || submitting}>
                    <span className="material-symbols-outlined" aria-hidden="true">{submitting ? 'progress_activity' : 'lock'}</span>
                    {submitting ? 'Preparing secure payment…' : 'Continue to secure payment'}
                    {!submitting && <span className="material-symbols-outlined booking-continue-arrow" aria-hidden="true">arrow_forward</span>}
                  </button>
                  <p className="booking-secure-note">
                    <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
                    Your booking is confirmed only after <EsewaLogo compact /> verifies payment.
                  </p>
                </form>
              </div>
            </div>
            <aside className="col-12 col-lg-5">
              <div className="glass-card rounded-2xl p-4 booking-summary-card">
                <header className="booking-summary-heading">
                  <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
                  <div>
                    <p className="booking-checkout-eyebrow mb-1">Review before payment</p>
                    <h2 className="h5 mb-0">Appointment summary</h2>
                  </div>
                </header>
                <div className="booking-summary-service">
                  <div className="booking-summary-service-image">
                    <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                    {serviceImage && (
                      <img
                        src={getAssetUrl(serviceImage)}
                        alt={`${service?.name ?? 'Booked'} service`}
                        onError={(event) => { event.currentTarget.hidden = true }}
                      />
                    )}
                  </div>
                  <div className="booking-summary-service-copy">
                    <p className="booking-summary-service-name">{service?.name ?? 'Selected service'}</p>
                    <p className="booking-summary-service-professional">{professional?.businessName}</p>
                    {service?.category && <span className="booking-summary-service-category">{service.category}</span>}
                  </div>
                </div>
                <div className="booking-summary-appointment">
                  <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                  <div>
                    <small>Appointment time</small>
                    <strong>{hasValidScheduledTime ? new Date(scheduledDateTime).toLocaleString() : 'No appointment time selected'}</strong>
                  </div>
                </div>
                <div className="booking-summary-total">
                  <span>Total</span>
                  {service ? <strong><MoneyAmount value={service.price} /></strong> : <strong>—</strong>}
                </div>
                <div className="booking-summary-address">
                  <h3 className="h6">
                    <span className="material-symbols-outlined" aria-hidden="true">place</span>
                    Service address
                  </h3>
                  <p className={location.addressLine.trim() ? '' : 'booking-summary-address-empty'}>
                    {location.addressLine.trim() || 'Your selected address will appear here'}
                  </p>
                  {location.city.trim() && <span>{location.city.trim()}</span>}
                  {!location.addressLine.trim() && (
                    <small>Choose a point on the map or search for your address.</small>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
        ) : (
          <div className="booking-payment-card glass-card" aria-labelledby="booking-payment-title">
            <header className="booking-payment-header">
              <span className="booking-payment-icon material-symbols-outlined" aria-hidden="true">payments</span>
              <p className="booking-checkout-eyebrow">Secure checkout</p>
              <h1 id="booking-payment-title">Complete your payment</h1>
              <p>One final step to confirm your appointment.</p>
            </header>
            <div className="booking-payment-notice" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <p>
                <strong>Your booking is not confirmed yet.</strong>
                It will be created after <EsewaLogo compact /> verifies your successful payment.
              </p>
            </div>
            <div className="booking-payment-summary">
              <div className="booking-payment-service-image">
                <span className="material-symbols-outlined" aria-hidden="true">spa</span>
                {serviceImage && (
                  <img
                    src={getAssetUrl(serviceImage)}
                    alt={`${service?.name ?? 'Booked'} service`}
                    onError={(event) => { event.currentTarget.hidden = true }}
                  />
                )}
              </div>
              <div className="booking-payment-service-copy">
                <span>Appointment service</span>
                <strong>{service?.name || 'Selected service'}</strong>
              </div>
              <div className="booking-payment-total">
                <span>Total to pay</span>
                <strong><MoneyAmount value={payment.total_amount} /></strong>
              </div>
            </div>
            {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
            <form
              ref={paymentFormRef}
              action={payment.form_url}
              method="POST"
              onSubmit={handlePaymentFormSubmit}
            >
              <input type="hidden" name="amount" value={payment.amount} />
              <input type="hidden" name="tax_amount" value={payment.tax_amount} />
              <input type="hidden" name="total_amount" value={payment.total_amount} />
              <input type="hidden" name="transaction_uuid" value={payment.transaction_uuid} />
              <input type="hidden" name="product_code" value={payment.product_code} />
              <input type="hidden" name="product_service_charge" value={payment.product_service_charge} />
              <input type="hidden" name="product_delivery_charge" value={payment.product_delivery_charge} />
              <input type="hidden" name="success_url" value={payment.success_url} />
              <input type="hidden" name="failure_url" value={payment.failure_url} />
              <input type="hidden" name="signed_field_names" value={payment.signed_field_names} />
              <input type="hidden" name="signature" value={payment.signature} />
              <button className="btn btn-primary booking-payment-submit" type="submit" disabled={submitting}>
                <span>{submitting ? 'Refreshing payment…' : 'Continue to'}</span>
                {!submitting && <EsewaLogo compact />}
                {!submitting && <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>}
              </button>
            </form>
            <p className="booking-payment-footnote">
              <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              You’ll complete the transaction securely on <EsewaLogo compact />.
            </p>
          </div>
        )}
    </section>
  )
}
