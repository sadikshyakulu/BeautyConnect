import { LayersControl, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { locationMarkerIcon } from './leafletIcon'
import './LocationMap.css'

export default function LocationMapPreview({
  location,
  showAddress = true,
  showDirections = true,
}) {
  const hasCoordinates = Number.isFinite(location?.latitude)
    && Number.isFinite(location?.longitude)
  const address = [location?.addressLine, location?.city].filter(Boolean).join(', ')

  if (!hasCoordinates) {
    return (
      <div className="location-preview-no-map">
        <span className="material-symbols-outlined" aria-hidden="true">map</span>
        <p className="small mb-0">
          {address || 'Location not recorded'}
          <span className="d-block text-on-surface-variant mt-1">Map coordinates are unavailable for this booking.</span>
        </p>
      </div>
    )
  }

  const position = [location.latitude, location.longitude]
  const displayAddress = address || 'Service location'
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`

  return (
    <div className="location-map-preview">
      <div className="location-preview-caption">
        {showAddress && <span className="location-preview-address">{displayAddress}</span>}
        {showDirections && (
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="location-preview-directions">
            <span className="material-symbols-outlined" aria-hidden="true">directions</span>
            Get directions
          </a>
        )}
      </div>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        zoomControl={false}
        maxZoom={21}
        className="location-preview-map"
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxNativeZoom={19}
              maxZoom={21}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxNativeZoom={19}
              maxZoom={21}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <Marker position={position} icon={locationMarkerIcon} />
      </MapContainer>
    </div>
  )
}
