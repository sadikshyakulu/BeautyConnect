import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyPayoutDetails, getMyPayoutRequests, getPayoutSummary, requestPayout } from '../api/payout'
import EsewaLogo from '../components/EsewaLogo'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import { notify } from '../utils/notifications'
import { useAuth } from '../auth/useAuth'
import './ProfessionalPayoutsPage.css'

const minimumPayoutAmount = 500

export default function ProfessionalPayoutsPage() {
  const { user } = useAuth()
  const isProfessional = typeof user?.role === 'number'
    ? user.role === 1
    : String(user?.role ?? '').toLowerCase() === 'professional'
  const [summary, setSummary] = useState(null)
  const [payoutDetails, setPayoutDetails] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadPayoutData = useCallback(async () => {
    setErrorMessage('')
    const results = await Promise.allSettled([
      getPayoutSummary(),
      getMyPayoutDetails(),
      getMyPayoutRequests(),
    ])
    if (results[0].status === 'fulfilled') setSummary(results[0].value)
    if (results[1].status === 'fulfilled') setPayoutDetails(results[1].value)
    if (results[2].status === 'fulfilled') setRequests(results[2].value ?? [])
    const failures = results
      .filter((result) => result.status === 'rejected')
      .map((result) => result.reason.response?.data?.message ?? 'Some payout information could not be loaded.')
    if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
  }, [])

  useEffect(() => {
    if (!isProfessional) return undefined

    let active = true
    Promise.allSettled([
      getPayoutSummary(),
      getMyPayoutDetails(),
      getMyPayoutRequests(),
    ])
      .then((results) => {
        if (!active) return
        if (results[0].status === 'fulfilled') setSummary(results[0].value)
        if (results[1].status === 'fulfilled') setPayoutDetails(results[1].value)
        if (results[2].status === 'fulfilled') setRequests(results[2].value ?? [])
        const failures = results
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason.response?.data?.message ?? 'Some payout information could not be loaded.')
        if (failures.length) setErrorMessage([...new Set(failures)].join(' '))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isProfessional])

  const openRequest = requests.find((request) => String(request.status).toLowerCase() === 'requested')
  const available = Number(summary?.available ?? 0)
  const detailsSaved = Boolean(
    payoutDetails?.maskedAccountNumber
    && payoutDetails?.payoutMethod
    && payoutDetails?.accountName,
  )
  const requestDisabledReason = !detailsSaved
    ? 'Add and save payout details in your studio profile before requesting a payout.'
    : openRequest
      ? 'You already have a payout request waiting for review.'
      : available < minimumPayoutAmount
        ? 'Your available balance must be at least NPR 500 to request a payout.'
        : ''

  async function handleRequestPayout() {
    setRequesting(true)
    try {
      await requestPayout()
      await loadPayoutData()
      notify.success('Your payout request has been submitted.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not request a payout.')
    } finally {
      setRequesting(false)
    }
  }

  if (!isProfessional) return null
  if (loading) return <div className="container py-5"><LoadingState label="Loading payout details…" /></div>

  return (
    <div className="professional-payouts-page">
      <header className="professional-payouts-hero">
        <div>
          <span className="professional-payouts-eyebrow">EARNINGS &amp; TRANSFERS</span>
          <h1 className="font-headline">Payouts</h1>
          <p>Review your earnings, payout account, and transfer history.</p>
        </div>
        <Link className="btn btn-outline-primary" to="/dashboard/professional">
          <span className="material-symbols-outlined me-1" aria-hidden="true">arrow_back</span>
          Studio overview
        </Link>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

      <section className="professional-payouts-metrics" aria-label="Payout balances">
        {[
          ['Pending earnings', summary?.pending, 'hourglass_top', 'warning'],
          ['Available', summary?.available, 'account_balance_wallet', 'cash'],
          ['Requested', summary?.requested, 'pending_actions', 'warning'],
          ['Paid out', summary?.paidOut, 'paid', 'coin'],
        ].map(([label, amount, icon, tone]) => (
          <article className="professional-payouts-metric" key={label}>
            <span className={`material-symbols-outlined icon-tone--${tone}`} aria-hidden="true">{icon}</span>
            <small>{label}</small>
            <strong><MoneyAmount value={amount} /></strong>
          </article>
        ))}
      </section>

      <section className="professional-payouts-panel" aria-labelledby="payout-request-heading">
        <div className="professional-payouts-panel-header">
          <div>
            <span className="professional-payouts-eyebrow">PAYOUT REQUEST</span>
            <h2 id="payout-request-heading">Request a transfer</h2>
            <p>Completed, undisputed bookings become available immediately. Request your full available balance at NPR 500 or more; an admin will review and transfer it.</p>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            disabled={requesting || Boolean(requestDisabledReason)}
            title={requestDisabledReason || undefined}
            onClick={handleRequestPayout}
          >
            {requesting ? 'Requesting…' : 'Request payout'}
          </button>
        </div>
        {requestDisabledReason && <p className="professional-payouts-status-note" role="status">{requestDisabledReason}</p>}
        {openRequest && (
          <p className="professional-payouts-open-request" role="status">
            <span className="material-symbols-outlined" aria-hidden="true">pending_actions</span>
            Request #{openRequest.id} is awaiting admin review.
          </p>
        )}
      </section>

      <section className="professional-payouts-panel" aria-labelledby="payout-account-heading">
        <div className="professional-payouts-panel-header">
          <div>
            <span className="professional-payouts-eyebrow">TRANSFER DESTINATION</span>
            <h2 id="payout-account-heading">Payout account</h2>
          </div>
          <Link className="btn btn-outline-primary" to="/dashboard/professional/studio">
            Manage account
          </Link>
        </div>
        {detailsSaved ? (
          <dl className="professional-payouts-account">
            <div>
              <dt>Method</dt>
              <dd>
                {payoutDetails.payoutMethod.toLowerCase() === 'esewa'
                  ? <EsewaLogo compact />
                  : payoutDetails.payoutMethod}
              </dd>
            </div>
            <div><dt>Account name</dt><dd>{payoutDetails.accountName}</dd></div>
            <div><dt>Account number</dt><dd>{payoutDetails.maskedAccountNumber}</dd></div>
            {payoutDetails.bankName && <div><dt>Bank</dt><dd>{payoutDetails.bankName}</dd></div>}
          </dl>
        ) : (
          <p className="professional-payouts-status-note mb-0">
            No payout account is saved yet. Add one in your studio profile before requesting a transfer.
          </p>
        )}
      </section>

      <section className="professional-payouts-panel" aria-labelledby="payout-history-heading">
        <div className="professional-payouts-panel-header">
          <div>
            <span className="professional-payouts-eyebrow">ALL TRANSFERS</span>
            <h2 id="payout-history-heading">Payout history</h2>
          </div>
          <span className="professional-payouts-count">{requests.length} records</span>
        </div>
        {requests.length === 0 ? (
          <div className="professional-payouts-empty">
            <span className="material-symbols-outlined" aria-hidden="true">receipt_long</span>
            <strong>No payout history yet</strong>
            <p>Your payout requests and transfers will appear here.</p>
          </div>
        ) : (
          <div className="table-responsive professional-payouts-table">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Requested</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment method</th>
                  <th scope="col">Status</th>
                  <th scope="col">Reference / result</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                    <td className="professional-payout-amount"><MoneyAmount value={request.amount} /></td>
                    <td>
                      {request.payoutMethod?.toLowerCase() === 'esewa'
                        ? <EsewaLogo compact />
                        : request.payoutMethod || '—'}
                    </td>
                    <td>
                      <span className={`professional-payouts-status professional-payouts-status--${String(request.status).toLowerCase()}`}>
                        {request.status}
                      </span>
                    </td>
                    <td>
                      {request.reference && <div>Reference: {request.reference}</div>}
                      {request.rejectionReason && <div>Reason: {request.rejectionReason}</div>}
                      {!request.reference && !request.rejectionReason && '—'}
                    </td>
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
