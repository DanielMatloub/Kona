'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix missing marker icons in Next.js
const icon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#92400e"/>
    <circle cx="12" cy="12" r="4" fill="#fef3c7"/>
  </svg>`,
  className: '',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
})

interface MapPin {
  lat: number
  lon: number
  name: string
  city: string
  stars?: number
}

interface MapProps {
  pins: MapPin[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function Map({ pins, center, zoom = 12, height = '400px' }: MapProps) {
  const defaultCenter: [number, number] = center ||
    (pins.length > 0 ? [pins[0].lat, pins[0].lon] : [37.7749, -122.4194])

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>
      {pins.map((pin, i) => (
        <Marker key={i} position={[pin.lat, pin.lon]} icon={icon}>
          <Popup>
            <div style={{ fontFamily: 'sans-serif', minWidth: '120px' }}>
              <p style={{ fontWeight: 600, margin: '0 0 4px' }}>{pin.name}</p>
              <p style={{ color: '#71717a', fontSize: '12px', margin: '0 0 4px' }}>{pin.city}</p>
              {pin.stars && (
                <p style={{ color: '#92400e', fontSize: '13px', margin: 0 }}>
                  {'★'.repeat(Math.floor(pin.stars))}
                  {pin.stars % 1 !== 0 ? '½' : ''}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}