import axios from 'axios'

const accessTokenStorageKey = 'beautyconnect.accessToken'
let accessToken = typeof window === 'undefined'
  ? null
  : window.sessionStorage.getItem(accessTokenStorageKey)
let refreshPromise = null

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url = originalRequest?.url ?? ''
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/refresh')

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = client
          .post('/auth/refresh')
          .then(({ data }) => {
            setAccessToken(data.accessToken)
            return accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const refreshedAccessToken = await refreshPromise
      originalRequest.headers.set('Authorization', `Bearer ${refreshedAccessToken}`)
      return client(originalRequest)
    } catch (refreshError) {
      setAccessToken(null)
      return Promise.reject(refreshError)
    }
  },
)

export function setAccessToken(token) {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      window.sessionStorage.setItem(accessTokenStorageKey, token)
    } else {
      window.sessionStorage.removeItem(accessTokenStorageKey)
    }
  }
}

export function getAccessToken() {
  return accessToken
}

export default client
