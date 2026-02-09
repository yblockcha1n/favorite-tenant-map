'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import { MapMarker } from './MapMarker'
import { MapSearch } from './MapSearch'
import { TILE_LIGHT, TILE_DARK, TILE_ATTRIBUTION } from '@/lib/map/styles'
import { useTheme } from '@/providers/ThemeProvider'
import type { Database } from '@/lib/types/database'

type Tenant = Database['public']['Tables']['tenants']['Row']

const DEFAULT_CENTER: [number, number] = [35.6812, 139.7671]
const DEFAULT_ZOOM = 13

interface MapInnerProps {
  tenants: Tenant[]
  onMarkerClick: (tenantId: string) => void
  onMapClick: (lat: number, lng: number) => void
  searchOpen: boolean
  onSearchClose: () => void
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapInner({
  tenants,
  onMarkerClick,
  onMapClick,
  searchOpen,
  onSearchClose,
}: MapInnerProps) {
  const { theme } = useTheme()

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution={TILE_ATTRIBUTION}
        url={theme === 'dark' ? TILE_DARK : TILE_LIGHT}
      />
      <ClickHandler onMapClick={onMapClick} />
      {tenants.map((tenant) => (
        <MapMarker
          key={tenant.id}
          tenant={tenant}
          onClick={() => onMarkerClick(tenant.id)}
        />
      ))}
      <MapSearch open={searchOpen} onClose={onSearchClose} />
    </MapContainer>
  )
}
