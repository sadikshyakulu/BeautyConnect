import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getProfessionals } from '../api/search'
import { getAssetUrl } from '../api/assets'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    serviceType: searchParams.get('serviceType') ?? '',
    city: searchParams.get('city') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    minRating: searchParams.get('minRating') ?? '',
    page: Number(searchParams.get('page') ?? 1),
    pageSize: 12,
  })
  const [appliedFilters, setAppliedFilters] = useState({
    serviceType: searchParams.get('serviceType') ?? '',
    city: searchParams.get('city') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
    minRating: searchParams.get('minRating') ?? '',
    page: Number(searchParams.get('page') ?? 1),
    pageSize: 12,
  })
  const [results, setResults] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    getProfessionals({
      ...appliedFilters,
      minPrice: appliedFilters.minPrice || undefined,
      maxPrice: appliedFilters.maxPrice || undefined,
      minRating: appliedFilters.minRating || undefined,
    })
      .then((response) => {
        if (!active) return
        setResults(response.results ?? [])
        setTotalCount(response.totalCount ?? 0)
      })
      .catch((error) => {
        if (!active) return
        setErrorMessage(
          error.response?.data?.message ??
          'Could not load professionals. Please try again.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [appliedFilters])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setAppliedFilters({ ...filters })
    const query = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== 1 && key !== 'pageSize') query[key] = value
    }
    setSearchParams(query)
  }

  function changePage(page) {
    setLoading(true)
    setFilters((current) => ({ ...current, page }))
    setAppliedFilters((current) => ({ ...current, page }))
    setSearchParams((current) => {
      current.set('page', String(page))
      return current
    })
  }

  const pageCount = Math.max(1, Math.ceil(totalCount / filters.pageSize))

  return (
    <section className="container py-5">
      <header className="mb-4">
        <p className="text-uppercase text-secondary fw-semibold small mb-2">BeautyConnect directory</p>
        <h1 className="font-headline">Find a beauty professional</h1>
        <p className="text-on-surface-variant">Search live professional profiles and services.</p>
      </header>

      <form className="glass-card rounded-2xl p-4 mb-4" onSubmit={applyFilters}>
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="search-service">Service or specialty</label>
            <input id="search-service" className="form-control" name="serviceType" value={filters.serviceType} onChange={updateFilter} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="search-city">City</label>
            <input id="search-city" className="form-control" name="city" value={filters.city} onChange={updateFilter} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="search-min-price">Minimum price</label>
            <input id="search-min-price" className="form-control" name="minPrice" type="number" min="0" value={filters.minPrice} onChange={updateFilter} />
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label" htmlFor="search-max-price">Maximum price</label>
            <input id="search-max-price" className="form-control" name="maxPrice" type="number" min="0" value={filters.maxPrice} onChange={updateFilter} />
          </div>
          <div className="col-12 col-md-1">
            <button className="btn btn-primary w-100" type="submit" aria-label="Apply filters">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="search-rating">Minimum rating</label>
            <select id="search-rating" className="form-select" name="minRating" value={filters.minRating} onChange={updateFilter}>
              <option value="">Any rating</option>
              {[3, 4, 4.5, 5].map((rating) => <option key={rating} value={rating}>{rating}+</option>)}
            </select>
          </div>
        </div>
      </form>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Professionals</h2>
        {!loading && <span className="text-on-surface-variant small">{totalCount} results</span>}
      </div>

      {loading ? (
        <p role="status">Loading professionals…</p>
      ) : !errorMessage && results.length === 0 ? (
        <div className="glass-card rounded-2xl p-5 text-center">
          <h3 className="h5">No verified professionals match yet</h3>
          <p className="text-on-surface-variant mb-0">Try changing or clearing your filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {results.map((professional) => (
            <div className="col-12 col-md-6 col-xl-4" key={professional.id}>
              <article className="glass-card rounded-2xl h-100 overflow-hidden">
                {professional.avatarUrl && (
                  <img className="w-100 object-fit-cover" style={{ height: 220 }} src={getAssetUrl(professional.avatarUrl)} alt="" />
                )}
                <div className="p-4">
                  <div className="d-flex justify-content-between gap-3 align-items-start">
                    <div>
                      <h3 className="h5 mb-1">{professional.businessName}</h3>
                      <p className="text-on-surface-variant small mb-2">
                        {[professional.speciality, professional.city].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="badge text-bg-light">★ {Number(professional.ratingAverage ?? 0).toFixed(1)}</span>
                  </div>
                  {professional.bio && <p className="small">{professional.bio}</p>}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {(professional.matchingServices ?? []).map((service) => (
                      <span key={service.id} className="badge rounded-pill text-bg-light">
                        {service.name} · {service.price}
                      </span>
                    ))}
                  </div>
                  <Link className="btn btn-outline-primary" to={`/artist/${professional.id}`}>View profile</Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {!loading && pageCount > 1 && (
        <nav className="d-flex justify-content-center gap-3 mt-4" aria-label="Search pages">
          <button className="btn btn-outline-secondary" type="button" disabled={filters.page <= 1} onClick={() => changePage(filters.page - 1)}>Previous</button>
          <span className="align-self-center">Page {filters.page} of {pageCount}</span>
          <button className="btn btn-outline-secondary" type="button" disabled={filters.page >= pageCount} onClick={() => changePage(filters.page + 1)}>Next</button>
        </nav>
      )}
    </section>
  )
}
