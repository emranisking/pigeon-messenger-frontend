/**
 * Time/date formatting helpers, ported 1:1 from the original app.js
 * (parseTimestamp / formatTime / formatFullTime / formatDateSeparator
 * / truncate) so behaviour matches exactly, just as pure functions
 * instead of IIFE-private closures.
 */

export function parseTimestamp(value) {
  if (!value) return new Date()
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  if (typeof value === 'number') {
    return value < 1e12 ? new Date(value * 1000) : new Date(value)
  }
  return new Date()
}

export function formatTime(isoString) {
  const d = parseTimestamp(isoString)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function formatFullTime(isoString) {
  const d = parseTimestamp(isoString)
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function formatDateSeparator(isoString) {
  const d = parseTimestamp(isoString)
  const now = new Date()
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}
