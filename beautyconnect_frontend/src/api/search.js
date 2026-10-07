import client from './client'

export async function getProfessionals(filters = {}) {
  const { data } = await client.get('/Search/professionals', { params: filters })
  return data
}

export async function getProfessionalById(professionalId) {
  const pageSize = 100
  const firstPage = await getProfessionals({ page: 1, pageSize })
  const match = firstPage.results?.find((professional) => professional.id === Number(professionalId))
  if (match) return match

  const pages = Math.ceil((firstPage.totalCount ?? 0) / pageSize)
  for (let page = 2; page <= pages; page += 1) {
    const result = await getProfessionals({ page, pageSize })
    const professional = result.results?.find((item) => item.id === Number(professionalId))
    if (professional) return professional
  }

  return null
}
