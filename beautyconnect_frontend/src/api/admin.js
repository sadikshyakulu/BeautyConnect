import client from './client'

export async function getPendingVerifications() {
  const { data } = await client.get('/Admin/verifications/pending')
  return data
}

export async function approveProfessional(profileId) {
  const { data } = await client.post(`/Admin/verifications/${profileId}/approve`)
  return data
}

export async function rejectProfessional(profileId) {
  const { data } = await client.post(`/Admin/verifications/${profileId}/reject`)
  return data
}

export async function getOpenDisputes() {
  const { data } = await client.get('/Admin/disputes/open')
  return data
}

export async function resolveDispute(disputeId, resolutionNotes) {
  const { data } = await client.post(`/Admin/disputes/${disputeId}/resolve`, {
    resolutionNotes,
  })
  return data
}

export async function getAnalytics() {
  const { data } = await client.get('/Admin/analytics')
  return data
}

export async function getRecentActivity() {
  const { data } = await client.get('/Admin/recent-activity')
  return data
}

export async function getCustomers() {
  const { data } = await client.get('/Admin/customers')
  return data
}

export async function getAdminProfessionals() {
  const { data } = await client.get('/Admin/professionals')
  return data
}

export async function getPayoutQueue() {
  const { data } = await client.get('/Admin/payouts/queue')
  return data
}

export async function getPayoutHistory() {
  const { data } = await client.get('/Admin/payouts/history')
  return data
}

export async function getPayoutBalances() {
  const { data } = await client.get('/Admin/payouts/balances')
  return data
}

export async function markPayoutPaid(requestId, reference, notes) {
  const { data } = await client.post(`/Admin/payouts/${requestId}/mark-paid`, {
    reference,
    notes: notes || null,
  })
  return data
}

export async function rejectPayout(requestId, reason) {
  const { data } = await client.post(`/Admin/payouts/${requestId}/reject`, { reason })
  return data
}
