import './VerifiedBadge.css'

export default function VerifiedBadge({ className = '' }) {
  return (
    <span
      className={`verified-badge${className ? ` ${className}` : ''}`}
      role="img"
      aria-label="Verified professional"
      title="Verified professional"
    >
      <span className="material-symbols-outlined" aria-hidden="true">verified</span>
    </span>
  )
}
