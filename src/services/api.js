/**
 * ============================================================
 * API SERVICE
 * ============================================================
 * Thin fetch wrapper around the REST backend. Ported from the
 * original vanilla api.js, with one behavioural fix: instead of
 * hard-redirecting the whole page on a 401/403 (which nukes any
 * unsaved UI state and doesn't fit an SPA), it dispatches a
 * window event that App.vue listens for and reacts to via the
 * auth store. See App.vue's `auth:unauthorized` listener.
 * ============================================================
 */

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

async function request(method, path, body = null) {
  const opts = { method, headers: authHeaders() }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(path, opts)

  if (res.status === 401 || res.status === 403) {
    localStorage.clear()
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    throw new Error('Unauthorized - please login again')
  }

  if (!res.ok) {
    const text = await res.text()
    let message
    try {
      const json = JSON.parse(text)
      message = json.message || json.error || text
    } catch {
      message = text || `HTTP ${res.status}`
    }
    throw new Error(message)
  }

  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return res.json()
  }
  return null
}

export const api = {
  // Auth
  login: (username, password) => request('POST', '/api/auth/login', { username, password }),
  register: (username, password) => request('POST', '/api/auth/register', { username, password }),

  // Users
  getMe: () => request('GET', '/api/users/me'),
  searchUsers: (query) => request('GET', `/api/users/search?query=${encodeURIComponent(query)}`),
  getUser: (userId) => request('GET', `/api/users/${userId}`),

  // Conversations (1-1)
  getConversations: () => request('GET', '/api/conversations'),
  getMessages: (conversationId, cursor = null, limit = 50) => {
    let url = `/api/messages/conversations/${encodeURIComponent(conversationId)}?limit=${limit}`
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`
    return request('GET', url)
  },
  getConversationStats: (conversationId) =>
    request('GET', `/api/messages/conversations/${encodeURIComponent(conversationId)}/stats`),

  // Groups
  createGroup: (name, memberIds) => request('POST', '/api/groups', { name, memberIds }),
  getGroups: () => request('GET', '/api/groups'),
  getGroup: (groupId) => request('GET', `/api/groups/${groupId}`),
  getGroupMessages: (groupId, page = 0, size = 50) =>
    request('GET', `/api/groups/${groupId}/messages?page=${page}&size=${size}`),
  addGroupMember: (groupId, userId) => request('POST', `/api/groups/${groupId}/members`, { userId }),
  removeGroupMember: (groupId, userId) => request('DELETE', `/api/groups/${groupId}/members/${userId}`)
}
