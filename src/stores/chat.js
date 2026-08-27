/**
 * ============================================================
 * CHAT STORE
 * ============================================================
 * Ported from the original app.js IIFE module-level state
 * (conversations, groups, messages, groupMessages, cursors, active
 * selection, etc.) into a reactive Pinia store.
 *
 * Notable bug fixes made during the port (see README for the full
 * list):
 *  - The document-title "new message" flasher captured the WRONG
 *    "original" title if a second message arrived before the first
 *    flash finished reverting, permanently stranding the tab title
 *    at "New Message!". Fixed by capturing the true title once at
 *    module load and always reverting to that.
 *  - Logging out no longer relies on a full page reload to clear
 *    stale state (the original always hard-redirected on logout, so
 *    it never had to clean up in-memory state itself). Since this
 *    SPA does NOT reload on logout, `reset()` explicitly clears
 *    every piece of chat state so a second account logging in on the
 *    same tab never sees the previous user's messages.
 * ============================================================
 */

import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { api } from '../services/api'
import { ws } from '../services/websocket'
import { useAuthStore } from './auth'
import { useUiStore } from './ui'
import { parseTimestamp } from '../utils/format'

const BASE_TITLE = typeof document !== 'undefined' ? document.title : 'Pigeon Messenger'
let titleFlashTimer = null

function flashNewMessageTitle() {
  if (typeof document === 'undefined') return
  document.title = '💬 New Message!'
  clearTimeout(titleFlashTimer)
  titleFlashTimer = setTimeout(() => {
    document.title = BASE_TITLE
  }, 3000)
}

export const useChatStore = defineStore('chat', () => {
  const auth = useAuthStore()
  const ui = useUiStore()

  // ---------------- State ----------------
  const conversations = ref([])
  const groups = ref([])
  const messages = reactive({}) // { [conversationId]: Message[] }
  const groupMessages = reactive({}) // { [groupId]: Message[] }
  const nextCursor = reactive({})
  const hasMore = reactive({})
  const userCache = reactive({})

  const activeConversationId = ref(null)
  const activeGroupId = ref(null)
  const activeOtherUser = ref(null)
  const currentTab = ref('chats') // 'chats' | 'groups'

  const conversationsLoading = ref(true)
  const messagesLoading = ref(false)

  const deliveredMessages = new Set()
  const seenMessages = new Set()

  // ---------------- Getters ----------------
  const sortedConversations = computed(() =>
    [...conversations.value].sort((a, b) => {
      const ta = a.lastMessage ? parseTimestamp(a.lastMessage.createdAt) : parseTimestamp(a.createdAt)
      const tb = b.lastMessage ? parseTimestamp(b.lastMessage.createdAt) : parseTimestamp(b.createdAt)
      return tb - ta
    })
  )

  const sortedGroups = computed(() =>
    [...groups.value].sort((a, b) => {
      const ta = a.lastMessage ? parseTimestamp(a.lastMessage.createdAt) : parseTimestamp(a.createdAt)
      const tb = b.lastMessage ? parseTimestamp(b.lastMessage.createdAt) : parseTimestamp(b.createdAt)
      return tb - ta
    })
  )

  const activeConversation = computed(
    () => conversations.value.find((c) => c.conversationId === activeConversationId.value) || null
  )
  const activeGroup = computed(() => groups.value.find((g) => g.id === activeGroupId.value) || null)

  const activeMessages = computed(() => {
    if (activeGroupId.value) return groupMessages[activeGroupId.value] || []
    const key = activeConversationId.value || '_pending_conv'
    return messages[key] || []
  })

  const hasActiveChat = computed(
    () => !!activeConversationId.value || !!activeGroupId.value || !!activeOtherUser.value
  )

  const hasMoreForActive = computed(() => {
    if (activeGroupId.value) return false
    return activeConversationId.value ? !!hasMore[activeConversationId.value] : false
  })

  // ---------------- Conversations ----------------
  async function loadConversations() {
    conversationsLoading.value = true
    try {
      const data = await api.getConversations()
      conversations.value = data || []
      conversations.value.forEach((c) => {
        if (c.otherUser) userCache[c.otherUser.id] = c.otherUser
      })
    } catch (err) {
      console.error('Failed to load conversations:', err)
      ui.pushToast('Could not load conversations', 'error')
    } finally {
      conversationsLoading.value = false
    }
  }

  async function loadGroups() {
    try {
      const data = await api.getGroups()
      groups.value = data || []
    } catch (err) {
      console.error('Failed to load groups:', err)
      ui.pushToast('Could not load groups', 'error')
    }
  }

  async function openConversation(conversationId, otherUserId, otherUsername) {
    activeGroupId.value = null
    activeConversationId.value = conversationId
    activeOtherUser.value = { id: otherUserId, username: otherUsername }
    userCache[otherUserId] = activeOtherUser.value

    if (!messages[conversationId]) {
      messages[conversationId] = []
      nextCursor[conversationId] = null
      hasMore[conversationId] = true
      await loadMessages(conversationId)
    }

    markMessagesAsSeen(conversationId)
  }

  function closeConversation() {
    activeConversationId.value = null
    activeGroupId.value = null
    activeOtherUser.value = null
  }

  async function loadMessages(conversationId, prepend = false) {
    messagesLoading.value = !prepend
    try {
      const cursor = prepend ? nextCursor[conversationId] : null
      const data = await api.getMessages(conversationId, cursor, 50)

      if (data && data.messages) {
        const newMsgs = [...data.messages].reverse()
        messages[conversationId] = prepend
          ? [...newMsgs, ...(messages[conversationId] || [])]
          : newMsgs
        nextCursor[conversationId] = data.nextCursor || null
        hasMore[conversationId] = !!data.hasMore
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
      ui.pushToast('Could not load messages', 'error')
    } finally {
      messagesLoading.value = false
    }
  }

  function loadOlderMessages() {
    if (activeConversationId.value && hasMore[activeConversationId.value]) {
      loadMessages(activeConversationId.value, true)
    }
  }

  // ---------------- Sending ----------------
  function sendMessage(content) {
    if (activeGroupId.value) {
      return sendGroupMessage(content)
    }
    if (!content || !activeOtherUser.value) return false

    const ok = ws.sendMessage(activeOtherUser.value.id, content, activeConversationId.value)
    if (ok) {
      const convId = activeConversationId.value || '_pending_conv'
      const tempMsg = {
        messageId: `_pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        conversationId: convId,
        senderId: auth.userId,
        receiverId: activeOtherUser.value.id,
        content,
        status: 'sent',
        createdAt: new Date().toISOString(),
        _pending: true
      }
      if (!messages[convId]) messages[convId] = []
      messages[convId].push(tempMsg)
    }
    return ok
  }

  function sendGroupMessage(content) {
    if (!content || !activeGroupId.value) return false
    const ok = ws.sendGroupMessage(activeGroupId.value, content)
    if (ok) {
      const tempMsg = {
        messageId: `_pending_${Date.now()}`,
        groupId: activeGroupId.value,
        senderId: auth.userId,
        senderUsername: auth.username,
        content,
        createdAt: new Date().toISOString(),
        _pending: true
      }
      if (!groupMessages[activeGroupId.value]) groupMessages[activeGroupId.value] = []
      groupMessages[activeGroupId.value].push(tempMsg)
    }
    return ok
  }

  // ---------------- Status (delivered / seen) ----------------
  function markMessagesAsSeen(conversationId) {
    const msgs = messages[conversationId] || []
    msgs.forEach((msg) => {
      if (msg.senderId !== auth.userId && msg.status !== 'seen') {
        if (!seenMessages.has(msg.messageId)) {
          seenMessages.add(msg.messageId)
          ws.sendSeen(msg.messageId, msg.conversationId, msg.senderId, msg.createdAt)
          msg.status = 'seen'
        }
      }
    })
  }

  function markMessageDelivered(msg) {
    if (!deliveredMessages.has(msg.messageId)) {
      deliveredMessages.add(msg.messageId)
      ws.sendDelivered(msg.messageId, msg.conversationId, msg.senderId, msg.createdAt)
    }
  }

  // ---------------- Incoming WS events ----------------
  function removePendingDuplicate(list, msg) {
    const idx = list.findIndex((m) => m._pending && m.senderId === msg.senderId && m.content === msg.content)
    if (idx !== -1) list.splice(idx, 1)
  }

  function handleIncomingMessage(msg) {
    const convId = msg.conversationId
    const isSent = msg.senderId === auth.userId

    if (!messages[convId]) messages[convId] = []

    const exists = messages[convId].some((m) => m.messageId === msg.messageId)
    if (!exists) {
      if (isSent) {
        removePendingDuplicate(messages[convId], msg)
        if (messages['_pending_conv']) {
          removePendingDuplicate(messages['_pending_conv'], msg)
          if (messages['_pending_conv'].length === 0) delete messages['_pending_conv']
        }
      }
      messages[convId].push(msg)
    }

    updateConversationInList(msg)

    if (!activeConversationId.value && activeOtherUser.value) {
      const otherUserId = isSent ? msg.receiverId : msg.senderId
      if (otherUserId === activeOtherUser.value.id) {
        activeConversationId.value = convId
        nextCursor[convId] = null
        hasMore[convId] = false
      }
    }

    if (activeConversationId.value === convId) {
      if (!isSent) {
        markMessageDelivered(msg)
        setTimeout(() => {
          if (!seenMessages.has(msg.messageId)) {
            seenMessages.add(msg.messageId)
            ws.sendSeen(msg.messageId, msg.conversationId, msg.senderId, msg.createdAt)
            msg.status = 'seen'
          }
        }, 500)
      }
    } else if (!isSent) {
      markMessageDelivered(msg)
      flashNewMessageTitle()
    }
  }

  function handleStatusUpdate(event) {
    const convId = event.conversationId
    const list = messages[convId]

    if (list) {
      list.forEach((msg) => {
        if (msg.messageId === event.messageId) msg.status = event.status
      })
      if (event.status === 'seen') {
        list.forEach((msg) => {
          if (msg.senderId === auth.userId && (msg.status === 'sent' || msg.status === 'delivered')) {
            msg.status = 'seen'
          }
        })
      }
    }

    const conv = conversations.value.find((c) => c.conversationId === convId)
    if (conv && conv.lastMessage) conv.lastMessage.status = event.status
  }

  function updateConversationInList(msg) {
    const convId = msg.conversationId
    const otherUserId = msg.senderId === auth.userId ? msg.receiverId : msg.senderId
    let conv = conversations.value.find((c) => c.conversationId === convId)

    const lastMessage = {
      content: msg.content,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      status: msg.status,
      messageId: msg.messageId
    }

    if (conv) {
      conv.lastMessage = lastMessage
    } else {
      const cachedUser = userCache[otherUserId]
      conv = {
        conversationId: convId,
        otherUser: cachedUser || { id: otherUserId, username: 'User' },
        lastMessage
      }
      conversations.value.push(conv)

      if (!cachedUser) {
        api
          .getUser(otherUserId)
          .then((user) => {
            if (user) {
              userCache[otherUserId] = user
              conv.otherUser = user
            }
          })
          .catch(() => {})
      }
    }
  }

  // ---------------- Groups ----------------
  async function openGroup(groupId) {
    activeConversationId.value = null
    activeOtherUser.value = null
    activeGroupId.value = groupId

    if (!groupMessages[groupId]) {
      groupMessages[groupId] = []
      await loadGroupMessages(groupId)
    }

    ws.subscribeToGroup(groupId)
  }

  async function loadGroupMessages(groupId, page = 0) {
    messagesLoading.value = page === 0
    try {
      const data = await api.getGroupMessages(groupId, page, 50)
      if (data) {
        const newMsgs = [...data].reverse()
        groupMessages[groupId] = page === 0 ? newMsgs : [...newMsgs, ...(groupMessages[groupId] || [])]
      }
    } catch (err) {
      console.error('Failed to load group messages:', err)
      ui.pushToast('Could not load group messages', 'error')
    } finally {
      messagesLoading.value = false
    }
  }

  async function createGroup(name, memberIds) {
    const group = await api.createGroup(name, memberIds)
    groups.value.unshift(group)
    await openGroup(group.id)
    currentTab.value = 'groups'
    return group
  }

  function handleGroupMessage(msg) {
    const groupId = msg.groupId
    if (!groupMessages[groupId]) groupMessages[groupId] = []

    const pendingIdx = groupMessages[groupId].findIndex(
      (m) => m._pending && m.senderId === msg.senderId && m.content === msg.content
    )
    if (pendingIdx !== -1) {
      groupMessages[groupId].splice(pendingIdx, 1, msg)
    } else {
      const exists = groupMessages[groupId].some((m) => m.messageId === msg.messageId)
      if (!exists) groupMessages[groupId].push(msg)
    }

    const group = groups.value.find((g) => g.id === groupId)
    if (group) group.lastMessage = msg

    if (activeGroupId.value !== groupId) flashNewMessageTitle()
  }

  // ---------------- New (unsaved) conversation ----------------
  async function startConversation(otherUserId, otherUsername) {
    userCache[otherUserId] = { id: otherUserId, username: otherUsername }

    const existing = conversations.value.find((c) => c.otherUser && c.otherUser.id === otherUserId)
    if (existing) {
      await openConversation(existing.conversationId, otherUserId, otherUsername)
      return
    }

    activeConversationId.value = null
    activeGroupId.value = null
    activeOtherUser.value = { id: otherUserId, username: otherUsername }
    messages['_pending_conv'] = []
  }

  // ---------------- WebSocket wiring ----------------
  function connectWebSocket() {
    ws.on('connection', (state) => ui.setConnectionStatus(state))
    ws.on('message', handleIncomingMessage)
    ws.on('status', handleStatusUpdate)
    ws.on('groupMessage', handleGroupMessage)
    ws.connect(auth.token, auth.userId)
  }

  function reset() {
    conversations.value = []
    groups.value = []
    Object.keys(messages).forEach((k) => delete messages[k])
    Object.keys(groupMessages).forEach((k) => delete groupMessages[k])
    Object.keys(userCache).forEach((k) => delete userCache[k])
    Object.keys(nextCursor).forEach((k) => delete nextCursor[k])
    Object.keys(hasMore).forEach((k) => delete hasMore[k])
    activeConversationId.value = null
    activeGroupId.value = null
    activeOtherUser.value = null
    currentTab.value = 'chats'
    deliveredMessages.clear()
    seenMessages.clear()
    ws.disconnect()
  }

  return {
    conversations,
    groups,
    messages,
    groupMessages,
    userCache,
    activeConversationId,
    activeGroupId,
    activeOtherUser,
    currentTab,
    conversationsLoading,
    messagesLoading,
    sortedConversations,
    sortedGroups,
    activeConversation,
    activeGroup,
    activeMessages,
    hasActiveChat,
    hasMoreForActive,
    loadConversations,
    loadGroups,
    openConversation,
    closeConversation,
    loadMessages,
    loadOlderMessages,
    sendMessage,
    sendGroupMessage,
    openGroup,
    loadGroupMessages,
    createGroup,
    startConversation,
    connectWebSocket,
    reset
  }
})
