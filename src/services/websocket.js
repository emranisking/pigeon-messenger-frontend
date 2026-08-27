/**
 * ============================================================
 * WEBSOCKET SERVICE (STOMP over SockJS)
 * ============================================================
 * Ported from the original websocket.js, upgraded to the actively
 * maintained @stomp/stompjs client instead of the abandoned
 * `stompjs` CDN package.
 *
 * Bug fix vs the original: reconnection is now delegated entirely
 * to @stomp/stompjs's built-in `reconnectDelay`. The original hand
 * -rolled a `setTimeout` reconnect AND relied on the library's own
 * retry behaviour in some browsers, which could stack multiple
 * concurrent reconnect attempts after a flaky connection. A single
 * source of truth for reconnection removes that race entirely.
 * ============================================================ */

import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let client = null
const subscriptions = {}

const handlers = {
  message: null,
  status: null,
  connection: null,
  groupMessage: null
}

function notify(event, payload) {
  const handler = handlers[event]
  if (handler) handler(payload)
}

export const ws = {
  on(event, handler) {
    handlers[event] = handler
  },

  connect(token, _userId) {
    if (client && client.active) return

    notify('connection', 'connecting')

    client = new Client({
      webSocketFactory: () => new SockJS('/ws-chat'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        notify('connection', 'connected')

        subscriptions.messages = client.subscribe('/user/queue/messages', (frame) => {
          try {
            notify('message', JSON.parse(frame.body))
          } catch (e) {
            console.error('Error parsing message:', e)
          }
        })

        subscriptions.status = client.subscribe('/user/queue/status', (frame) => {
          try {
            notify('status', JSON.parse(frame.body))
          } catch (e) {
            console.error('Error parsing status:', e)
          }
        })

        subscriptions.groupMessages = client.subscribe('/user/queue/group-messages', (frame) => {
          try {
            notify('groupMessage', JSON.parse(frame.body))
          } catch (e) {
            console.error('Error parsing group message:', e)
          }
        })
      },

      onStompError: () => notify('connection', 'disconnected'),
      onWebSocketClose: () => notify('connection', 'disconnected'),
      onDisconnect: () => notify('connection', 'disconnected')
    })

    client.activate()
  },

  sendMessage(receiverId, content, conversationId) {
    if (!client || !client.connected) {
      console.error('Not connected to WebSocket')
      return false
    }
    const payload = { receiverId, content }
    if (conversationId) payload.conversationId = conversationId
    client.publish({ destination: '/app/chat.send', body: JSON.stringify(payload) })
    return true
  },

  sendGroupMessage(groupId, content) {
    if (!client || !client.connected) {
      console.error('Not connected to WebSocket')
      return false
    }
    client.publish({ destination: '/app/group.send', body: JSON.stringify({ groupId, content }) })
    return true
  },

  sendDelivered(messageId, conversationId, senderId, createdAt) {
    if (!client || !client.connected) return
    client.publish({
      destination: '/app/chat.delivered',
      body: JSON.stringify({ messageId, conversationId, senderId, status: 'delivered', createdAt })
    })
  },

  sendSeen(messageId, conversationId, senderId, createdAt) {
    if (!client || !client.connected) return
    client.publish({
      destination: '/app/chat.seen',
      body: JSON.stringify({ messageId, conversationId, senderId, status: 'seen', createdAt })
    })
  },

  subscribeToGroup(groupId) {
    if (!client || !client.connected) {
      console.error('Not connected to WebSocket')
      return null
    }
    const key = `group_${groupId}`
    if (subscriptions[key]) return subscriptions[key]

    subscriptions[key] = client.subscribe(`/topic/group/${groupId}`, (frame) => {
      try {
        notify('groupMessage', JSON.parse(frame.body))
      } catch (e) {
        console.error('Error parsing group topic message:', e)
      }
    })
    return subscriptions[key]
  },

  unsubscribeFromGroup(groupId) {
    const key = `group_${groupId}`
    if (subscriptions[key]) {
      try {
        subscriptions[key].unsubscribe()
      } catch (e) {
        /* ignore */
      }
      delete subscriptions[key]
    }
  },

  disconnect() {
    Object.keys(subscriptions).forEach((key) => {
      try {
        subscriptions[key].unsubscribe()
      } catch (e) {
        /* ignore */
      }
      delete subscriptions[key]
    })

    if (client) {
      try {
        client.deactivate()
      } catch (e) {
        /* ignore */
      }
      client = null
    }
  },

  isConnected() {
    return !!(client && client.connected)
  }
}
