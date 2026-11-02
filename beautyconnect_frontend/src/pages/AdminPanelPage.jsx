import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  approveProfessional,
  getAnalytics,
  getOpenDisputes,
  getPendingVerifications,
  getPayoutBalances,
  getRecentActivity,
  rejectProfessional,
  resolveDispute,
} from '../api/admin'
import { getAssetUrl } from '../api/assets'
import AdminProfessionalAvatar from '../components/AdminProfessionalAvatar'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import { notify } from '../utils/notifications'
import { useAuth } from '../auth/useAuth'
import './AdminPanelPage.css'

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status
const disputeStatus = (status) => typeof status === 'number'
  ? ['Open', 'UnderReview', 'Resolved', 'Dismissed'][status] ?? 'Unknown'
  : status

export default function AdminPanelPage() {
  const { user } = useAuth()
  const isAdmin = typeof user?.role === 'number'
    ? user.role === 2
    : String(user?.role ?? '').toLowerCase() === 'admin'
  const [tab, setTab] = useState('verifications')
  const [verifications, setVerifications] = useState([])
  const [disputes, setDisputes] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [recentActivities, setRecentActivities] = useState([])
  const [payoutBalances, setPayoutBalances] = useState(null)
  const [resolution, setResolution] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingProfileId, setUpdatingProfileId] = useState(null)

  const recentFeed = useMemo(() => {
    const mappedActivities = recentActivities.length
      ? recentActivities.map((activity) => {
          const detail = activity.detail || 'No details available.'
          const legacyAmount = activity.amount == null
            ? detail.match(/(?:[•·]\s*)?([\d,]+(?:\.\d{1,2})?)\s*NPR\s*$/i)
            : null

          return {
            kind: activity.type || 'default',
            title: activity.title || 'Recent platform activity',
            detail: legacyAmount ? detail.slice(0, legacyAmount.index).trim() : detail,
            amount: activity.amount ?? (legacyAmount ? Number(legacyAmount[1].replaceAll(',', '')) : null),
            time: activity.timeLabel || 'Now',
          }
        })
      : [{
          kind: 'default',
          title: 'Admin dashboard is ready',
          detail: 'No new activity has been recorded yet.',
          amount: null,
          time: 'Now',
        }]

    return mappedActivities.slice(0, 5)
  }, [recentActivities])

  const loadData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    const results = await Promise.allSettled([
      getPendingVerifications(),
      getOpenDisputes(),
      getAnalytics(),
      getRecentActivity(),
      getPayoutBalances(),
    ])
    if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
    if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
    if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
    if (results[3].status === 'fulfilled') setRecentActivities(results[3].value ?? [])
    if (results[4].status === 'fulfilled') setPayoutBalances(results[4].value ?? [])
    const failures = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.response?.data?.message ?? 'Some administrative data could not be loaded.')
    if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
    setLoading(false)
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) {
      return undefined
    }

    let active = true
    Promise.allSettled([
      getPendingVerifications(),
      getOpenDisputes(),
      getAnalytics(),
      getRecentActivity(),
      getPayoutBalances(),
    ])
      .then((results) => {
        if (!active) return
        if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
        if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
        if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
        if (results[3].status === 'fulfilled') setRecentActivities(results[3].value ?? [])
        if (results[4].status === 'fulfilled') setPayoutBalances(results[4].value ?? [])
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
  }, [isAdmin, loadData])

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

  if (!isAdmin) return null
  if (loading) return <div className="container py-5"><LoadingState label="Loading administration data…" /></div>

  const payoutBalanceTotals = payoutBalances?.reduce((totals, balance) => ({
    customerPaymentsReceived: totals.customerPaymentsReceived + Number(balance.customerPaymentsReceived ?? 0),
    outstanding: totals.outstanding
      + Number(balance.pending ?? 0)
      + Number(balance.available ?? 0)
      + Number(balance.requested ?? 0),
  }), { customerPaymentsReceived: 0, outstanding: 0 }) ?? null

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">BEAUTYCONNECT OPERATIONS</span>
          <h1 className="font-headline">Platform overview</h1>
          <p>Keep the marketplace trusted, healthy, and running smoothly.</p>
        </div>
        <div className="admin-hero-mark" aria-hidden="true">
          <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
        </div>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="admin-metric-grid" aria-label="Platform metrics">
        {[
          { label: 'Total bookings', value: analytics?.totalBookings, icon: 'calendar_month', tone: 'rose', iconTone: 'info' },
          { label: 'Customer payments received (gross)', value: payoutBalanceTotals?.customerPaymentsReceived, icon: 'account_balance', tone: 'sage', iconTone: 'cash' },
          { label: 'Platform commission', value: analytics?.revenue, icon: 'paid', tone: 'gold', iconTone: 'coin' },
          { label: 'Payouts outstanding', value: payoutBalanceTotals?.outstanding, icon: 'account_balance_wallet', tone: 'plum', iconTone: 'cash' },
          { label: 'Payouts requested', value: analytics?.requestedPayoutTotal, icon: 'pending_actions', tone: 'plum', iconTone: 'request' },
          { label: 'Payouts paid', value: analytics?.paidPayoutTotal, icon: 'paid', tone: 'sage', iconTone: 'coin' },
          { label: 'Active users', value: analytics?.activeUsers, icon: 'group', tone: 'sage', iconTone: 'people' },
          { label: 'Verified professionals', value: analytics?.verifiedProfessionalCount, icon: 'verified', tone: 'plum', iconTone: 'verified' },
        ].map(({ label, value, icon, tone, iconTone }) => (
          <article className={`admin-metric-card admin-metric-card--${tone}`} key={label}>
            <span className={`admin-metric-icon admin-metric-icon--${iconTone} icon-tone--${iconTone} material-symbols-outlined`} aria-hidden="true">{icon}</span>
            <span className="admin-metric-label">{label}</span>
            <strong>{['Customer payments received (gross)', 'Platform commission', 'Payouts outstanding', 'Payouts requested', 'Payouts paid'].includes(label)
              ? <MoneyAmount value={value} />
              : value ?? '—'}</strong>
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
                <p>
                  {activity.detail}
                  {activity.amount != null && <> · <MoneyAmount value={activity.amount} /></>}
                </p>
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
        <button type="button" className={`admin-queue-tab${tab === 'payouts' ? ' admin-queue-tab--active' : ''}`} aria-pressed={tab === 'payouts'} onClick={() => setTab('payouts')}>
          <span className="material-symbols-outlined admin-queue-tab-icon--coin icon-tone--coin" aria-hidden="true">paid</span>
          Payouts <span className="admin-queue-count">{payoutBalances?.length ?? '—'}</span>
        </button>
      </nav>

      {tab === 'payouts' ? (
        <section className="admin-queue-panel">
          <div className="admin-queue-heading">
            <div>
              <span className="admin-eyebrow">FINANCE OVERVIEW</span>
              <h2>Payouts</h2>
              <p>Preview balances here; manage transfers and view the full breakdown on the payouts page.</p>
            </div>
            <Link className="btn btn-primary" to="/admin/payouts">
              View balances <span className="material-symbols-outlined ms-1" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          {payoutBalances === null ? (
            <div className="admin-empty-state" role="status">
              <strong>Professional balances could not be loaded</strong>
              <p>Check the error above, then refresh the page to retry.</p>
            </div>
          ) : payoutBalances.length === 0 ? (
            <div className="admin-empty-state">
              <span className="material-symbols-outlined icon-tone--cash" aria-hidden="true">account_balance_wallet</span>
              <strong>No professional balances</strong>
              <p>Verified payments and earnings will be summarized here.</p>
            </div>
          ) : (
            <>
              <section className="admin-payout-preview-metrics" aria-label="Payout preview totals">
                <article>
                  <span>Customer payments</span>
                  <strong><MoneyAmount value={payoutBalanceTotals?.customerPaymentsReceived} /></strong>
                </article>
                <article>
                  <span>Still owed to professionals</span>
                  <strong><MoneyAmount value={payoutBalanceTotals?.outstanding} /></strong>
                </article>
                <article>
                  <span>Professionals</span>
                  <strong>{payoutBalances.length}</strong>
                </article>
              </section>
              <div className="table-responsive admin-payout-preview-table">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr><th scope="col">Professional</th><th scope="col">Pending earnings</th><th scope="col">Available</th><th scope="col">Requested</th></tr>
                  </thead>
                  <tbody>
                    {[...payoutBalances]
                      .sort((left, right) => (
                        Number(right.pending ?? 0) + Number(right.available ?? 0) + Number(right.requested ?? 0)
                        - Number(left.pending ?? 0) - Number(left.available ?? 0) - Number(left.requested ?? 0)
                      ))
                      .slice(0, 3)
                      .map((balance) => (
                        <tr key={balance.professionalProfileId}>
                          <th scope="row">
                            <div className="admin-payout-professional admin-payout-professional--table">
                              <AdminProfessionalAvatar
                                name={balance.professionalName}
                                avatarUrl={balance.professionalAvatarUrl}
                                compact
                              />
                              <div>
                                {balance.professionalName}
                                <small>{balance.professionalEmail}</small>
                              </div>
                            </div>
                          </th>
                          <td><MoneyAmount value={balance.pending} /></td>
                          <td><MoneyAmount value={balance.available} /></td>
                          <td><MoneyAmount value={balance.requested} /></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-payout-preview-footer">
                <span>Showing up to 3 professional balances</span>
                <Link to="/admin/payouts">Open payout balances</Link>
              </div>
            </>
          )}
        </section>
      ) : tab === 'verifications' ? (
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
                    <span><span className="material-symbols-outlined icon-tone--location" aria-hidden="true">location_on</span>{profile.city || 'Location not provided'}</span>
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
                    <strong>Booking total <MoneyAmount value={dispute.bookingTotalPrice} /></strong>
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
