import { useState } from 'react'
import { getAssetUrl } from '../api/assets'

export default function AdminProfessionalAvatar({ name, avatarUrl, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase()
  const className = `admin-payout-avatar${compact ? ' admin-payout-avatar--table' : ''}`

  if (avatarUrl && !imageFailed) {
    return (
      <img
        className={className}
        src={getAssetUrl(avatarUrl)}
        alt=""
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <span className={`${className} admin-payout-avatar--fallback`} aria-hidden="true">
      {initials || 'BC'}
    </span>
  )
}
