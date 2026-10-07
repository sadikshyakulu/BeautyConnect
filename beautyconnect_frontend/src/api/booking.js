import client from './client'

export async function getCustomerBookings() {
  const { data } = await client.get('/Booking/customer')
  return data
}

export async function getIncomingBookings() {
  const { data } = await client.get('/Booking/professional/incoming')
  return data
}

export async function acceptBooking(bookingId) {
  const { data } = await client.post(`/Booking/${bookingId}/accept`)
  return data
}

export async function rejectBooking(bookingId) {
  const { data } = await client.post(`/Booking/${bookingId}/reject`)
  return data
}

export async function completeBooking(bookingId) {
  const { data } = await client.post(`/Booking/${bookingId}/complete`)
  return data
}

export async function cancelBooking(bookingId) {
  const { data } = await client.post(`/Booking/${bookingId}/cancel`)
  return data
}
