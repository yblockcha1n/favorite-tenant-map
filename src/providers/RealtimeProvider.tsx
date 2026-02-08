'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

interface RealtimeContextType {
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextType>({ isConnected: false })

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const channel = supabase.channel('system')
    channel
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext)
}
