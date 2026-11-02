import './EsewaLogo.css'

export default function EsewaLogo({ compact = false, iconOnly = false, inverse = false }) {
  const className = [
    'esewa-logo',
    compact && 'esewa-logo--compact',
    iconOnly && 'esewa-logo--icon-only',
    inverse && 'esewa-logo--inverse',
  ].filter(Boolean).join(' ')

  return (
    <span className={className} role="img" aria-label="eSewa">
      <img src="/esewa.png" alt="" />
      {!iconOnly && <span>Sewa</span>}
    </span>
  )
}
