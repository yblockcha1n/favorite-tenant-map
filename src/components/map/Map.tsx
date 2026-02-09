'use client'

import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Database } from '@/lib/types/database'

type Tenant = Database['public']['Tables']['tenants']['Row']

interface MapComponentProps {
  tenants: Tenant[]
  onMarkerClick: (tenantId: string) => void
  onMapClick: (lat: number, lng: number) => void
  searchOpen: boolean
  onSearchClose: () => void
}

// Leaflet must be loaded client-side only (no SSR)
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <p className="text-muted-foreground text-sm animate-pulse">
        マップを読み込み中...
      </p>
    </div>
  ),
})

export function MapComponent({
  tenants,
  onMarkerClick,
  onMapClick,
  searchOpen,
  onSearchClose,
}: MapComponentProps) {
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onMapClick(lat, lng)
    },
    [onMapClick]
  )

  return (
    <MapInner
      tenants={tenants}
      onMarkerClick={onMarkerClick}
      onMapClick={handleMapClick}
      searchOpen={searchOpen}
      onSearchClose={onSearchClose}
    />
  )
}
