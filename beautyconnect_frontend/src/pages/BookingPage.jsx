import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { initiatePayment, refreshPayment } from '../api/payment'
import { getProfessionalById } from '../api/search'

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
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const paymentFormRef = useRef(null)
  const submitRefreshedPaymentRef = useRef(false)

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

  async function handleBooking(event) {
    event.preventDefault()
    if (!service || !hasValidScheduledTime) {
      setErrorMessage('The selected service or appointment time is no longer available. Please choose another slot.')
      return
    }
    if (Date.parse(scheduledDateTime) <= Date.now()) {
      setErrorMessage('This appointment time has passed. Go back to the professional profile and choose another available time.')
      return
    }

    setSubmitting(true)
    setErrorMessage('')
    try {
      const paymentForm = await initiatePayment({
        serviceId,
        scheduledDateTime,
        notes: notes.trim() || null,
      })
      setPayment(paymentForm)
    } catch (error) {
      setErrorMessage(
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
      setErrorMessage(
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

  if (loading) return <div className="container py-5" role="status">Loading booking details…</div>

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
    <section className="container py-5">
      <Link to={`/artist/${professionalId}`}>← Back to profile</Link>
      <div className="glass-card rounded-2xl p-4 p-md-5 mt-3 mx-auto" style={{ maxWidth: 760 }}>
        <h1 className="font-headline mb-4">{payment ? 'Complete payment' : 'Confirm your appointment'}</h1>

        {!payment ? (
          <>
            <div className="mb-4">
              <h2 className="h4">{professional?.businessName}</h2>
              <p className="mb-1">{service?.name ?? 'Selected service'}</p>
              {service && <p className="text-on-surface-variant">{service.durationMinutes} minutes · {service.price}</p>}
              <p className="mb-0">{hasValidScheduledTime ? new Date(scheduledDateTime).toLocaleString() : 'No appointment time selected'}</p>
            </div>
            {hasValidScheduledTime && appointmentHasPassed && (
              <div className="alert alert-warning" role="alert">
                This appointment time has passed. <Link to={`/artist/${professionalId}`}>Return to the professional profile</Link> and choose another available time.
              </div>
            )}
            {!service && <div className="alert alert-warning" role="alert">The selected service is not available in this profile.</div>}
            <form onSubmit={handleBooking}>
              <label className="form-label" htmlFor="booking-notes">Notes for the professional (optional)</label>
              <textarea id="booking-notes" className="form-control mb-3" rows="4" maxLength="2000" value={notes} onChange={(event) => setNotes(event.target.value)} />
              {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
              <button className="btn btn-primary" type="submit" disabled={!service || !hasValidScheduledTime || appointmentHasPassed || submitting}>
                {submitting ? 'Preparing payment…' : 'Continue to payment'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="alert alert-success" role="status">
              No booking has been created yet. Your appointment will be confirmed only after eSewa verifies successful payment.
            </div>
            <p>{service?.name} · {payment.total_amount}</p>
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
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Refreshing payment…' : 'Continue to eSewa'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
