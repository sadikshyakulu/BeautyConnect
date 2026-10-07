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
