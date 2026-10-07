import client from './client'

export async function createReview(review) {
  const { data } = await client.post('/Review', review)
  return data
}

export async function getReviewsForProfessional(professionalProfileId) {
  const { data } = await client.get(`/Review/professionals/${professionalProfileId}`)
  return data
}
