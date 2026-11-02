import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPayoutBalances } from '../api/admin'
import AdminProfessionalAvatar from '../components/AdminProfessionalAvatar'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import { useAuth } from '../auth/useAuth'
import './AdminPanelPage.css'

export default function AdminPayoutsPage() {
  const { user } = useAuth()
  const isAdmin = typeof user?.role === 'number'
    ? user.role === 2
    : String(user?.role ?? '').toLowerCase() === 'admin'
  const [payoutBalances, setPayoutBalances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!isAdmin) return undefined

    let active = true
    getPayoutBalances()
      .then((balances) => {
        if (active) setPayoutBalances(balances ?? [])
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Payout balances could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  const totals = useMemo(() => payoutBalances?.reduce((result, balance) => ({
    customerPaymentsReceived: result.customerPaymentsReceived + Number(balance.customerPaymentsReceived ?? 0),
    platformCommission: result.platformCommission + Number(balance.platformCommission ?? 0),
    outstanding: result.outstanding
      + Number(balance.pending ?? 0)
      + Number(balance.available ?? 0)
      + Number(balance.requested ?? 0),
  }), {
    customerPaymentsReceived: 0,
    platformCommission: 0,
    outstanding: 0,
  }), [payoutBalances])

  if (!isAdmin) return null
  if (loading) return <div className="container py-5"><LoadingState label="Loading payout balances…" /></div>

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">FINANCE &amp; TRANSFERS</span>
          <h1 className="font-headline">Payout balances</h1>
          <p>Review customer payments, platform commission, and amounts owed to professionals.</p>
        </div>
        <Link className="btn btn-outline-primary" to="/admin">
          <span className="material-symbols-outlined me-1" aria-hidden="true">arrow_back</span>
          Platform overview
        </Link>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="admin-metric-grid" aria-label="Payout overview">
        {[
          ['Customer payments', totals?.customerPaymentsReceived, 'account_balance', 'sage', 'cash'],
          ['Platform commission', totals?.platformCommission, 'paid', 'gold', 'coin'],
          ['Payouts outstanding', totals?.outstanding, 'account_balance_wallet', 'plum', 'cash'],
        ].map(([label, amount, icon, tone, iconTone]) => (
          <article className={`admin-metric-card admin-metric-card--${tone}`} key={label}>
            <span className={`admin-metric-icon admin-metric-icon--${iconTone} icon-tone--${iconTone} material-symbols-outlined`} aria-hidden="true">{icon}</span>
            <span className="admin-metric-label">{label}</span>
            <strong><MoneyAmount value={amount} /></strong>
          </article>
        ))}
      </section>

      <section className="admin-payout-destination-grid" aria-label="Payout management pages">
        <Link className="admin-payout-destination admin-payout-destination--requests" to="/admin/payouts/requests">
          <span className="material-symbols-outlined icon-tone--warning" aria-hidden="true">pending_actions</span>
          <span>
            <strong>Payout requests</strong>
            <small>Review account details and record manual transfers.</small>
          </span>
          <span className="admin-queue-count">Open page</span>
        </Link>
        <Link className="admin-payout-destination admin-payout-destination--history" to="/admin/payouts/history">
          <span className="material-symbols-outlined" aria-hidden="true">history</span>
          <span>
            <strong>Payout history</strong>
            <small>View paid and rejected payout requests.</small>
          </span>
          <span className="admin-queue-count">Open page</span>
        </Link>
      </section>

      <section className="admin-queue-panel">
        <div className="admin-queue-heading">
          <div>
            <span className="admin-eyebrow">PROFESSIONAL BALANCES</span>
            <h2>Payments and payout balances</h2>
            <p>Amounts are grouped by professional. “Still owed” includes held, available, and requested earnings.</p>
          </div>
          <span className="admin-queue-total">{payoutBalances?.length ?? '—'} professionals</span>
        </div>
        {errorMessage ? (
          <div className="admin-empty-state" role="status">
            <strong>Professional balances could not be loaded</strong>
            <p>{errorMessage}</p>
          </div>
        ) : payoutBalances?.length === 0 ? (
          <div className="admin-empty-state">
            <span className="material-symbols-outlined icon-tone--cash" aria-hidden="true">account_balance_wallet</span>
            <strong>No professional balances</strong>
            <p>Verified payments and earnings will be summarized here.</p>
          </div>
        ) : (
          <div className="table-responsive admin-payout-balances-table">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Professional</th>
                  <th scope="col">Customer paid</th>
                  <th scope="col">Commission</th>
                  <th scope="col">Pending earnings</th>
                  <th scope="col">Available</th>
                  <th scope="col">Requested</th>
                  <th scope="col">Paid out</th>
                  <th scope="col">Still owed</th>
                </tr>
              </thead>
              <tbody>
                {payoutBalances?.map((balance) => (
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
                    <td><MoneyAmount value={balance.customerPaymentsReceived} /></td>
                    <td><MoneyAmount value={balance.platformCommission} /></td>
                    <td><MoneyAmount value={balance.pending} /></td>
                    <td><MoneyAmount value={balance.available} /></td>
                    <td><MoneyAmount value={balance.requested} /></td>
                    <td><MoneyAmount value={balance.paidOut} /></td>
                    <td><strong><MoneyAmount value={Number(balance.pending ?? 0) + Number(balance.available ?? 0) + Number(balance.requested ?? 0)} /></strong></td>
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
