import client from './client'

export async function getMyAvailability() {
  const { data } = await client.get('/Availability/me')
  return data
}

export async function createAvailability(availability) {
  const { data } = await client.post('/Availability', availability)
  return data
}

export async function updateAvailability(availabilityId, availability) {
  const { data } = await client.put(`/Availability/${availabilityId}`, availability)
  return data
}

export async function getOpenSlots(professionalProfileId, date) {
  const { data } = await client.get(
    `/Availability/professionals/${professionalProfileId}/open-slots`,
    { params: { date } },
  )
  return data
}
