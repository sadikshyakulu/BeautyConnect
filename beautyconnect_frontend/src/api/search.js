import client from './client'

export async function getProfessionals(filters = {}) {
  const { data } = await client.get('/Search/professionals', { params: filters })
  return data
}

export async function getProfessionalById(professionalId) {
  try {
    const { data } = await client.get(`/ProfessionalProfile/${professionalId}`)
    return {
      ...data,
      matchingServices: data.services ?? [],
    }
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
