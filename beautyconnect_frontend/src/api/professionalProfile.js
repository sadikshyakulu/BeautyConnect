import client from './client'

export async function getMyProfile() {
  const { data } = await client.get('/ProfessionalProfile/me')
  return data
}

export async function updateMyProfile(profile) {
  const { data } = await client.put('/ProfessionalProfile/me', profile)
  return data
}

export async function addService(service) {
  const { data } = await client.post('/ProfessionalProfile/services', service)
  return data
}

export async function updateService(serviceId, service) {
  const { data } = await client.put(`/ProfessionalProfile/services/${serviceId}`, service)
  return data
}

export async function uploadPortfolioImage(image) {
  const formData = new FormData()
  formData.append('image', image)

  const { data } = await client.post('/ProfessionalProfile/portfolio/images', formData)
  return data
}

export async function submitForVerification() {
  const { data } = await client.post('/ProfessionalProfile/submit-verification')
  return data
}
