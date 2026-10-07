import client from './client'

export async function initiatePayment(bookingId) {
  const { data } = await client.post(`/Payment/initiate/${bookingId}`)
  return data
}

export async function getPaymentSuccess(data) {
  const { data: result } = await client.get('/Payment/success', { params: { data } })
  return result
}

export async function getPaymentFailure(transactionUuid) {
  const { data } = await client.get('/Payment/failure', {
    params: { transaction_uuid: transactionUuid },
  })
  return data
}

export async function getPaymentStatus(transactionUuid) {
  const { data } = await client.get(
    `/Payment/status/${encodeURIComponent(transactionUuid)}`,
  )
  return data
}
