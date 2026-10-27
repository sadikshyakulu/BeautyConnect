import client from './client'

export async function createReview(review) {
  const { data } = await client.post('/Review', review)
  return data
}

export async function getReviewsForProfessional(professionalProfileId) {
  const { data } = await client.get(`/Review/professionals/${professionalProfileId}`)
  return data
}

export function aggregateServiceRatings(reviews) {
  return (reviews ?? []).reduce((ratingsByService, review) => {
    const serviceId = Number(review.serviceId ?? review.ServiceId)
    const rating = Number(review.rating ?? review.Rating)
    const serviceName = (review.serviceName ?? review.ServiceName)?.trim().toLocaleLowerCase()
    const serviceKey = Number.isFinite(serviceId) ? `id:${serviceId}` : serviceName ? `name:${serviceName}` : null
    if (!serviceKey || !Number.isFinite(rating)) return ratingsByService

    const aggregate = ratingsByService.get(serviceKey) ?? { total: 0, count: 0 }
    aggregate.total += rating
    aggregate.count += 1
    ratingsByService.set(serviceKey, aggregate)
    return ratingsByService
  }, new Map())
}

export function serviceRatingKey(service) {
  return `id:${service.id}`
}

export function getReviewAvatarUrl(review, currentUser) {
  const apiAvatarUrl = review.customerAvatarUrl ?? review.CustomerAvatarUrl
  if (apiAvatarUrl) return apiAvatarUrl

  const reviewerName = review.customerName?.trim().toLocaleLowerCase()
  const currentCustomerName = currentUser?.profile?.fullName?.trim().toLocaleLowerCase()
  return reviewerName && reviewerName === currentCustomerName
    ? currentUser.profile.avatarUrl
    : null
}
