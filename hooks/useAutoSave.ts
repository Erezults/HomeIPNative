import { useState, useEffect, useRef, useCallback } from 'react'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions {
  delay?: number
  onSave: (value: string) => Promise<boolean>
}

export function useAutoSave({ delay = 500, onSave }: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback((value: string) => {
    // Clear previous timers
    if (timerRef.current) clearTimeout(timerRef.current)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setStatus('idle')

    timerRef.current = setTimeout(async () => {
      setStatus('saving')
      const success = await onSave(value)
      setStatus(success ? 'saved' : 'error')

      if (success) {
        savedTimerRef.current = setTimeout(() => setStatus('idle'), 2000)
      }
    }, delay)
  }, [delay, onSave])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  return { status, trigger }
}

export function useFieldAutoSave(delay = 500) {
  const [fieldStatus, setFieldStatus] = useState<Record<string, SaveStatus>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const savedTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const triggerSave = useCallback((
    field: string,
    saveFn: () => Promise<boolean>
  ) => {
    // Clear previous timers for this field
    if (timersRef.current[field]) clearTimeout(timersRef.current[field])
    if (savedTimersRef.current[field]) clearTimeout(savedTimersRef.current[field])
    setFieldStatus(prev => ({ ...prev, [field]: 'idle' }))

    timersRef.current[field] = setTimeout(async () => {
      setFieldStatus(prev => ({ ...prev, [field]: 'saving' }))
      const success = await saveFn()
      setFieldStatus(prev => ({ ...prev, [field]: success ? 'saved' : 'error' }))

      if (success) {
        savedTimersRef.current[field] = setTimeout(() => {
          setFieldStatus(prev => ({ ...prev, [field]: 'idle' }))
        }, 2000)
      }
    }, delay)
  }, [delay])

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
      Object.values(savedTimersRef.current).forEach(clearTimeout)
    }
  }, [])

  return { fieldStatus, triggerSave }
}
