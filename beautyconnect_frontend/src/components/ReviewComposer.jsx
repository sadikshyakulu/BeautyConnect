import { Fragment, useEffect, useRef, useState } from 'react'
import { getAssetUrl } from '../api/assets'
import { createReview } from '../api/review'
import { notify } from '../utils/notifications'
import './ReviewComposer.css'

export default function ReviewComposer({ booking, professionalAvatarUrl, onCancel, onSubmitted }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)
  const professionalInitial = booking.professionalBusinessName?.trim().charAt(0).toLocaleUpperCase() || 'P'

  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    formRef.current?.focus({ preventScroll: true })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await createReview({ bookingId: booking.id, rating, comment })
      notify.success('Your review was submitted.')
      onSubmitted(booking.id)
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="review-composer" ref={formRef} tabIndex="-1" aria-labelledby={`review-heading-${booking.id}`}>
      <header className="review-composer-header">
        <div className="review-composer-avatar">
          <span aria-hidden="true">{professionalInitial}</span>
          {professionalAvatarUrl && (
            <img
              src={getAssetUrl(professionalAvatarUrl)}
              alt={`${booking.professionalBusinessName ?? 'Professional'} avatar`}
              onError={(event) => { event.currentTarget.hidden = true }}
            />
          )}
        </div>
        <div className="review-composer-title">
          <h3 id={`review-heading-${booking.id}`}>How was your experience?</h3>
          <p>{booking.service?.name ?? booking.professionalBusinessName ?? 'Share your feedback'}</p>
        </div>
        <button
          type="button"
          className="review-composer-close"
          onClick={onCancel}
          aria-label="Close review form"
          disabled={submitting}
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </header>

      <form onSubmit={handleSubmit}>
        <fieldset className="review-composer-rating-field">
          <legend>Rate your appointment</legend>
          <div className="review-composer-rating" role="radiogroup" aria-label="Choose a rating from one to five stars">
            {[5, 4, 3, 2, 1].map((value) => (
              <Fragment key={value}>
                <input
                  id={`review-rating-${booking.id}-${value}`}
                  name={`review-rating-${booking.id}`}
                  type="radio"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                />
                <label htmlFor={`review-rating-${booking.id}-${value}`} title={`${value} ${value === 1 ? 'star' : 'stars'}`} aria-hidden="true" />
              </Fragment>
            ))}
          </div>
        </fieldset>

        <label className="review-composer-comment-label" htmlFor={`review-comment-${booking.id}`}>
          Tell us a little more <span>(required)</span>
        </label>
        <textarea
          id={`review-comment-${booking.id}`}
          className="form-control review-composer-comment"
          maxLength="2000"
          minLength="3"
          placeholder="What did you enjoy about your appointment?"
          required
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <div className="review-composer-footer">
          <span>{comment.length}/2000 characters</span>
          <div className="review-composer-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || comment.trim().length < 3}>
              <span className="material-symbols-outlined" aria-hidden="true">send</span>
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </div>
      </form>
    </section>
  )
}
