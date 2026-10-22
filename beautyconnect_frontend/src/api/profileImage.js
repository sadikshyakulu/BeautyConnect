import client from './client'

export async function uploadAvatar(image) {
  const formData = new FormData()
  formData.append('image', image)
  const { data } = await client.post('/ProfileImage/avatar', formData)
  return data
}
