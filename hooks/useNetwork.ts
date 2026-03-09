import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Network, Category, Room } from '@/types/database'

interface UseNetworkReturn {
  network: Network | null
  categories: Category[]
  rooms: Room[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useNetwork(): UseNetworkReturn {
  const { user, viewerSession, isViewer } = useAuth()
  const [network, setNetwork] = useState<Network | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let networkId: string | null = null

      if (isViewer && viewerSession) {
        networkId = viewerSession.network_id
      } else if (user) {
        // Owner: fetch their network
        const { data: nets, error: netErr } = await supabase
          .from('networks')
          .select('*')
          .eq('user_id', user.id)
          .limit(1)

        if (netErr) throw netErr
        if (nets && nets.length > 0) {
          setNetwork(nets[0] as Network)
          networkId = nets[0].id
        } else {
          // Auto-create default network for new owner
          const { data: newNet, error: createErr } = await supabase
            .from('networks')
            .insert({
              user_id: user.id,
              name: '\u05d4\u05e8\u05e9\u05ea \u05d4\u05d1\u05d9\u05ea\u05d9\u05ea',
              subnet: '192.168.1.1',
              gateway: '192.168.1.1',
              dhcp_range_start: '192.168.1.100',
              dhcp_range_end: '192.168.1.254',
              dns_primary: '8.8.8.8',
              dns_secondary: '8.8.4.4',
            })
            .select()
            .single()

          if (createErr) throw createErr
          if (newNet) {
            setNetwork(newNet as Network)
            networkId = newNet.id
          }
        }
      }

      if (!networkId) {
        setLoading(false)
        return
      }

      // If viewer, we still need to fetch the network info
      if (isViewer && viewerSession) {
        const { data: net, error: netErr } = await supabase
          .from('networks')
          .select('*')
          .eq('id', networkId)
          .limit(1)

        if (netErr) throw netErr
        if (net && net.length > 0) {
          setNetwork(net[0] as Network)
        }
      }

      // Fetch categories
      let catQuery = supabase
        .from('categories')
        .select('*')
        .eq('network_id', networkId)
        .order('sort_order', { ascending: true })

      if (isViewer && viewerSession && viewerSession.allowed_categories.length > 0) {
        catQuery = catQuery.in('id', viewerSession.allowed_categories)
      }

      const { data: cats, error: catErr } = await catQuery
      if (catErr) throw catErr
      setCategories((cats ?? []) as Category[])

      // Fetch rooms
      let roomQuery = supabase
        .from('rooms')
        .select('*')
        .eq('network_id', networkId)
        .order('sort_order', { ascending: true })

      if (isViewer && viewerSession && viewerSession.allowed_rooms.length > 0) {
        roomQuery = roomQuery.in('id', viewerSession.allowed_rooms)
      }

      const { data: rms, error: rmErr } = await roomQuery
      if (rmErr) throw rmErr
      setRooms((rms ?? []) as Room[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch network data')
    } finally {
      setLoading(false)
    }
  }, [user, viewerSession, isViewer])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { network, categories, rooms, loading, error, refetch: fetchData }
}
