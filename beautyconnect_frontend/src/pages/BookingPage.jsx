import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createBooking } from '../api/booking'
import { initiatePayment } from '../api/payment'
import { getProfessionalById } from '../api/search'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const serviceId = Number(searchParams.get('serviceId'))
  const professionalId = Number(searchParams.get('professionalProfileId'))
  const scheduledDateTime = searchParams.get('scheduledDateTime') ?? ''
  const hasValidScheduledTime = Number.isFinite(Date.parse(scheduledDateTime))
  const hasValidIds = Number.isInteger(serviceId) && serviceId > 0 &&
    Number.isInteger(professionalId) && professionalId > 0
  const [professional, setProfessional] = useState(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

    setSubmitting(true)
    setErrorMessage('')
    try {
      const createdBooking = await createBooking({
        serviceId,
        scheduledDateTime,
        notes: notes.trim() || null,
      })
      setBooking(createdBooking)
      const paymentForm = await initiatePayment(createdBooking.id)
      setPayment(paymentForm)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ??
        'Could not create the booking. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
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

  if (errorMessage && !booking) {
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
        <h1 className="font-headline mb-4">{payment ? 'Complete payment' : 'Confirm your booking'}</h1>

        {!booking ? (
          <>
            <div className="mb-4">
              <h2 className="h4">{professional?.businessName}</h2>
              <p className="mb-1">{service?.name ?? 'Selected service'}</p>
              {service && <p className="text-on-surface-variant">{service.durationMinutes} minutes · {service.price}</p>}
              <p className="mb-0">{hasValidScheduledTime ? new Date(scheduledDateTime).toLocaleString() : 'No appointment time selected'}</p>
            </div>
            {!service && <div className="alert alert-warning" role="alert">The selected service is not available in this profile.</div>}
            <form onSubmit={handleBooking}>
              <label className="form-label" htmlFor="booking-notes">Notes for the professional (optional)</label>
              <textarea id="booking-notes" className="form-control mb-3" rows="4" maxLength="2000" value={notes} onChange={(event) => setNotes(event.target.value)} />
              {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
              <button className="btn btn-primary" type="submit" disabled={!service || !hasValidScheduledTime || submitting}>
                {submitting ? 'Submitting…' : 'Request booking'}
              </button>
            </form>
          </>
        ) : payment ? (
          <>
            <div className="alert alert-success" role="status">
              Booking request #{booking.id} created. Continue to eSewa to complete payment.
            </div>
            <p>{service?.name} · {payment.total_amount}</p>
            <form action={payment.form_url} method="POST">
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
              <button className="btn btn-primary" type="submit">Continue to eSewa</button>
            </form>
          </>
        ) : (
          <>
            <div className="alert alert-warning" role="alert">
              Booking request #{booking.id} was created, but payment setup did not complete. Please contact support before retrying.
            </div>
            {errorMessage && <p role="alert">{errorMessage}</p>}
            <Link className="btn btn-outline-primary" to="/dashboard/customer">View your bookings</Link>
          </>
        )}
      </div>
    </section>
  )
}
