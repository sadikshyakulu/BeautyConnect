import { useEffect, useMemo, useState } from 'react'
import { getAnalytics, getCustomers, getPendingVerifications } from '../api/admin'
import { getAssetUrl } from '../api/assets'
import { getProfessionals } from '../api/search'
import './AdminPanelPage.css'

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status

const getNestedValue = (source, ...paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((current, key) => current?.[key], source)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

export default function AdminUsersPage() {
  const [analytics, setAnalytics] = useState(null)
  const [customers, setCustomers] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    Promise.allSettled([
      getAnalytics(),
      getCustomers(),
      getProfessionals({ page: 1, pageSize: 50 }),
      getPendingVerifications(),
    ])
      .then((results) => {
        if (!active) return

        if (results[0].status === 'fulfilled') setAnalytics(results[0].value)
        if (results[1].status === 'fulfilled') setCustomers(results[1].value ?? [])
        if (results[2].status === 'fulfilled') setProfessionals(results[2].value?.results ?? [])
        if (results[3].status === 'fulfilled') setVerifications(results[3].value ?? [])

        const failures = results
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason.response?.data?.message ?? 'Some user data could not be loaded.')

        if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const customerRows = useMemo(() => {
    if (!customers.length) return []

    return customers.map((customer) => ({
      name: customer.name || 'Customer',
      email: customer.email || 'No email available',
      location: customer.location || 'Not provided',
      status: customer.status || 'Active',
    }))
  }, [customers])

  const professionalEmailLookup = useMemo(() => {
    const lookup = new Map()

    for (const record of verifications) {
      const keys = [
        record?.userId,
        record?.id,
        record?.profileId,
        record?.businessName,
        record?.user?.id,
        record?.profile?.id,
      ].filter((value) => value !== undefined && value !== null && value !== '')

      const email = getNestedValue(record, 'email', 'user.email', 'profile.email')
      if (!email) continue

      for (const key of keys) {
        lookup.set(String(key), email)
      }

      const businessName = getNestedValue(record, 'businessName', 'profile.businessName', 'user.businessName')
      if (businessName) lookup.set(String(businessName).toLowerCase(), email)
    }

    return lookup
  }, [verifications])

  const resolvedProfessionals = useMemo(() => professionals.map((professional) => {
    const lookupKey = [
      professional?.userId,
      professional?.id,
      professional?.profileId,
      professional?.businessName,
      professional?.user?.id,
      professional?.profile?.id,
    ].find((value) => value !== undefined && value !== null && value !== '')

    const professionalEmail = getNestedValue(
      professional,
      'email',
      'user.email',
      'profile.email',
      'userEmail',
      'account.email',
      'contact.email',
    ) ?? (lookupKey !== undefined ? professionalEmailLookup.get(String(lookupKey)) ?? professionalEmailLookup.get(String(professional?.businessName ?? '').toLowerCase()) : undefined) ?? 'Email not available from API'

    const professionalName = getNestedValue(
      professional,
      'businessName',
      'profile.businessName',
      'user.businessName',
      'user.fullName',
      'fullName',
    ) ?? 'Professional profile'

    const professionalLocation = getNestedValue(
      professional,
      'city',
      'profile.city',
      'user.city',
      'location',
    ) ?? 'Location unavailable'

    return {
      ...professional,
      professionalEmail,
      professionalName,
      professionalLocation,
      speciality: getNestedValue(professional, 'speciality', 'profile.speciality') || 'Not specified',
      status: verificationStatus(professional.verificationStatus ?? 'Approved'),
      serviceCount: professional.matchingServices?.length ?? 0,
    }
  }), [professionals, professionalEmailLookup])

  if (loading) return <div className="container py-5" role="status">Loading users…</div>

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">COMMUNITY</span>
          <h1 className="font-headline">Users &amp; professionals</h1>
          <p>Review registered users and marketplace professionals in a structured list.</p>
        </div>
        <div className="admin-hero-mark" aria-hidden="true">
          <span className="material-symbols-outlined">groups</span>
        </div>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="admin-member-summary">
        <article className="admin-member-summary-card">
          <span className="material-symbols-outlined" aria-hidden="true">person</span>
          <div>
            <label>Active users</label>
            <strong>{analytics?.activeUsers ?? '—'}</strong>
          </div>
        </article>
        <article className="admin-member-summary-card">
          <span className="material-symbols-outlined" aria-hidden="true">storefront</span>
          <div>
            <label>Verified professionals</label>
            <strong>{analytics?.verifiedProfessionalCount ?? professionals.length}</strong>
          </div>
        </article>
        <article className="admin-member-summary-card">
          <span className="material-symbols-outlined" aria-hidden="true">event</span>
          <div>
            <label>Pending profiles</label>
            <strong>{verifications.length}</strong>
          </div>
        </article>
      </section>

      <section className="admin-queue-panel">
        <div className="admin-queue-heading">
          <div>
            <span className="admin-eyebrow">USERS</span>
            <h2>Customer list</h2>
            <p>Current customer activity and account summary.</p>
          </div>
          <span className="admin-queue-total">{customerRows.length} records</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.length === 0 ? (
                <tr>
                  <td colSpan="4" className="admin-table-empty">No customer records available yet.</td>
                </tr>
              ) : (
                customerRows.map((user) => (
                  <tr key={`${user.email}-${user.name}`}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.location}</td>
                    <td><span className="admin-status-badge admin-status-badge--approved">{user.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-queue-panel admin-table-section">
        <div className="admin-queue-heading">
          <div>
            <span className="admin-eyebrow">PROFESSIONALS</span>
            <h2>Professional list</h2>
            <p>Marketplace professionals with their main service details.</p>
          </div>
          <span className="admin-queue-total">{professionals.length} records</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Email</th>
                <th>Speciality</th>
                <th>Location</th>
                <th>Services</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resolvedProfessionals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-table-empty">No professionals available yet.</td>
                </tr>
              ) : (
                resolvedProfessionals.map((professional) => (
                  <tr key={professional.id}>
                    <td>
                      <div className="admin-table-profile-cell">
                        {professional.avatarUrl ? (
                          <img src={getAssetUrl(professional.avatarUrl)} alt="" />
                        ) : (
                          <span className="admin-application-avatar material-symbols-outlined" aria-hidden="true">person</span>
                        )}
                        <div>
                          <strong>{professional.professionalName}</strong>
                          <small>{getNestedValue(professional, 'fullName', 'user.fullName', 'profile.fullName') || 'Professional profile'}</small>
                        </div>
                      </div>
                    </td>
                    <td>{professional.professionalEmail}</td>
                    <td>{professional.speciality}</td>
                    <td>{professional.professionalLocation}</td>
                    <td>{professional.serviceCount}</td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${String(professional.status).toLocaleLowerCase()}`}>
                        {professional.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}