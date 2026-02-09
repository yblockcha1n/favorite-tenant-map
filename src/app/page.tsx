'use client'

import { useState, useCallback } from 'react'
import { MapComponent } from '@/components/map/Map'
import { Header } from '@/components/layout/Header'
import { TenantCreateSheet } from '@/components/sheets/TenantCreateSheet'
import { TenantDetailSheet } from '@/components/sheets/TenantDetailSheet'
import { TenantEditSheet } from '@/components/sheets/TenantEditSheet'
import { CategoryManageSheet } from '@/components/sheets/CategoryManageSheet'
import { useAuth } from '@/hooks/useAuth'
import { useTenants } from '@/hooks/useTenants'

export default function HomePage() {
  const { isLoading } = useAuth()
  const { tenants } = useTenants()

  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [detailSheetTenantId, setDetailSheetTenantId] = useState<string | null>(
    null
  )
  const [editSheetTenantId, setEditSheetTenantId] = useState<string | null>(
    null
  )
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [newTenantCoords, setNewTenantCoords] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setNewTenantCoords({ lat, lng })
    setCreateSheetOpen(true)
  }, [])

  const handleMarkerClick = useCallback((tenantId: string) => {
    setDetailSheetTenantId(tenantId)
  }, [])

  const handleEditFromDetail = useCallback((tenantId: string) => {
    setDetailSheetTenantId(null)
    setEditSheetTenantId(tenantId)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      <Header
        onCategoryManage={() => setCategorySheetOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <MapComponent
        tenants={tenants}
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
        searchOpen={searchOpen}
        onSearchClose={() => setSearchOpen(false)}
      />

      <TenantCreateSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        coordinates={newTenantCoords}
      />

      <TenantDetailSheet
        open={!!detailSheetTenantId}
        onOpenChange={(open) => !open && setDetailSheetTenantId(null)}
        tenantId={detailSheetTenantId}
        onEdit={handleEditFromDetail}
      />

      <TenantEditSheet
        open={!!editSheetTenantId}
        onOpenChange={(open) => !open && setEditSheetTenantId(null)}
        tenantId={editSheetTenantId}
      />

      <CategoryManageSheet
        open={categorySheetOpen}
        onOpenChange={setCategorySheetOpen}
      />
    </div>
  )
}
