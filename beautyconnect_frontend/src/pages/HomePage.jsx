import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProfessionals } from '../api/search'
import { getAssetUrl } from '../api/assets'
import HeroPortrait from '../components/HeroPortrait'
import RatingStars from '../components/RatingStars'
import { notify } from '../utils/notifications'
import { formatNpr } from '../utils/currency'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const [serviceType, setServiceType] = useState('')
  const [city, setCity] = useState('')
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    getProfessionals({ page: 1, pageSize: 4 })
      .then((response) => {
        if (active) setProfessionals(response.results ?? [])
      })
      .catch((error) => {
        if (active) {
          const message = error.response?.data?.message ?? 'Featured professionals could not be loaded.'
          setErrorMessage(message)
          notify.error(message)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  function submitSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (serviceType.trim()) params.set('serviceType', serviceType.trim())
    if (city.trim()) params.set('city', city.trim())
    navigate(`/search?${params.toString()}`)
  }

  const specialties = [...new Map(
    professionals.flatMap((professional) => {
      const services = professional.matchingServices ?? []
      const offerings = services.length
        ? services.map((service) => ({ service, professional }))
        : professional.speciality
          ? [{ service: null, professional }]
          : []

      return offerings.map(({ service, professional: artist }) => {
        const label = service?.category?.trim() || artist.speciality?.trim() || service?.name?.trim()
        if (!label) return null
        const key = label.toLocaleLowerCase()
        return [key, {
          key,
          label,
          serviceName: service?.name,
          image: service?.images?.[0] || artist.avatarUrl || '',
        }]
      }).filter(Boolean)
    }),
  ).values()].slice(0, 5)

  return (
    <div className="home-page landing-page">
      <section className="hero-section">
        <div className="hero-glow hero-glow--1"></div>
        <div className="hero-glow hero-glow--2"></div>
        <div className="container hero-content">
          <div className="hero-intro">
            <div className="hero-kicker">
              <span className="hero-kicker-dot"></span>
              <span>BeautyConnect</span>
              <span className="hero-kicker-sep">/</span>
              <span className="hero-kicker-season">Independent beauty professionals</span>
            </div>
            <h1 className="hero-title">
              Beauty services,
              {' '}
              <span className="hero-title-accent">connected to you.</span>
            </h1>
            <p className="hero-subtitle">
              Discover professionals, compare services, and request appointments directly through BeautyConnect.
            </p>
            <div className="hero-search-wrapper">
              <form className="hero-search-form" onSubmit={submitSearch}>
                <div className="hero-search-field">
                  <label className="hero-field-label" htmlFor="home-service">Service or specialty</label>
                  <input
                    id="home-service"
                    className="hero-input"
                    placeholder="Any service"
                    value={serviceType}
                    onChange={(event) => setServiceType(event.target.value)}
                  />
                </div>
                <div className="hero-search-field">
                  <label className="hero-field-label" htmlFor="home-city">City</label>
                  <input
                    id="home-city"
                    className="hero-input"
                    placeholder="Any city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </div>
                <div className="hero-search-cta">
                  <button type="submit" className="hero-btn-discover">
                    <span className="material-symbols-outlined">search</span>
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="hero-portrait"><HeroPortrait /></div>
        </div>
      </section>

      {specialties.length > 0 && (
        <section className="landing-section landing-specialties" aria-labelledby="landing-specialties-title">
          <div className="container">
            <div className="landing-section-heading">
              <div>
                <p className="landing-section-eyebrow">Find your service</p>
                <h2 id="landing-specialties-title">Explore specialties</h2>
                <p>Start with the kind of care you are looking for.</p>
              </div>
              <Link to="/search" className="landing-text-link">
                Explore all services <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
            <div className="landing-specialty-grid">
              {specialties.map((specialty, index) => (
                <Link
                  className={`landing-specialty-card landing-specialty-card--${index + 1}`}
                  key={specialty.key}
                  to={`/search?serviceType=${encodeURIComponent(specialty.label)}`}
                  aria-label={`Explore ${specialty.label}`}
                >
                  {specialty.image ? (
                    <img src={getAssetUrl(specialty.image)} alt="" loading="lazy" />
                  ) : (
                    <span className="landing-specialty-fallback material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                  )}
                  <span className="landing-specialty-shade" aria-hidden="true"></span>
                  <span className="landing-specialty-copy">
                    <span className="landing-specialty-kicker">Specialty</span>
                    <strong>{specialty.label}</strong>
                    {specialty.serviceName && <span>{specialty.serviceName}</span>}
                    <span className="landing-specialty-action">Discover <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span></span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="landing-section landing-professionals" aria-labelledby="landing-professionals-title">
        <div className="container">
          <div className="landing-section-heading">
            <div>
              <p className="landing-section-eyebrow">Meet the professionals</p>
              <h2 id="landing-professionals-title">Find your next beauty artist</h2>
              <p>Explore local profiles, services, and customer ratings.</p>
            </div>
            <Link to="/search" className="landing-text-link">
              Browse all professionals <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          {loading ? (
            <p className="landing-empty-state" role="status">Loading professionals…</p>
          ) : errorMessage ? (
            <div className="landing-empty-state" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">cloud_off</span>
              <p>Professionals are temporarily unavailable. Try browsing the directory again.</p>
              <Link to="/search" className="btn btn-outline-primary">Open directory</Link>
            </div>
          ) : professionals.length === 0 ? (
            <div className="landing-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">spa</span>
              <p>New professionals are joining BeautyConnect. Check back soon or browse the directory.</p>
              <Link to="/search" className="btn btn-outline-primary">Browse directory</Link>
            </div>
          ) : (
            <div className="artists-grid">
              {professionals.map((professional) => {
                const lowestPrice = professional.matchingServices?.reduce(
                  (lowest, service) => Math.min(lowest, Number(service.price)),
                  Number.POSITIVE_INFINITY,
                )
                const servicePhotos = [...new Set(
                  (professional.matchingServices ?? []).flatMap((service) => service.images ?? []),
                )].slice(0, 3)
                const cardPhotos = servicePhotos.length
                  ? servicePhotos
                  : professional.avatarUrl ? [professional.avatarUrl] : []
                return (
                  <article key={professional.id} className="artist-card glass-card">
                    {cardPhotos.length > 0 && (
                      <div className={`artist-collage artist-collage--${cardPhotos.length}`}>
                        <div className="artist-main-img-wrap">
                          <img src={getAssetUrl(cardPhotos[0])} alt={`${professional.businessName} service work`} className="artist-main-img" />
                          {(professional.verificationStatus === 1 || professional.verificationStatus === 'Approved') && (
                            <span className="artist-verified-label">
                              <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                              Verified professional
                            </span>
                          )}
                        </div>
                        {cardPhotos.length > 1 && (
                          <div className="artist-sub-imgs-col">
                            {cardPhotos.slice(1).map((image, index) => (
                              <div className="artist-sub-img-wrap" key={`${image}-${index}`}>
                                <img src={getAssetUrl(image)} alt={`${professional.businessName} service example ${index + 2}`} className="artist-sub-img" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="artist-body">
                      <div className="artist-meta-top">
                        <div className="artist-names">
                          <h3 className="artist-name">{professional.businessName}</h3>
                          <p className="artist-craft">{[professional.speciality, professional.city].filter(Boolean).join(' · ')}</p>
                        </div>
                        <div className="artist-rating-pill">
                          <RatingStars rating={professional.ratingAverage} className="rating-stars--compact" />
                          <span className="artist-score">{Number(professional.ratingAverage ?? 0).toFixed(1)}</span>
                          <span className="artist-count">({professional.totalReviews ?? 0})</span>
                        </div>
                      </div>
                      {professional.bio && <p className="small">{professional.bio}</p>}
                      <div className="artist-footer">
                        <div>
                          <span className="artist-price-label">Starting at</span>
                          <p className="artist-price">
                            {formatNpr(lowestPrice)}
                          </p>
                        </div>
                        <Link to={`/artist/${professional.id}`} className="btn-lookbook">View profile</Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
          {!loading && !errorMessage && professionals.length > 0 && (
            <div className="landing-centered-link">
              <Link to="/search" className="landing-outline-cta">
                Explore all professionals <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-how-it-works">
        <div className="container">
          <div className="landing-centered-heading">
            <p className="landing-section-eyebrow">A thoughtful way to book</p>
            <h2>How BeautyConnect works</h2>
            <p>From discovering a service to sharing your experience, booking stays simple.</p>
          </div>
          <div className="landing-steps-grid">
          {[
            ['travel_explore', 'Discover', 'Search professionals and services by specialty and city.', 'Explore the directory', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
            ['design_services', 'Compare', 'Review service descriptions, pricing, and customer ratings.', 'See the details', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'],
            ['event_available', 'Book', 'Choose an available time and send a booking request.', 'Pick a time', 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=800&q=80'],
            ['rate_review', 'Review', 'After a completed appointment, share an honest review.', 'Share your experience', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'],
          ].map(([icon, title, description, footer, image], index) => (
              <article className="landing-step-card" key={title}>
                <div className="landing-step-image">
                  <img src={image} alt="" loading="lazy" />
                  <span>0{index + 1}</span>
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="landing-step-footer">{footer}</span>
              </article>
          ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-trust">
        <div className="container">
          <div className="landing-trust-panel">
            <div className="landing-trust-intro">
              <p className="landing-section-eyebrow">BeautyConnect standards</p>
              <h2>Beauty services, with clarity at every step.</h2>
              <p>Know who you are booking, what a service includes, and how to share feedback after your appointment.</p>
              <Link to="/search" className="landing-trust-link">
                Explore the directory <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
            <div className="landing-trust-points">
              {[
                ['verified_user', 'Professional profiles', 'Explore professional profiles and their listed services.'],
                ['receipt_long', 'Clear service details', 'Compare descriptions, duration, and pricing before booking.'],
                ['reviews', 'Genuine reviews', 'Customer reviews are available after a completed appointment.'],
              ].map(([icon, title, description]) => (
                <article className="landing-trust-point" key={title}>
                  <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-final-cta">
        <div className="container">
          <div className="landing-final-cta-card">
            <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
            <p className="landing-section-eyebrow">Your next appointment starts here</p>
            <h2>Find the right service for you.</h2>
            <p>Browse real professionals and choose a service that fits your needs.</p>
            <Link to="/search" className="landing-search-button">
              Explore professionals <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
