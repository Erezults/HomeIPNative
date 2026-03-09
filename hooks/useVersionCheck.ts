import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { APP_VERSION } from '@/config/version'

function isNewer(remote: string, local: string): boolean {
  const r = remote.split('.').map(Number)
  const l = local.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true
    if ((r[i] || 0) < (l[i] || 0)) return false
  }
  return false
}

export function useVersionCheck() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [checking, setChecking] = useState(false)

  const checkVersion = useCallback(async () => {
    setChecking(true)
    try {
      const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'latest_version')
        .single()

      if (!error && data) {
        setLatestVersion(data.value)
        setHasUpdate(isNewer(data.value, APP_VERSION))
      }
    } catch {
      // Silently fail - version check is non-critical
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    checkVersion()
  }, [checkVersion])

  return { latestVersion, hasUpdate, checking, checkVersion }
}
