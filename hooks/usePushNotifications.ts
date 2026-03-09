import { useState, useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const { user } = useAuth()
  const notificationListener = useRef<Notifications.EventSubscription>()
  const responseListener = useRef<Notifications.EventSubscription>()

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) {
        setExpoPushToken(token)
        if (user) saveTokenToServer(token)
      }
    })

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle foreground notification - could update badge, refetch data, etc.
      console.log('Notification received:', notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap - navigate to relevant screen
      console.log('Notification tapped:', response)
    })

    return () => {
      if (notificationListener.current) notificationListener.current.remove()
      if (responseListener.current) responseListener.current.remove()
    }
  }, [user])

  async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device')
      return null
    }

    const { status: existing } = await Notifications.getPermissionsAsync()
    let finalStatus = existing
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted')
      return null
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    })
    return tokenData.data
  }

  async function saveTokenToServer(token: string) {
    if (!user) return
    await supabase.from('push_tokens').upsert(
      {
        user_id: user.id,
        expo_push_token: token,
        platform: Platform.OS,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'expo_push_token' }
    )
  }

  return { expoPushToken }
}
