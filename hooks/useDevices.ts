import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Device } from '@/types/database'

interface UseDevicesReturn {
  devices: Device[]
  loading: boolean
  error: string | null
  addDevice: (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null; id?: string }>
  updateDevice: (id: string, updates: Partial<Device>) => Promise<{ error: string | null }>
  deleteDevice: (id: string) => Promise<{ error: string | null }>
  refetch: () => Promise<void>
}

interface UseDevicesOptions {
  networkId: string | null
  search?: string
  categoryFilter?: string | null
  roomFilter?: string | null
}

export function useDevices({ networkId, search, categoryFilter, roomFilter }: UseDevicesOptions): UseDevicesReturn {
  const { viewerSession, isViewer } = useAuth()
  const [allDevices, setAllDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useCallback(async () => {
    if (!networkId) {
      setAllDevices([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('devices')
        .select('*')
        .eq('network_id', networkId)
        .order('ip_address', { ascending: true })

      // Viewer filtering by allowed categories/rooms
      // Note: .in() doesn't match NULL values, so we use .or() to include
      // devices with null category/room as well
      if (isViewer && viewerSession) {
        if (viewerSession.allowed_categories.length > 0) {
          query = query.or(`category_id.in.(${viewerSession.allowed_categories.join(',')}),category_id.is.null`)
        }
        if (viewerSession.allowed_rooms.length > 0) {
          query = query.or(`room_id.in.(${viewerSession.allowed_rooms.join(',')}),room_id.is.null`)
        }
      }

      // Apply category filter
      if (categoryFilter) {
        if (categoryFilter === '__none__') {
          query = query.is('category_id', null)
        } else {
          query = query.eq('category_id', categoryFilter)
        }
      }

      // Apply room filter
      if (roomFilter) {
        if (roomFilter === '__none__') {
          query = query.is('room_id', null)
        } else {
          query = query.eq('room_id', roomFilter)
        }
      }

      const { data, error: fetchErr } = await query
      if (fetchErr) throw fetchErr

      setAllDevices((data ?? []) as Device[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices')
    } finally {
      setLoading(false)
    }
  }, [networkId, categoryFilter, roomFilter, isViewer, viewerSession])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  // Client-side search filtering (no refetch, no loading state)
  const devices = useMemo(() => {
    if (!search || !search.trim()) return allDevices
    const term = search.trim().toLowerCase()
    return allDevices.filter(d =>
      d.name.toLowerCase().includes(term) ||
      d.ip_address.includes(term) ||
      (d.mac_address && d.mac_address.toLowerCase().includes(term)) ||
      (d.description && d.description.toLowerCase().includes(term))
    )
  }, [allDevices, search])

  const addDevice = useCallback(async (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      let resultId: string | undefined

      if (isViewer && viewerSession) {
        // Route through SECURITY DEFINER RPC for viewer writes
        const { data, error: rpcErr } = await supabase.rpc('viewer_insert_device', {
          p_session_token: viewerSession.session_token,
          p_name: device.name,
          p_ip_address: device.ip_address,
          p_mac_address: device.mac_address || '',
          p_description: device.description || '',
          p_category_id: device.category_id || null,
          p_room_id: device.room_id || null,
          p_is_active: device.is_active ?? true,
          p_model: device.model || '',
          p_serial_number: device.serial_number || '',
          p_notes: device.notes || '',
          p_image_url: device.image_url || '',
        })
        if (rpcErr) throw rpcErr
        resultId = (data as { id: string })?.id
      } else {
        const { data, error: insertErr } = await supabase
          .from('devices')
          .insert(device)
          .select('id')
          .single()
        if (insertErr) throw insertErr
        resultId = data?.id
      }

      await fetchDevices()
      return { error: null, id: resultId }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add device'
      return { error: msg }
    }
  }, [fetchDevices, isViewer, viewerSession])

  const updateDevice = useCallback(async (id: string, updates: Partial<Device>) => {
    try {
      if (isViewer && viewerSession) {
        const { error: rpcErr } = await supabase.rpc('viewer_update_device', {
          p_session_token: viewerSession.session_token,
          p_device_id: id,
          p_updates: updates as Record<string, unknown>,
        })
        if (rpcErr) throw rpcErr
      } else {
        const { error: updateErr } = await supabase
          .from('devices')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
        if (updateErr) throw updateErr
      }

      await fetchDevices()
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update device'
      return { error: msg }
    }
  }, [fetchDevices, isViewer, viewerSession])

  const deleteDevice = useCallback(async (id: string) => {
    try {
      if (isViewer && viewerSession) {
        const { error: rpcErr } = await supabase.rpc('viewer_delete_device', {
          p_session_token: viewerSession.session_token,
          p_device_id: id,
        })
        if (rpcErr) throw rpcErr
      } else {
        const { error: deleteErr } = await supabase
          .from('devices')
          .delete()
          .eq('id', id)
        if (deleteErr) throw deleteErr
      }

      await fetchDevices()
      return { error: null }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete device'
      return { error: msg }
    }
  }, [fetchDevices, isViewer, viewerSession])

  return { devices, loading, error, addDevice, updateDevice, deleteDevice, refetch: fetchDevices }
}
