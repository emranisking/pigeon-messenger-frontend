/**
 * Deterministic per-username avatar color, ported from the original
 * getAvatarColor()/getInitial() in app.js.
 */

const AVATAR_COLORS = [
  '#1877f2', '#42b72a', '#f02849', '#a033ff',
  '#f5533d', '#00a884', '#0095f6', '#ff6900'
]

export function getAvatarColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitial(name = '') {
  return (name || '?').charAt(0).toUpperCase()
}
