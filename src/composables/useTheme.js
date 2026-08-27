/**
 * ============================================================
 * THEME SYSTEM
 * ============================================================
 * This is the "let the user handle the theme" feature: mode
 * (light / dark / system) plus an accent color, both persisted to
 * localStorage and applied as CSS custom properties on <html>.
 *
 * State lives at module scope (not inside a Pinia store) so it is a
 * true singleton available to any component - the theme is a global
 * concern, not per-view state.
 * ============================================================
 */

import { ref, watch } from 'vue'

const STORAGE_KEY = 'pigeon-theme'

export const ACCENTS = {
  blue: { label: 'Blue', primary: '#0084ff', primaryHover: '#0077e6', primaryLight: '#e7f3ff' },
  green: { label: 'Green', primary: '#31a24c', primaryHover: '#2a8c41', primaryLight: '#e6f7ea' },
  purple: { label: 'Purple', primary: '#8e5cff', primaryHover: '#7a45f0', primaryLight: '#f0e9ff' },
  pink: { label: 'Pink', primary: '#ff4d8d', primaryHover: '#e83e7c', primaryLight: '#ffe6ef' },
  orange: { label: 'Orange', primary: '#ff8a00', primaryHover: '#e67a00', primaryLight: '#fff1e0' },
  teal: { label: 'Teal', primary: '#00a884', primaryHover: '#009373', primaryLight: '#e1f7f2' }
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    /* corrupt storage - fall through to defaults */
  }
  return { mode: 'system', accent: 'blue' }
}

const stored = readStored()
const mode = ref(stored.mode || 'system')
const accent = ref(ACCENTS[stored.accent] ? stored.accent : 'blue')

const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function resolveEffectiveMode() {
  if (mode.value === 'system') {
    return mediaQuery && mediaQuery.matches ? 'dark' : 'light'
  }
  return mode.value
}

function applyTheme() {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', resolveEffectiveMode())

  const palette = ACCENTS[accent.value] || ACCENTS.blue
  root.style.setProperty('--primary', palette.primary)
  root.style.setProperty('--primary-hover', palette.primaryHover)
  root.style.setProperty('--primary-light', palette.primaryLight)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', palette.primary)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: mode.value, accent: accent.value }))
  } catch (e) {
    /* storage unavailable (private mode etc.) - theme still applies for this session */
  }
}

if (mediaQuery) {
  mediaQuery.addEventListener('change', () => {
    if (mode.value === 'system') applyTheme()
  })
}

// Apply immediately (module load) and whenever mode/accent change.
watch([mode, accent], applyTheme, { immediate: true })

export function useTheme() {
  return {
    mode,
    accent,
    accents: ACCENTS,
    setMode: (m) => (mode.value = m),
    setAccent: (a) => (accent.value = a)
  }
}
