import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  approveProfessional,
  getAnalytics,
  getOpenDisputes,
  getPendingVerifications,
  getRecentActivity,
  rejectProfessional,
  resolveDispute,
} from '../api/admin'
import { getAssetUrl } from '../api/assets'
import { getProfessionals } from '../api/search'
import { notify } from '../utils/notifications'
import { formatNpr } from '../utils/currency'
import './AdminPanelPage.css'

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status
const disputeStatus = (status) => typeof status === 'number'
  ? ['Open', 'UnderReview', 'Resolved', 'Dismissed'][status] ?? 'Unknown'
  : status

export default function AdminPanelPage() {
  const [tab, setTab] = useState('verifications')
  const [verifications, setVerifications] = useState([])
  const [disputes, setDisputes] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [resolution, setResolution] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingProfileId, setUpdatingProfileId] = useState(null)

  const recentFeed = useMemo(() => {
    const mappedActivities = recentActivities.length
      ? recentActivities.map((activity) => ({
          kind: activity.type || 'default',
          title: activity.title || 'Recent platform activity',
          detail: activity.detail || 'No details available.',
          time: activity.timeLabel || 'Now',
        }))
      : [{
          kind: 'default',
          title: 'Admin dashboard is ready',
          detail: 'No new activity has been recorded yet.',
          time: 'Now',
        }]

    return mappedActivities.slice(0, 5)
  }, [recentActivities])

  const loadData = useCallback(async () => {
    const results = await Promise.allSettled([
      getPendingVerifications(),
      getOpenDisputes(),
      getAnalytics(),
      getRecentActivity(),
      getProfessionals({ page: 1, pageSize: 12 }),
    ])
    if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
    if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
    if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
    if (results[3].status === 'fulfilled') setRecentActivities(results[3].value ?? [])
    if (results[4].status === 'fulfilled') setProfessionals(results[4].value?.results ?? [])
    const failures = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.response?.data?.message ?? 'Some administrative data could not be loaded.')
    if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      getPendingVerifications(),
      getOpenDisputes(),
      getAnalytics(),
      getRecentActivity(),
      getProfessionals({ page: 1, pageSize: 12 }),
    ])
      .then((results) => {
        if (!active) return
        if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
        if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
        if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
        if (results[3].status === 'fulfilled') setRecentActivities(results[3].value ?? [])
        if (results[4].status === 'fulfilled') setProfessionals(results[4].value?.results ?? [])
        const failures = results
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason.response?.data?.message ?? 'Some administrative data could not be loaded.')
        if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadData])

  async function updateVerification(profileId, action) {
    setErrorMessage('')
    setUpdatingProfileId(profileId)
    try {
      await action(profileId)
      await loadData()
      notify.success('Verification decision saved.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not update the verification.')
    } finally {
      setUpdatingProfileId(null)
    }
  }

  async function handleResolve(event, disputeId) {
    event.preventDefault()
    const resolutionNotes = resolution[disputeId]?.trim()
    if (!resolutionNotes) return
    setErrorMessage('')
    try {
      await resolveDispute(disputeId, resolutionNotes)
      await loadData()
      notify.success(`Dispute #${disputeId} resolved.`)
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not resolve this dispute.')
    }
  }

  if (loading) return <div className="container py-5" role="status">Loading administration data…</div>

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">BEAUTYCONNECT OPERATIONS</span>
          <h1 className="font-headline">Platform overview</h1>
          <p>Keep the marketplace trusted, healthy, and running smoothly.</p>
        </div>
        <div className="admin-hero-mark" aria-hidden="true">
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </div>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="admin-metric-grid" aria-label="Platform metrics">
        {[
          { label: 'Total bookings', value: analytics?.totalBookings, icon: 'calendar_month', tone: 'rose' },
          { label: 'Platform commission', value: analytics?.revenue, icon: 'payments', tone: 'gold' },
          { label: 'Active users', value: analytics?.activeUsers, icon: 'group', tone: 'sage' },
          { label: 'Verified professionals', value: analytics?.verifiedProfessionalCount, icon: 'verified', tone: 'plum' },
        ].map(({ label, value, icon, tone }) => (
          <article className={`admin-metric-card admin-metric-card--${tone}`} key={label}>
            <span className="admin-metric-icon material-symbols-outlined" aria-hidden="true">{icon}</span>
            <span className="admin-metric-label">{label}</span>
            <strong>{label === 'Platform commission' ? formatNpr(value) : value ?? '—'}</strong>
          </article>
        ))}
      </section>

      <section className="admin-activity-panel" aria-labelledby="recent-activity-heading">
        <div className="admin-queue-heading">
          <div>
            <span className="admin-eyebrow">OPERATIONS</span>
            <h2 id="recent-activity-heading">Recent activity</h2>
          </div>
          <span className="admin-queue-total">{recentFeed.length} updates</span>
        </div>

        <ul className="admin-activity-list">
          {recentFeed.map((activity) => (
            <li key={`${activity.kind}-${activity.title}-${activity.time}`} className="admin-activity-item">
              <span className={`admin-activity-bullet admin-activity-bullet--${activity.kind}`} aria-hidden="true" />
              <div>
                <strong>{activity.title}</strong>
                <p>{activity.detail}</p>
              </div>
              <span className="admin-activity-time">{activity.time}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="admin-queue-tabs" aria-label="Administration queues">
        <button type="button" className={`admin-queue-tab${tab === 'verifications' ? ' admin-queue-tab--active' : ''}`} aria-pressed={tab === 'verifications'} onClick={() => setTab('verifications')}>
          <span className="material-symbols-outlined" aria-hidden="true">how_to_reg</span>
          Verification requests <span className="admin-queue-count">{verifications.length}</span>
        </button>
        <button type="button" className={`admin-queue-tab${tab === 'disputes' ? ' admin-queue-tab--active' : ''}`} aria-pressed={tab === 'disputes'} onClick={() => setTab('disputes')}>
          <span className="material-symbols-outlined" aria-hidden="true">support</span>
          Open disputes <span className="admin-queue-count">{disputes.length}</span>
        </button>
      </nav>

      {tab === 'verifications' ? (
        <section className="admin-queue-panel">
          <div className="admin-queue-heading">
            <div>
              <span className="admin-eyebrow">TRUST &amp; SAFETY</span>
              <h2>Professional applications</h2>
              <p>Review studio details before they appear in the directory.</p>
            </div>
            <span className="admin-queue-total">{verifications.length} pending</span>
          </div>
          {verifications.length === 0 ? (
            <div className="admin-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
              <strong>You’re all caught up</strong>
              <p>There are no pending professional applications to review.</p>
            </div>
          ) : (
            <div className="admin-application-grid">
              {verifications.map((profile) => (
                <article className="admin-application-card" key={profile.id}>
                  <div className="admin-application-identity">
                    {profile.avatarUrl ? (
                      <img src={getAssetUrl(profile.avatarUrl)} alt="" />
                    ) : (
                      <span className="admin-application-avatar material-symbols-outlined" aria-hidden="true">storefront</span>
                    )}
                    <div>
                      <h3>{profile.businessName}</h3>
                      <p>{profile.email}</p>
                    </div>
                  </div>
                  <div className="admin-application-details">
                    <span><span className="material-symbols-outlined" aria-hidden="true">work</span>{profile.speciality || 'Speciality not provided'}</span>
                    <span><span className="material-symbols-outlined" aria-hidden="true">location_on</span>{profile.city || 'Location not provided'}</span>
                  </div>
                  {profile.bio && <p className="admin-application-bio">{profile.bio}</p>}
                  <div className="admin-application-footer">
                    <span className={`admin-status-badge admin-status-badge--${verificationStatus(profile.verificationStatus).toLocaleLowerCase()}`}>
                      {verificationStatus(profile.verificationStatus)}
                    </span>
                    <div className="admin-application-actions">
                      <button className="btn btn-primary" type="button" disabled={updatingProfileId === profile.id} onClick={() => updateVerification(profile.id, approveProfessional)}>
                        {updatingProfileId === profile.id ? 'Saving…' : 'Approve'}
                      </button>
                      <button className="btn btn-outline-danger" type="button" disabled={updatingProfileId === profile.id} onClick={() => updateVerification(profile.id, rejectProfessional)}>Decline</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="admin-queue-panel">
          <div className="admin-queue-heading">
            <div>
              <span className="admin-eyebrow">CUSTOMER CARE</span>
              <h2>Dispute resolution</h2>
              <p>Review reports and record a clear resolution for both parties.</p>
            </div>
            <span className="admin-queue-total">{disputes.length} open</span>
          </div>
          {disputes.length === 0 ? (
            <div className="admin-empty-state">
              <span className="material-symbols-outlined" aria-hidden="true">sentiment_satisfied</span>
              <strong>No open disputes</strong>
              <p>New customer or professional reports will appear here.</p>
            </div>
          ) : (
            <div className="admin-dispute-list">
              {disputes.map((dispute) => (
                <article className="admin-dispute-card" key={dispute.id}>
                  <div className="admin-dispute-header">
                    <div>
                      <span className="admin-eyebrow">DISPUTE #{dispute.id}</span>
                      <h3>Booking #{dispute.bookingId}</h3>
                    </div>
                    <span className={`admin-status-badge admin-status-badge--${disputeStatus(dispute.status).toLocaleLowerCase()}`}>
                      {disputeStatus(dispute.status)}
                    </span>
                  </div>
                  <p className="admin-dispute-reason">{dispute.reason}</p>
                  <div className="admin-dispute-meta">
                    <span><span className="material-symbols-outlined" aria-hidden="true">mail</span>{dispute.raisedByEmail}</span>
                    <span><span className="material-symbols-outlined" aria-hidden="true">schedule</span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                    <strong>Booking total {formatNpr(dispute.bookingTotalPrice)}</strong>
                  </div>
                  <form onSubmit={(event) => handleResolve(event, dispute.id)} className="admin-resolution-form">
                    <label className="form-label" htmlFor={`resolution-${dispute.id}`}>Resolution notes</label>
                    <textarea
                      id={`resolution-${dispute.id}`}
                      className="form-control mb-2"
                      required
                      maxLength="2000"
                      value={resolution[dispute.id] ?? ''}
                      onChange={(event) => setResolution((current) => ({ ...current, [dispute.id]: event.target.value }))}
                    />
                    <button className="btn btn-primary" type="submit">Save resolution</button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
