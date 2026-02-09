'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Database } from '@/lib/types/database'

type Tenant = Database['public']['Tables']['tenants']['Row']

// Monochrome SVG marker icon
const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#1a1a1a" stroke="#404040" stroke-width="1"/>
  <circle cx="12" cy="12" r="5" fill="#ffffff"/>
</svg>`

const markerIcon = L.divIcon({
  html: markerSvg,
  className: '',
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
})

interface MapMarkerProps {
  tenant: Tenant
  onClick: () => void
}

export function MapMarker({ tenant, onClick }: MapMarkerProps) {
  return (
    <Marker
      position={[tenant.latitude, tenant.longitude]}
      icon={markerIcon}
      eventHandlers={{ click: onClick }}
    >
      <Popup className="font-sans">
        <span className="text-sm font-medium">{tenant.name}</span>
      </Popup>
    </Marker>
  )
}
