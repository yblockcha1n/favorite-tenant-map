'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Category = Database['public']['Tables']['categories']['Row']

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      }
    } catch {
      console.error('Failed to fetch categories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('categories-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT': {
              const newCat = payload.new as Category
              setCategories((prev) => {
                if (prev.some((c) => c.id === newCat.id)) return prev
                return [...prev, newCat].sort((a, b) =>
                  a.name.localeCompare(b.name)
                )
              })
              break
            }
            case 'UPDATE': {
              const updated = payload.new as Category
              setCategories((prev) =>
                prev
                  .map((c) => (c.id === updated.id ? updated : c))
                  .sort((a, b) => a.name.localeCompare(b.name))
              )
              break
            }
            case 'DELETE': {
              const oldId = (payload.old as { id: string }).id
              setCategories((prev) => prev.filter((c) => c.id !== oldId))
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

  const createCategory = useCallback(async (name: string) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    const data = await res.json()
    setCategories((prev) =>
      [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name))
    )
    return data.category
  }, [])

  const updateCategory = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    const data = await res.json()
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? data.category : c))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    return data.category
  }, [])

  const deleteCategory = useCallback(async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}
