import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPayoutQueue, markPayoutPaid, rejectPayout } from '../api/admin'
import AdminProfessionalAvatar from '../components/AdminProfessionalAvatar'
import LoadingState from '../components/LoadingState'
import MoneyAmount from '../components/MoneyAmount'
import EsewaLogo from '../components/EsewaLogo'
import { useAuth } from '../auth/useAuth'
import { notify } from '../utils/notifications'
import './AdminPanelPage.css'

export default function AdminPayoutRequestsPage() {
  const { user } = useAuth()
  const isAdmin = typeof user?.role === 'number'
    ? user.role === 2
    : String(user?.role ?? '').toLowerCase() === 'admin'
  const [requests, setRequests] = useState(null)
  const [payoutAction, setPayoutAction] = useState(null)
  const [processingPayoutId, setProcessingPayoutId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadRequests = useCallback(async () => {
    setErrorMessage('')
    try {
      setRequests(await getPayoutQueue() ?? [])
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Payout requests could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return undefined

    let active = true
    getPayoutQueue()
      .then((data) => {
        if (active) setRequests(data ?? [])
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Payout requests could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  function openPayoutAction(type, request) {
    setPayoutAction({ type, request, reference: '', notes: '', reason: '' })
  }

  async function submitPayoutAction(event) {
    event.preventDefault()
    if (!payoutAction) return

    const requestId = payoutAction.request.id
    const reference = payoutAction.reference.trim()
    const reason = payoutAction.reason.trim()
    if (payoutAction.type === 'paid' && !reference) {
      notify.error('Enter the transfer reference before marking this payout as paid.')
      return
    }
    if (payoutAction.type === 'rejected' && reason.length < 3) {
      notify.error('Enter a rejection reason with at least 3 characters.')
      return
    }

    setProcessingPayoutId(requestId)
    try {
      if (payoutAction.type === 'paid') {
        await markPayoutPaid(requestId, reference, payoutAction.notes.trim())
      } else {
        await rejectPayout(requestId, reason)
      }
      const actionType = payoutAction.type
      setPayoutAction(null)
      await loadRequests()
      notify.success(actionType === 'paid'
        ? 'Payout marked as paid.'
        : 'Payout request rejected; the earnings are available again.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not process this payout request.')
    } finally {
      setProcessingPayoutId(null)
    }
  }

  if (!isAdmin) return null
  if (loading) return <div className="container py-5"><LoadingState label="Loading payout requests…" /></div>

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">MANUAL TRANSFERS</span>
          <h1 className="font-headline">Payout requests</h1>
          <p>Review saved payout details, then record manual transfers or rejections.</p>
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
            <span className="admin-eyebrow">AWAITING REVIEW</span>
            <h2>Open requests</h2>
            <p>Each request covers the professional’s whole available balance.</p>
          </div>
          <span className="admin-queue-total">{requests?.length ?? '—'} awaiting review</span>
        </div>
        {errorMessage ? (
          <div className="admin-empty-state" role="status">
            <strong>Requests could not be loaded</strong>
            <p>{errorMessage}</p>
          </div>
        ) : requests?.length === 0 ? (
          <div className="admin-empty-state">
            <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
            <strong>No payout requests</strong>
            <p>New professional payout requests will appear here.</p>
          </div>
        ) : (
          <div className="admin-payout-list">
            {requests?.map((request) => (
              <article className="admin-payout-card" key={request.id}>
                <header className="admin-payout-header">
                  <div className="admin-payout-professional">
                    <AdminProfessionalAvatar name={request.professionalName} avatarUrl={request.professionalAvatarUrl} />
                    <div>
                      <span className="admin-eyebrow">REQUEST #{request.id}</span>
                      <h3>{request.professionalName}</h3>
                      <p>{request.professionalEmail}</p>
                    </div>
                  </div>
                  <strong className="admin-payout-amount"><MoneyAmount value={request.amount} /></strong>
                </header>
                <dl className="admin-payout-details">
                  <div><dt>Bookings covered</dt><dd>Whole available balance</dd></div>
                  <div>
                    <dt>Method</dt>
                    <dd>{request.payoutMethod.toLowerCase() === 'esewa' ? <EsewaLogo compact /> : request.payoutMethod}</dd>
                  </div>
                  <div><dt>Account name</dt><dd>{request.accountName}</dd></div>
                  <div><dt>Account number</dt><dd>{request.accountNumber}</dd></div>
                  {request.bankName && <div><dt>Bank</dt><dd>{request.bankName}</dd></div>}
                  <div><dt>Requested</dt><dd>{new Date(request.requestedAt).toLocaleString()}</dd></div>
                </dl>
                <div className="admin-payout-actions">
                  <button className="btn btn-primary btn-sm" type="button" disabled={processingPayoutId === request.id} onClick={() => openPayoutAction('paid', request)}>
                    {request.payoutMethod.toLowerCase() === 'esewa'
                      ? <EsewaLogo compact iconOnly inverse />
                      : <span className="material-symbols-outlined me-1 admin-action-icon--cash icon-tone--cash" aria-hidden="true">account_balance</span>}
                    Mark as paid
                  </button>
                  <button className="btn btn-outline-danger btn-sm" type="button" disabled={processingPayoutId === request.id} onClick={() => openPayoutAction('rejected', request)}>
                    <span className="material-symbols-outlined me-1 admin-action-icon--reject" aria-hidden="true">block</span>
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {payoutAction && (
        <div
          className="admin-payout-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && processingPayoutId === null) setPayoutAction(null)
          }}
        >
          <section className="admin-payout-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-payout-dialog-title">
            <header>
              <div>
                <span className="admin-eyebrow">REQUEST #{payoutAction.request.id}</span>
                <h2 id="admin-payout-dialog-title">
                  {payoutAction.type === 'paid' ? 'Confirm payout transfer' : 'Confirm payout rejection'}
                </h2>
              </div>
              <button className="btn-close professional-modal-control" type="button" aria-label="Close dialog" disabled={processingPayoutId !== null} onClick={() => setPayoutAction(null)} />
            </header>
            <p>
              {payoutAction.type === 'paid'
                ? <>Mark <strong><MoneyAmount value={payoutAction.request.amount} /></strong> for {payoutAction.request.professionalName} as paid.</>
                : <>Reject this <strong><MoneyAmount value={payoutAction.request.amount} /></strong> request. Its eligible earnings will return to the professional’s available balance.</>}
            </p>
            <form onSubmit={submitPayoutAction}>
              {payoutAction.type === 'paid' ? (
                <>
                  <label className="form-label" htmlFor="payout-transfer-reference">Transfer reference</label>
                  <input className="form-control mb-3" id="payout-transfer-reference" required maxLength="200" value={payoutAction.reference} onChange={(event) => setPayoutAction((current) => ({ ...current, reference: event.target.value }))} />
                  <label className="form-label" htmlFor="payout-transfer-notes">Notes (optional)</label>
                  <textarea className="form-control" id="payout-transfer-notes" rows="3" maxLength="1000" value={payoutAction.notes} onChange={(event) => setPayoutAction((current) => ({ ...current, notes: event.target.value }))} />
                </>
              ) : (
                <>
                  <label className="form-label" htmlFor="payout-rejection-reason">Reason for rejection</label>
                  <textarea className="form-control" id="payout-rejection-reason" rows="3" minLength="3" maxLength="1000" required value={payoutAction.reason} onChange={(event) => setPayoutAction((current) => ({ ...current, reason: event.target.value }))} />
                </>
              )}
              <div className="admin-payout-dialog-actions">
                <button className="btn btn-outline-secondary" type="button" disabled={processingPayoutId !== null} onClick={() => setPayoutAction(null)}>Cancel</button>
                <button className={`btn ${payoutAction.type === 'paid' ? 'btn-primary' : 'btn-danger'}`} type="submit" disabled={processingPayoutId !== null}>
                  {processingPayoutId !== null ? 'Saving…' : payoutAction.type === 'paid' ? 'Confirm paid' : 'Confirm rejection'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
