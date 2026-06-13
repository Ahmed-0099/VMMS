export type ThemePreference = 'light' | 'dark' | 'system'
export type DensityPreference = 'comfortable' | 'compact'

export type UiPreferences = {
  theme: ThemePreference
  density: DensityPreference
}

export type AdminPreferences = {
  organizationName: string
  contactEmail: string
  contactPhone: string
  address: string
  reportFooter: string
  expiryWarningDays: number
  maintenanceWarningDays: number
  currency: string
  distanceUnit: string
}

const UI_PREFERENCES_STORAGE_KEY = 'vmms_ui_preferences'
const ADMIN_PREFERENCES_STORAGE_KEY = 'vmms_admin_preferences'

export const defaultUiPreferences: UiPreferences = {
  theme: 'light',
  density: 'comfortable',
}

export const defaultAdminPreferences: AdminPreferences = {
  organizationName: 'VMMS Fleet Operations',
  contactEmail: 'fleet.manager@vmms.local',
  contactPhone: '+92 300 0000000',
  address: 'Fleet operations office',
  reportFooter: 'VMMS Fleet Management',
  expiryWarningDays: 30,
  maintenanceWarningDays: 14,
  currency: 'PKR',
  distanceUnit: 'KM',
}

function parseStoredObject<TValue>(storageKey: string, fallback: TValue) {
  const storedValue = localStorage.getItem(storageKey)

  if (!storedValue) {
    return fallback
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(storedValue),
    } as TValue
  } catch {
    return fallback
  }
}

function getResolvedTheme(theme: ThemePreference) {
  if (theme !== 'system') {
    return theme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function loadUiPreferences() {
  return parseStoredObject(UI_PREFERENCES_STORAGE_KEY, defaultUiPreferences)
}

export function saveUiPreferences(preferences: UiPreferences) {
  localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  applyUiPreferences(preferences)
}

export function applyUiPreferences(preferences = loadUiPreferences()) {
  document.documentElement.dataset.vmmsTheme = getResolvedTheme(preferences.theme)
  document.documentElement.dataset.vmmsDensity = preferences.density
}

export function loadAdminPreferences() {
  return parseStoredObject(ADMIN_PREFERENCES_STORAGE_KEY, defaultAdminPreferences)
}

export function saveAdminPreferences(preferences: AdminPreferences) {
  localStorage.setItem(ADMIN_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}
