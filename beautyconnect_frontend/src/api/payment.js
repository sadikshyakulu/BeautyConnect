import client from './client'

export async function initiatePayment(paymentRequest) {
  const { data } = await client.post('/Payment/initiate', paymentRequest)
  return data
}

export async function refreshPayment(transactionUuid) {
  const { data } = await client.post(
    `/Payment/initiate/${encodeURIComponent(transactionUuid)}/refresh`,
  )
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

export async function verifyBookingRefund(bookingId) {
  const { data } = await client.post(
    `/Payment/bookings/${bookingId}/refund/verify`,
  )
  return data
}
