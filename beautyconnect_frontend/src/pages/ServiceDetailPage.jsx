import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAssetUrl } from '../api/assets'
import { getReviewAvatarUrl, getReviewsForProfessional } from '../api/review'
import { getProfessionalById } from '../api/search'
import { useAuth } from '../auth/useAuth'
import RatingStars from '../components/RatingStars'
import { formatNpr } from '../utils/currency'
import './ServiceDetailPage.css'

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status

export default function ServiceDetailPage() {
  const { id, serviceId } = useParams()
  const { user } = useAuth()
  const [professional, setProfessional] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loadedProfileId, setLoadedProfileId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [reviewError, setReviewError] = useState('')

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
  const serviceReviews = useMemo(() => {
    if (!service) return []
    const serviceName = service.name.trim().toLocaleLowerCase()
    return reviews.filter((review) => review.serviceName?.trim().toLocaleLowerCase() === serviceName)
  }, [reviews, service])
  const averageRating = serviceReviews.length
    ? serviceReviews.reduce((total, review) => total + Number(review.rating), 0) / serviceReviews.length
    : 0

  if (loading || loadedProfileId !== id) {
    return <div className="container py-5" role="status">Loading service details…</div>
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
          <strong>{formatNpr(service.price)}</strong>
          <span>{service.durationMinutes} minutes</span>
          {service.durationMinutes >= 1440 ? (
            <p className="small text-danger mt-3 mb-0">
              This service cannot be booked online because its duration is 24 hours or longer.
            </p>
          ) : (
            <Link
              className="btn btn-primary mt-3"
              to={`/artist/${professional.id}?serviceId=${service.id}#appointments`}
            >
              Check availability
            </Link>
          )}
        </div>
      </header>

      <section className="service-detail-content" aria-label="Service information">
        <div className="service-detail-main">
          <article className="glass-card rounded-2xl p-4 p-md-5">
            <h2 className="h4 mb-3">About this service</h2>
            <p className="mb-0">{service.description || 'Contact the professional for more information about this service.'}</p>
          </article>

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
            {professional.bio && <p className="mb-0">{professional.bio}</p>}
            <Link className="btn btn-outline-primary w-100 mt-3" to={`/artist/${professional.id}`}>
              View all services
            </Link>
          </section>
        </aside>
      </section>

      <section className="service-detail-reviews" aria-labelledby="service-reviews-heading">
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
  )
}
