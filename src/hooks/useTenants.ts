'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type TenantRow = Database['public']['Tables']['tenants']['Row']

export type Tenant = TenantRow & {
  categories: { name: string } | null
}

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        setTenants(data.tenants)
      }
    } catch {
      console.error('Failed to fetch tenants')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTenants()
  }, [fetchTenants])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('tenants-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tenants' },
        async (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              // Refetch to get category join data
              const res = await fetch(`/api/tenants/${(payload.new as TenantRow).id}`)
              if (res.ok) {
                const data = await res.json()
                setTenants((prev) => {
                  if (prev.some((t) => t.id === data.tenant.id)) return prev
                  return [data.tenant, ...prev]
                })
              }
              break
            }
            case 'UPDATE': {
              const res = await fetch(`/api/tenants/${(payload.new as TenantRow).id}`)
              if (res.ok) {
                const data = await res.json()
                setTenants((prev) =>
                  prev.map((t) =>
                    t.id === data.tenant.id ? data.tenant : t
                  )
                )
              }
              break
            }
            case 'DELETE': {
              const oldId = (payload.old as { id: string }).id
              setTenants((prev) => prev.filter((t) => t.id !== oldId))
              break
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const createTenant = useCallback(
    async (tenantData: Record<string, unknown>) => {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const data = await res.json()
      setTenants((prev) => [data.tenant, ...prev])
      return data.tenant
    },
    []
  )

  const updateTenant = useCallback(
    async (id: string, tenantData: Record<string, unknown>) => {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      const data = await res.json()
      setTenants((prev) =>
        prev.map((t) => (t.id === id ? data.tenant : t))
      )
      return data.tenant
    },
    []
  )

  const deleteTenant = useCallback(async (id: string) => {
    const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    setTenants((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    tenants,
    isLoading,
    createTenant,
    updateTenant,
    deleteTenant,
    refetch: fetchTenants,
  }
}
