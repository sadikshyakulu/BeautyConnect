import client from './client'

export async function getPayoutSummary() {
  const { data } = await client.get('/Payout/summary')
  return data
}

export async function getMyPayoutRequests() {
  const { data } = await client.get('/Payout/my-requests')
  return data
}

export async function requestPayout() {
  const { data } = await client.post('/Payout/request')
  return data
}

export async function getMyPayoutDetails() {
  const { data } = await client.get('/Professional/payout-details')
  return data
}

export async function updateMyPayoutDetails(details) {
  const { data } = await client.put('/Professional/payout-details', details)
  return data
}
