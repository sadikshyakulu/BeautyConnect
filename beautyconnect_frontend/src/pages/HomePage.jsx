import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProfessionals } from '../api/search'
import { getAssetUrl } from '../api/assets'
import HeroPortrait from '../components/HeroPortrait'
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
        if (active) setErrorMessage(error.response?.data?.message ?? 'Featured professionals could not be loaded.')
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

  return (
    <div className="home-page">
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

      <section className="featured-artists-section py-5">
        <div className="container">
          <div className="featured-header">
            <div>
              <div className="section-kicker"><span className="kicker-tag">Explore</span></div>
              <h2 className="section-title">Professionals</h2>
            </div>
            <Link to="/search" className="btn btn-outline-primary">Browse all professionals</Link>
          </div>
          {errorMessage && <div className="alert alert-warning" role="alert">{errorMessage}</div>}
          {loading ? (
            <p role="status">Loading professionals…</p>
          ) : !errorMessage && professionals.length === 0 ? (
            <p className="text-on-surface-variant">No public professional profiles are available yet.</p>
          ) : (
            <div className="artists-grid">
              {professionals.map((professional) => {
                const lowestPrice = professional.matchingServices?.reduce(
                  (lowest, service) => Math.min(lowest, Number(service.price)),
                  Number.POSITIVE_INFINITY,
                )
                return (
                  <article key={professional.id} className="artist-card glass-card">
                    {professional.avatarUrl && (
                      <div className="artist-collage" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="artist-main-img-wrap">
                          <img src={getAssetUrl(professional.avatarUrl)} alt="" className="artist-main-img" />
                        </div>
                      </div>
                    )}
                    <div className="artist-body">
                      <div className="artist-meta-top">
                        <div className="artist-names">
                          <h3 className="artist-name">{professional.businessName}</h3>
                          <p className="artist-craft">{[professional.speciality, professional.city].filter(Boolean).join(' · ')}</p>
                        </div>
                        <div className="artist-rating-pill">
                          <span>★</span>
                          <span className="artist-score">{Number(professional.ratingAverage ?? 0).toFixed(1)}</span>
                          <span className="artist-count">({professional.totalReviews ?? 0})</span>
                        </div>
                      </div>
                      {professional.bio && <p className="small">{professional.bio}</p>}
                      <div className="artist-footer">
                        <div>
                          <span className="artist-price-label">Starting at</span>
                          <p className="artist-price">
                            {Number.isFinite(lowestPrice) ? lowestPrice.toFixed(2) : '—'}
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
        </div>
      </section>

      <section id="how-it-works" className="container py-5">
        <h2 className="section-title">How it works</h2>
        <div className="row g-3">
          {[
            ['Discover', 'Search professional profiles by service and city.'],
            ['Choose', 'Compare the services and available appointment times.'],
            ['Book', 'Send a booking request and manage it from your customer dashboard.'],
          ].map(([title, description], index) => (
            <div className="col-12 col-md-4" key={title}>
              <article className="glass-card rounded-2xl p-4 h-100">
                <span className="text-secondary fw-semibold">0{index + 1}</span>
                <h3 className="h5 mt-2">{title}</h3>
                <p className="mb-0 text-on-surface-variant">{description}</p>
              </article>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
