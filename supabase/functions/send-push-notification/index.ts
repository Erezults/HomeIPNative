import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

serve(async (req) => {
  const payload = await req.json()
  const { type, record, old_record } = payload

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const networkId = record?.network_id || old_record?.network_id
  if (!networkId) return new Response('No network_id', { status: 400 })

  // Get all push tokens for users in this network
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('expo_push_token, user_id')

  if (!tokens || tokens.length === 0) {
    return new Response('No tokens', { status: 200 })
  }

  // Build notification message
  let title = 'HomeNetIP'
  let body = ''
  const deviceName = record?.name || old_record?.name || 'Unknown device'

  switch (type) {
    case 'INSERT':
      body = `New device added: ${deviceName} (${record.ip_address})`
      break
    case 'UPDATE':
      body = `Device updated: ${deviceName}`
      break
    case 'DELETE':
      body = `Device removed: ${old_record?.name || 'Unknown'}`
      break
  }

  // Send to all tokens
  const messages = tokens.map(t => ({
    to: t.expo_push_token,
    sound: 'default',
    title,
    body,
    data: { type, deviceId: record?.id || old_record?.id, networkId },
  }))

  await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  })

  return new Response('OK', { status: 200 })
})
