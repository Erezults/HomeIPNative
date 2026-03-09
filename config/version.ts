export const APP_VERSION = '1.4.0'

export type ChangeCategory =
  | 'feature'      // New Feature
  | 'bugfix'       // Bug Fix
  | 'improvement'  // Improvement
  | 'ui'           // UI Change
  | 'performance'  // Performance
  | 'security'     // Security
  | 'a11y'         // Accessibility
  | 'deprecated'   // Deprecated
  | 'docs'         // Documentation

export const CATEGORY_LABELS: Record<ChangeCategory, string> = {
  feature: 'New Feature',
  bugfix: 'Bug Fix',
  improvement: 'Improvement',
  ui: 'UI Change',
  performance: 'Performance',
  security: 'Security',
  a11y: 'Accessibility',
  deprecated: 'Deprecated',
  docs: 'Documentation',
}

export const CATEGORY_COLORS: Record<ChangeCategory, string> = {
  feature: '#22c55e',     // green
  bugfix: '#ef4444',      // red
  improvement: '#3b82f6', // blue
  ui: '#a855f7',          // purple
  performance: '#f59e0b', // amber
  security: '#f97316',    // orange
  a11y: '#06b6d4',        // cyan
  deprecated: '#6b7280',  // gray
  docs: '#8b5cf6',        // violet
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: {
    category: ChangeCategory
    items: string[]
  }[]
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.4.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'Push notification support using Expo Notifications',
          'Automatic Push token registration on login',
          'Supabase Edge Function for sending notifications on device changes',
          'push_tokens table for storing user tokens',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'Full dashboard screen with device display, statistics and filtering',
          'Device search by name, IP, MAC or description',
          'Filtering by category and room',
          'Device grouping by categories and/or rooms with collapse/expand',
          'Device detail view panel with image, status and full information',
          'Add/edit device form with IP validation, available IP suggestion, image upload',
          'Long press on device for quick edit/delete',
          'FAB button to add a new device',
          'Pull to Refresh',
        ],
      },
      {
        category: 'ui',
        items: [
          'Colorful statistics cards: total devices, active, available addresses',
          'Colorful category headers with image, device count and IP range',
          'Room headers with icon, color and device count',
          'Device row with image, status (green/gray), name and IP address',
          'Full support for dark and light mode',
          'RTL direction support',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'Full login screen with support for owners (email/password) and viewers (viewer code)',
          'Smooth transition between owner mode and viewer mode on the login screen',
          'Styled error display in the login form',
        ],
      },
      {
        category: 'ui',
        items: [
          'Login screen design with logo, centered card and decorative background',
          'Dark/light mode support on the login screen',
          'KeyboardAvoidingView for keyboard handling on iOS',
          'Footer with developer credit on the login screen',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'Full navigation structure with Expo Router - auth, dashboard, settings',
          'Automatic auth gate - redirect to login or app based on user state',
          'Tab navigation with hidden settings tab for viewers',
          'Stack navigation for settings sub-screens (network, categories, rooms, viewers)',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'React Native app launch - native version for iPhone and Android',
        ],
      },
    ],
  },
  {
    version: '0.7.2',
    date: '2026-03-09',
    changes: [
      {
        category: 'security',
        items: [
          'Server-side edit permission enforcement - viewers with edit permission routed through secure RPC',
          'Server-side session token validation before any viewer write operation',
        ],
      },
      {
        category: 'bugfix',
        items: [
          'Fixed memory leak in category image upload (URL.createObjectURL)',
          'Show warning when category image upload fails',
          'Removed unnecessary storage.remove call before upsert',
        ],
      },
      {
        category: 'improvement',
        items: [
          'Renamed prop from isOwner to canEdit in device view panel',
          'Added description to edit permission field in viewer code generation',
        ],
      },
    ],
  },
  {
    version: '0.7.1',
    date: '2026-03-09',
    changes: [
      {
        category: 'ui',
        items: [
          'Language toggle button in header shows flag (US/IL) instead of generic icon',
        ],
      },
    ],
  },
  {
    version: '0.7.0',
    date: '2026-03-09',
    changes: [
      {
        category: 'feature',
        items: [
          'Edit permission for viewers - option to allow viewers to edit data in the system',
          'Appearance and language buttons in header for users connecting with viewer code',
          'Select all / Deselect all buttons for category and room settings in viewer code',
          'Option to edit label of existing viewer code',
        ],
      },
      {
        category: 'bugfix',
        items: [
          'Fix: viewer cannot see devices without category/room when all categories/rooms are selected',
        ],
      },
    ],
  },
  {
    version: '0.6.0',
    date: '2026-03-08',
    changes: [
      {
        category: 'feature',
        items: [
          'Added option to set an image for a category',
          'Category image displayed next to category name in dashboard (replaces icon)',
          'Image upload from device with automatic WebP compression',
          'Option to remove existing category image',
        ],
      },
    ],
  },
  {
    version: '0.5.6',
    date: '2026-03-08',
    changes: [
      {
        category: 'ui',
        items: [
          'Category header row fully colored with the user-defined category color',
        ],
      },
    ],
  },
  {
    version: '0.5.5',
    date: '2026-03-08',
    changes: [
      {
        category: 'feature',
        items: [
          'Added Open Graph meta tags for attractive sharing on WhatsApp, Telegram, Facebook and more',
          'Styled OG image (1200x630) with logo and app name',
          'Twitter Card support (summary_large_image)',
        ],
      },
    ],
  },
  {
    version: '0.5.4',
    date: '2026-03-08',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Full regeneration of all PWA icons and manifest without built-in rounded corners',
          'Added 180x180 icon to manifest for iOS',
          'All icons are now pure RGB without transparency',
        ],
      },
    ],
  },
  {
    version: '0.5.3',
    date: '2026-03-08',
    changes: [
      {
        category: 'performance',
        items: [
          'Search performance improvement - client-side filtering without server refetch on each keystroke',
          'Search field maintains focus and does not cause screen reload',
        ],
      },
    ],
  },
  {
    version: '0.5.2',
    date: '2026-03-08',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed PWA icon on iPhone - removed built-in rounded frame, graphic fills entire area',
          'Added sizes="180x180" to apple-touch-icon tag',
          'Updated Service Worker cache to force refresh',
        ],
      },
    ],
  },
  {
    version: '0.5.1',
    date: '2026-03-08',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed PWA icon on iPhone - replaced apple-touch-icon with full dark background icon',
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-03-08',
    changes: [
      {
        category: 'feature',
        items: [
          'Device image upload from gallery or file',
          'Automatic image compression to 256x256 in WebP format to save storage',
          'Image preview in device add/edit form',
          'Option to remove existing image',
        ],
      },
    ],
  },
  {
    version: '0.4.9',
    date: '2026-03-08',
    changes: [
      {
        category: 'improvement',
        items: [
          'Located and set product images for all 25 devices that were missing an image',
          'Fixed incorrect images (HomePod Salon, MacBook M1 Pro were showing Apple TV image)',
          'Uploaded 18 new product images to Supabase Storage',
        ],
      },
    ],
  },
  {
    version: '0.4.8',
    date: '2026-03-08',
    changes: [
      {
        category: 'ui',
        items: [
          'Mobile-adapted dashboard - compact statistics cards in a single row',
          'Search and filter fields adapted to mobile screen width',
          'Grouping buttons moved to header row to save space',
          'Reduced spacing in mobile view',
        ],
      },
    ],
  },
  {
    version: '0.4.7',
    date: '2026-03-08',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed small PWA icon on iPhone - separated maskable icons from any in manifest',
        ],
      },
    ],
  },
  {
    version: '0.4.6',
    date: '2026-03-07',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed category and room display in device edit panel (showed ID instead of name)',
          'Fixed select field display across the entire app (filtering, settings)',
        ],
      },
      {
        category: 'improvement',
        items: [
          'Confirmation before assigning a new IP address when one already exists',
        ],
      },
    ],
  },
  {
    version: '0.4.4',
    date: '2026-03-07',
    changes: [
      {
        category: 'improvement',
        items: [
          'Version button shows the new version when an update is available',
          'Clicking the version button automatically loads the new version',
        ],
      },
    ],
  },
  {
    version: '0.4.3',
    date: '2026-03-07',
    changes: [
      {
        category: 'ui',
        items: [
          'Removed theme button from header (exists in settings screen)',
          'Fixed theme toggle direction in settings screen for RTL mode',
        ],
      },
    ],
  },
  {
    version: '0.4.2',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Independent grouping toggles - option to enable/disable grouping by categories and rooms separately',
          'Flat list view when both groupings are disabled',
        ],
      },
      {
        category: 'ui',
        items: [
          'Two independent toggle buttons instead of a single selection toggle',
        ],
      },
    ],
  },
  {
    version: '0.4.1',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Bilingual name support (Hebrew + English) for categories and rooms',
          'Hebrew and English name fields in category and room settings',
          'Display name in the appropriate language across all components',
        ],
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Grouping toggle by categories or rooms on the main screen',
          'Room collapsing within categories (and categories within rooms)',
          'IP address range displayed in each collapsed field header',
        ],
      },
      {
        category: 'ui',
        items: [
          'All fields collapsed by default for a cleaner view',
          'Grouping preference saved between sessions',
        ],
      },
    ],
  },
  {
    version: '0.3.3',
    date: '2026-03-07',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed "IP address out of network range" error when subnet is configured without CIDR mask',
          'Default /24 when no mask is defined in all network functions',
        ],
      },
    ],
  },
  {
    version: '0.3.2',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'PWA support - install the app as a standalone application on any platform',
          'App icon configured for all platforms: iOS, Android, Mac, Windows',
          'Service Worker for basic offline support',
        ],
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2026-03-07',
    changes: [
      {
        category: 'ui',
        items: [
          'Redesigned device list - minimalist rows instead of cards',
          'Device detail view panel on click',
          'Unique room colors with color picker in settings',
          'Expanded color palette to 30 for categories and rooms',
          'Room headers with unique color dot in device list',
        ],
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Imported 142 devices from Excel file into the database',
          'Added 5 categories: Network Infrastructure, Home Devices, Shelly, Reolink, Apple',
          'Added 21 rooms based on device locations',
          'New fields: product image, model, serial number',
          'Product images stored in Supabase Storage (no internet required)',
          'Product image displayed on device card',
        ],
      },
    ],
  },
  {
    version: '0.2.3',
    date: '2026-03-07',
    changes: [
      {
        category: 'ui',
        items: [
          'Changelog: flat list with type tag next to each change',
          'Fixed color legend at the top of the changelog panel',
          'Enlarged logo in the credit panel',
        ],
      },
    ],
  },
  {
    version: '0.2.2',
    date: '2026-03-07',
    changes: [
      {
        category: 'ui',
        items: [
          'Redesigned credit panel for a professional look',
          'Fixed logo colors - logo displayed in original colors',
        ],
      },
    ],
  },
  {
    version: '0.2.1',
    date: '2026-03-07',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Fixed infinite recursion error in RLS that prevented saving network settings',
        ],
      },
      {
        category: 'security',
        items: [
          'Improved RLS policy with SECURITY DEFINER function to prevent recursion',
        ],
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Automatic version check against the database',
          'User notification when a new version is available',
          'Instant update button to the latest version',
        ],
      },
    ],
  },
  {
    version: '0.1.3',
    date: '2026-03-07',
    changes: [
      {
        category: 'ui',
        items: [
          'Colored indicator next to each changelog entry',
        ],
      },
    ],
  },
  {
    version: '0.1.2',
    date: '2026-03-07',
    changes: [
      {
        category: 'improvement',
        items: [
          'Detailed error message display in network settings fields',
        ],
      },
    ],
  },
  {
    version: '0.1.1',
    date: '2026-03-07',
    changes: [
      {
        category: 'bugfix',
        items: [
          'Subnet field accepts regular IP address (without CIDR)',
          'Default subnet changed to 192.168.1.1',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-03-07',
    changes: [
      {
        category: 'feature',
        items: [
          'Login screen with support for owners and viewers',
          'Dashboard with device management',
          'Network settings with auto-save',
          'Category and room management',
          'Viewer code management with permissions',
          'IP duplicate detection',
          'Available IP suggestion',
        ],
      },
      {
        category: 'ui',
        items: [
          'Hebrew and English support',
          'Dark and light mode',
          'Version tag with changelog',
        ],
      },
    ],
  },
]
