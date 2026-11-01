const DEFAULT_GEOCODER_URL = 'https://nominatim.openstreetmap.org'
const searchCache = new Map()
const reverseCache = new Map()
let lastRequestAt = 0
let requestQueue = Promise.resolve()

function getGeocoderUrl() {
  return (import.meta.env.VITE_GEOCODER_URL || DEFAULT_GEOCODER_URL).replace(/\/+$/, '')
}

function formatAddressLine(address, fallback) {
  const parts = [
    address.house_number,
    address.road,
    address.residential,
    address.neighbourhood,
    address.suburb,
  ].filter(Boolean)

  return parts.length > 0 ? [...new Set(parts)].join(', ') : fallback
}

function getCity(address) {
  return address.city
    ?? address.town
    ?? address.village
    ?? address.municipality
    ?? address.county
    ?? address.state_district
    ?? ''
}

async function requestJson(path, parameters, cache, cacheKey) {
  if (cache.has(cacheKey)) return cache.get(cacheKey)

  const request = requestQueue.then(async () => {
    const delay = Math.max(0, 1000 - (Date.now() - lastRequestAt))
    if (delay > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delay))
    }

    lastRequestAt = Date.now()
    const url = new URL(`${getGeocoderUrl()}${path}`)
    Object.entries(parameters).forEach(([key, value]) => url.searchParams.set(key, value))
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}.`)
    }
    return response.json()
  })

  requestQueue = request.then(() => undefined, () => undefined)
  const result = await request
  cache.set(cacheKey, result)
  return result
}

export async function searchAddress(query) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return []

  const results = await requestJson('/search', {
    q: normalizedQuery,
    countrycodes: 'np',
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  }, searchCache, normalizedQuery.toLocaleLowerCase())

  return results.map((result) => ({
    displayName: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    addressLine: formatAddressLine(result.address ?? {}, result.display_name),
    city: getCity(result.address ?? {}),
  }))
}

export async function reverseGeocode(latitude, longitude) {
  const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`
  const result = await requestJson('/reverse', {
    lat: String(latitude),
    lon: String(longitude),
    format: 'jsonv2',
    addressdetails: '1',
  }, reverseCache, cacheKey)

  return {
    addressLine: formatAddressLine(result.address ?? {}, result.display_name ?? ''),
    city: getCity(result.address ?? {}),
  }
}
