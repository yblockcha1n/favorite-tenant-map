'use client'

import { useRef, useState, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface MapSearchProps {
  open: boolean
  onClose: () => void
}

export function MapSearch({ open, onClose }: MapSearchProps) {
  const map = useMap()
  const [inputValue, setInputValue] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClose = useCallback(() => {
    setInputValue('')
    setResults([])
    onClose()
  }, [onClose])

  const searchPlaces = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=jp&limit=5`,
          { headers: { 'Accept-Language': 'ja' } }
        )
        if (res.ok) {
          const data: NominatimResult[] = await res.json()
          setResults(data)
        }
      } catch {
        // Nominatim search failed silently
      }
    }, 300)
  }, [])

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      searchPlaces(value)
    },
    [searchPlaces]
  )

  const handleSelect = useCallback(
    (result: NominatimResult) => {
      map.setView([parseFloat(result.lat), parseFloat(result.lon)], 16)
      handleClose()
    },
    [map, handleClose]
  )

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="fixed top-14 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4"
      >
        <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <Input
            ref={inputRef}
            placeholder="場所を検索..."
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            className="border-0 focus-visible:ring-0"
            autoFocus
          />
          {results.length > 0 && (
            <ul className="max-h-64 overflow-y-auto border-t border-border">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{result.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className="fixed inset-0 -z-10"
          onClick={handleClose}
        />
      </motion.div>
    </AnimatePresence>
  )
}
