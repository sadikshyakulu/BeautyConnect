import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPayoutHistory } from '../api/admin'
import AdminProfessionalAvatar from '../components/AdminProfessionalAvatar'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import { useAuth } from '../auth/useAuth'
import './AdminPanelPage.css'

export default function AdminPayoutHistoryPage() {
  const { user } = useAuth()
  const isAdmin = typeof user?.role === 'number'
    ? user.role === 2
    : String(user?.role ?? '').toLowerCase() === 'admin'
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAdmin) return undefined

    let active = true
    getPayoutHistory()
      .then((data) => {
        if (active) setHistory(data ?? [])
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Payout history could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  if (!isAdmin) return null
  if (loading) return <div className="container py-5"><LoadingState label="Loading payout history…" /></div>

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">COMPLETED REVIEWS</span>
          <h1 className="font-headline">Payout history</h1>
          <p>Review completed payout transfers and rejected requests.</p>
        </div>
        <Link className="btn btn-outline-primary" to="/admin/payouts">
          <span className="material-symbols-outlined me-1" aria-hidden="true">arrow_back</span>
          Payout balances
        </Link>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="admin-queue-panel">
        <div className="admin-queue-heading">
          <div>
            <span className="admin-eyebrow">PROCESSED PAYOUTS</span>
            <h2>History</h2>
          </div>
          <span className="admin-queue-total">{history?.length ?? '—'} processed</span>
        </div>
        {errorMessage ? (
          <div className="admin-empty-state" role="status">
            <strong>Payout history could not be loaded</strong>
            <p>{errorMessage}</p>
          </div>
        ) : history?.length === 0 ? (
          <div className="admin-empty-state">
            <span className="material-symbols-outlined" aria-hidden="true">history</span>
            <strong>No processed payouts yet</strong>
            <p>Paid and rejected payout requests will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Professional</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col">Processed</th>
                  <th scope="col">Reference / result</th>
                </tr>
              </thead>
              <tbody>
                {history?.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div className="admin-payout-professional admin-payout-professional--table">
                        <AdminProfessionalAvatar
                          name={request.professionalName}
                          avatarUrl={request.professionalAvatarUrl}
                          compact
                        />
                        <span>{request.professionalName}</span>
                      </div>
                    </td>
                    <td><MoneyAmount value={request.amount} /></td>
                    <td>
                      <span className={`admin-payout-status admin-payout-status--${request.status.toLowerCase()}`}>
                        <span className={`material-symbols-outlined ${request.status.toLowerCase() === 'paid' ? 'icon-tone--success' : 'icon-tone--danger'}`} aria-hidden="true">
                          {request.status.toLowerCase() === 'paid' ? 'paid' : 'cancel'}
                        </span>
                        {request.status}
                      </span>
                    </td>
                    <td>{request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '—'}</td>
                    <td>{request.reference || request.rejectionReason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
