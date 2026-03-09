import { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'HomeIP',
  slug: 'homeip',
  version: '1.4.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'homeip',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.erezults.homeip',
    buildNumber: '1',
    infoPlist: {
      NSCameraUsageDescription: 'Used to take photos of network devices',
      NSPhotoLibraryUsageDescription: 'Used to select photos for network devices',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image-picker',
    ['expo-notifications', {
      icon: './assets/images/notification-icon.png',
      color: '#3b82f6',
    }],
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
})
