import { useCallback, useEffect, useState } from 'react'
import {
  approveProfessional,
  getAnalytics,
  getOpenDisputes,
  getPendingVerifications,
  rejectProfessional,
  resolveDispute,
} from '../api/admin'

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
  const [analytics, setAnalytics] = useState(null)
  const [resolution, setResolution] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    const results = await Promise.allSettled([
      getPendingVerifications(),
      getOpenDisputes(),
      getAnalytics(),
    ])
    if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
    if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
    if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
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
    ])
      .then((results) => {
        if (!active) return
        if (results[0].status === 'fulfilled') setVerifications(results[0].value ?? [])
        if (results[1].status === 'fulfilled') setDisputes(results[1].value ?? [])
        if (results[2].status === 'fulfilled') setAnalytics(results[2].value)
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
    try {
      await action(profileId)
      await loadData()
      setNotice('Verification decision saved.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not update the verification.')
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
      setNotice(`Dispute #${disputeId} resolved.`)
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not resolve this dispute.')
    }
  }

  if (loading) return <div className="container py-5" role="status">Loading administration data…</div>

  return (
    <div className="container py-5">
      <header className="mb-4">
        <p className="text-uppercase text-secondary fw-semibold small mb-2">Administration</p>
        <h1 className="font-headline">Platform operations</h1>
        <p className="text-on-surface-variant">Review professional verification, open disputes, and platform metrics.</p>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <section className="row g-3 mb-4">
        {[
          ['Total bookings', analytics?.totalBookings],
          ['Revenue', analytics?.revenue],
          ['Active users', analytics?.activeUsers],
          ['Verified professionals', analytics?.verifiedProfessionalCount],
        ].map(([label, value]) => (
          <div className="col-6 col-xl-3" key={label}>
            <div className="glass-card rounded-2xl p-4 h-100">
              <span className="small text-on-surface-variant">{label}</span>
              <strong className="d-block fs-3">{value ?? '—'}</strong>
            </div>
          </div>
        ))}
      </section>

      <div className="d-flex gap-2 mb-4">
        <button type="button" className={`btn ${tab === 'verifications' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('verifications')}>
          Verifications ({verifications.length})
        </button>
        <button type="button" className={`btn ${tab === 'disputes' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('disputes')}>
          Open disputes ({disputes.length})
        </button>
      </div>

      {tab === 'verifications' ? (
        <section>
          <h2 className="h4 mb-3">Pending professional verification</h2>
          {verifications.length === 0 ? (
            <p className="text-on-surface-variant">There are no pending verification requests.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {verifications.map((profile) => (
                <article className="glass-card rounded-2xl p-4" key={profile.id}>
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div>
                      <h3 className="h5 mb-1">{profile.businessName}</h3>
                      <p className="small mb-1">{profile.email}</p>
                      <p className="small text-on-surface-variant mb-2">{[profile.speciality, profile.city].filter(Boolean).join(' · ')}</p>
                      {profile.bio && <p className="mb-2">{profile.bio}</p>}
                      <span className="badge text-bg-warning">{verificationStatus(profile.verificationStatus)}</span>
                    </div>
                    <div className="d-flex gap-2 align-self-start">
                      <button className="btn btn-primary" type="button" onClick={() => updateVerification(profile.id, approveProfessional)}>Approve</button>
                      <button className="btn btn-outline-danger" type="button" onClick={() => updateVerification(profile.id, rejectProfessional)}>Reject</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          <h2 className="h4 mb-3">Open disputes</h2>
          {disputes.length === 0 ? (
            <p className="text-on-surface-variant">There are no open disputes.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {disputes.map((dispute) => (
                <article className="glass-card rounded-2xl p-4" key={dispute.id}>
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div>
                      <h3 className="h5">Dispute #{dispute.id} · Booking #{dispute.bookingId}</h3>
                      <p>{dispute.reason}</p>
                      <p className="small text-on-surface-variant">Raised by {dispute.raisedByEmail} · {disputeStatus(dispute.status)} · Booking total {dispute.bookingTotalPrice}</p>
                    </div>
                    <form onSubmit={(event) => handleResolve(event, dispute.id)} className="flex-grow-1" style={{ maxWidth: 420 }}>
                      <label className="form-label" htmlFor={`resolution-${dispute.id}`}>Resolution notes</label>
                      <textarea
                        id={`resolution-${dispute.id}`}
                        className="form-control mb-2"
                        required
                        maxLength="2000"
                        value={resolution[dispute.id] ?? ''}
                        onChange={(event) => setResolution((current) => ({ ...current, [dispute.id]: event.target.value }))}
                      />
                      <button className="btn btn-primary" type="submit">Resolve dispute</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
