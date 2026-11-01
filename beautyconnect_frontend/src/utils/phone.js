export const NEPAL_PHONE_PREFIX = '+977 '

export function withNepalPhonePrefix(value) {
  const phone = value?.trim() ?? ''
  if (!phone) return NEPAL_PHONE_PREFIX
  if (phone.startsWith('+')) return phone
  if (phone.startsWith('977')) return `+${phone}`
  return `${NEPAL_PHONE_PREFIX}${phone}`
}
