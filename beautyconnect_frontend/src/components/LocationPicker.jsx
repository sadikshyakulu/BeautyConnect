import { useEffect, useMemo, useState } from 'react'
import { LayersControl, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { reverseGeocode, searchAddress } from '../api/geocode'
import { locationMarkerIcon } from './leafletIcon'
import './LocationMap.css'

const DEFAULT_CENTER = [27.7172, 85.3240]

function MapView({ position }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 13))
  }, [map, position])

  return null
}

function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 0)
    return () => window.clearTimeout(timer)
  }, [map])

  return null
}

function MapClickHandler({ onPlace }) {
  useMapEvents({
    click(event) {
      onPlace(event.latlng.lat, event.latlng.lng)
    },
  })

  return null
}

export default function LocationPicker({ location, onChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [reverseTarget, setReverseTarget] = useState(null)
  const hasCoordinates = Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
  const position = useMemo(
    () => hasCoordinates ? [location.latitude, location.longitude] : DEFAULT_CENTER,
    [hasCoordinates, location.latitude, location.longitude],
  )

  useEffect(() => {
    if (!reverseTarget) return undefined

    const timer = window.setTimeout(async () => {
      try {
        const result = await reverseGeocode(reverseTarget.latitude, reverseTarget.longitude)
        const updates = {
          latitude: reverseTarget.latitude,
          longitude: reverseTarget.longitude,
        }
        if (result.addressLine) updates.addressLine = result.addressLine
        if (result.city) updates.city = result.city
        onChange(updates)
        setMessage('')
      } catch {
        setMessage('Could not look up this address. You can enter the address and city manually.')
      }
    }, 600)

    return () => window.clearTimeout(timer)
  }, [onChange, reverseTarget])

  function placePin(latitude, longitude) {
    onChange({ latitude, longitude })
    setReverseTarget({ latitude, longitude })
  }

  async function handleAddressSearch() {
    if (!searchQuery.trim()) {
      setMessage('Enter an address to search.')
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setMessage('')
    setSearchResults([])
    try {
      const results = await searchAddress(searchQuery)
      const validResults = results.filter((item) =>
        Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
      )
      if (validResults.length === 0) {
        setMessage('No matching address found. You can place the pin on the map or enter the address manually.')
        return
      }

      setSearchResults(validResults)
      setMessage(`Found ${validResults.length} matching ${validResults.length === 1 ? 'place' : 'places'}. Select one to place the pin.`)
    } catch {
      setMessage('Address search is temporarily unavailable. Check your connection, or place the pin and enter the address manually.')
    } finally {
      setIsSearching(false)
    }
  }

  function selectSearchResult(result) {
    onChange({
      latitude: result.latitude,
      longitude: result.longitude,
      addressLine: result.addressLine,
      city: result.city,
    })
    setReverseTarget(null)
    setSearchResults([])
    setMessage(`Map pin placed at ${result.displayName}.`)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage('Your browser does not support location access. You can place the pin or enter the address manually.')
      return
    }

    setIsLocating(true)
    setMessage('')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        placePin(coords.latitude, coords.longitude)
        setMessage('Current location found. Confirm the pin and address below.')
        setIsLocating(false)
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. Allow location access or select a place on the map.',
          2: 'Your current location is unavailable. Try again or select a place on the map.',
          3: 'Finding your location timed out. Try again or select a place on the map.',
        }
        setMessage(messages[error.code] ?? 'Could not access your current location. Select a place on the map.')
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    )
  }

  return (
    <div className="location-picker">
      <div className="input-group location-picker-search">
        <span className="input-group-text" aria-hidden="true">
          <span className="material-symbols-outlined">search</span>
        </span>
        <input
          className="form-control"
          type="search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value)
            setSearchResults([])
            setMessage('')
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleAddressSearch()
            }
          }}
          placeholder="Search an address in Nepal"
          aria-label="Search an address"
        />
        <button className="btn btn-primary location-picker-search-button" type="button" onClick={handleAddressSearch} disabled={isSearching}>
          <span className="material-symbols-outlined" aria-hidden="true">{isSearching ? 'progress_activity' : 'search'}</span>
          {isSearching ? 'Searching…' : 'Search'}
        </button>
      </div>
      {searchResults.length > 0 && (
        <div className="list-group" aria-label="Address search results">
          {searchResults.map((result, index) => (
            <button
              className="list-group-item list-group-item-action text-start"
              type="button"
              key={`${result.latitude},${result.longitude},${index}`}
              onClick={() => selectSearchResult(result)}
            >
              <span className="d-block fw-semibold">{result.addressLine || result.displayName}</span>
              <span className="small text-body-secondary">{result.city || result.displayName}</span>
            </button>
          ))}
        </div>
      )}
      <div className="location-picker-controls">
        <p className="location-picker-hint mb-0">
          <span className="material-symbols-outlined" aria-hidden="true">touch_app</span>
          Search an address or select a point on the map.
        </p>
        <button
          className="btn location-picker-current-button"
          type="button"
          onClick={useCurrentLocation}
          disabled={isLocating}
        >
          <span className={`material-symbols-outlined${isLocating ? ' location-picker-location-icon--spin' : ''}`} aria-hidden="true">
            {isLocating ? 'progress_activity' : 'my_location'}
          </span>
          <span>{isLocating ? 'Finding your location…' : 'Use my current location'}</span>
        </button>
      </div>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        maxZoom={21}
        scrollWheelZoom
        className="location-picker-map"
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
        <MapView position={position} />
        <MapResizeHandler />
        <MapClickHandler onPlace={placePin} />
        {hasCoordinates && (
          <Marker
            position={position}
            icon={locationMarkerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const markerPosition = event.target.getLatLng()
                placePin(markerPosition.lat, markerPosition.lng)
              },
            }}
          />
        )}
      </MapContainer>
      {message && (
        <p className={`location-picker-message small mt-2 mb-0 ${searchResults.length > 0 || message.startsWith('Map pin placed') || message.startsWith('Current location found') ? 'location-picker-message--success' : 'location-picker-message--warning'}`} role="status">
          <span className="material-symbols-outlined" aria-hidden="true">
            {searchResults.length > 0 || message.startsWith('Map pin placed') || message.startsWith('Current location found') ? 'check_circle' : 'info'}
          </span>
          {message}
        </p>
      )}
      {hasCoordinates && (
        <p className="location-picker-coordinates small text-on-surface-variant mt-2 mb-0">
          <span className="material-symbols-outlined icon-tone--location" aria-hidden="true">location_on</span>
          Pin: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </p>
      )}
    </div>
  )
}
