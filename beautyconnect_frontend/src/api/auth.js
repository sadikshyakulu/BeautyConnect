import client, { setAccessToken } from './client'

let sessionRefreshPromise = null

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  setAccessToken(data.accessToken)
  return data
}

export async function register(userData) {
  const { data } = await client.post('/auth/register', userData)
  setAccessToken(data.accessToken)
  return data
}

export async function logout() {
  try {
    const { data } = await client.post('/auth/logout')
    return data
  } finally {
    setAccessToken(null)
  }
}

export async function getCurrentUser() {
  const { data } = await client.get('/auth/me')
  return data
}

export async function refreshSession() {
  if (!sessionRefreshPromise) {
    sessionRefreshPromise = client
      .post('/auth/refresh')
      .then(({ data }) => {
        setAccessToken(data.accessToken)
        return data
      })
      .finally(() => {
        sessionRefreshPromise = null
      })
  }
  return sessionRefreshPromise
}
