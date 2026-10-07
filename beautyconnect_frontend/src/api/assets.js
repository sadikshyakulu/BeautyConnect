const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin

export function getAssetUrl(path) {
  if (!path) return ''
  return new URL(path, apiOrigin).toString()
}
