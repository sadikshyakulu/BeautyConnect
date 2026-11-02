import { FaWhatsapp } from 'react-icons/fa'
import LocationMapPreview from './LocationMapPreview'

export default function BookingLocationDetails({
  location,
  contactPhone,
  contactLabel = 'Customer',
  addressLabel = 'Customer address',
}) {
  const phone = contactPhone === undefined ? location?.contactPhone : contactPhone
  const phoneDigits = phone?.replace(/\D/g, '')
  const whatsappUrl = phone?.trim().startsWith('+') && phoneDigits
    ? `https://wa.me/${phoneDigits}`
    : null
  const contactActions = [
    phone && (
      <a key="phone" className="booking-location-action booking-location-phone" href={`tel:${phone}`}>
        <span className="material-symbols-outlined icon-tone--info" aria-hidden="true">call</span>
        <span>Call</span>
        <strong>{phone}</strong>
      </a>
    ),
    whatsappUrl && (
      <a key="whatsapp" className="booking-location-action booking-location-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
        <FaWhatsapp aria-hidden="true" />
        WhatsApp
      </a>
    ),
  ]

  if (!location && !phone) {
    return <p className="small text-on-surface-variant mt-2 mb-0">Location not recorded</p>
  }

  const hasCoordinates = location
    && Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : null

  if (!location) {
    return (
      <section className="booking-location-details" aria-label={`Contact ${contactLabel.toLowerCase()}`}>
        <header className="booking-location-heading">
          <div>
            <p className="professional-booking-kicker mb-1">{contactLabel} contact</p>
            <h4 className="h6 mb-0">{contactLabel}</h4>
          </div>
          <div className="booking-location-actions" aria-label={`Contact ${contactLabel.toLowerCase()}`}>
            {contactActions}
          </div>
        </header>
        <p className="small text-on-surface-variant mb-0">Location not recorded</p>
      </section>
    )
  }

  return (
    <section className="booking-location-details" aria-label="Service location">
      <header className="booking-location-heading">
        <div>
          <p className="professional-booking-kicker mb-1">{addressLabel}</p>
          <h4 className="h6 mb-0">
            <span className="material-symbols-outlined icon-tone--location" aria-hidden="true">location_on</span>
            {[location.addressLine, location.city].filter(Boolean).join(', ') || 'Service location'}
          </h4>
        </div>
        <div className="booking-location-actions" aria-label={`Contact ${contactLabel.toLowerCase()} or navigate`}>
          {contactActions}
          {directionsUrl && (
            <a className="booking-location-action booking-location-directions" href={directionsUrl} target="_blank" rel="noreferrer">
              <span className="material-symbols-outlined" aria-hidden="true">directions</span>
              Get directions
            </a>
          )}
        </div>
      </header>
      {location.landmark && (
        <p className="booking-location-landmark">
          <strong>Arrival directions:</strong> {location.landmark}
        </p>
      )}
      {hasCoordinates && <LocationMapPreview location={location} showAddress={false} showDirections={false} />}
    </section>
  )
}
