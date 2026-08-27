/**
 * Decorates a flat list of messages with the derived UI state the
 * original renderMessages()/renderGroupMessages() computed inline:
 * bubble rounding class (single/first/middle/last), whether a date
 * separator belongs above this message, and grouping flags used to
 * decide when to show an avatar / sender name.
 *
 * Centralising this in one pure function (instead of duplicating the
 * loop for 1-1 chats and groups like the original did) means the
 * grouping logic only has to be correct in one place.
 */

import { parseTimestamp, formatDateSeparator } from './format'

export function decorateMessages(msgs, currentUserId) {
  const result = []
  let lastSenderId = null
  let lastDateKey = null

  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i]
    const isSent = msg.senderId === currentUserId
    const msgDate = parseTimestamp(msg.createdAt)
    const dateKey = msgDate.toDateString()

    const dateChanged = dateKey !== lastDateKey
    if (dateChanged) {
      lastDateKey = dateKey
      lastSenderId = null
    }

    const sameSenderAsPrev = msg.senderId === lastSenderId
    const next = msgs[i + 1]
    const nextSameSender =
      !!next &&
      next.senderId === msg.senderId &&
      parseTimestamp(next.createdAt).toDateString() === dateKey

    const isNewGroup = !sameSenderAsPrev
    const isLastInGroup = !nextSameSender

    let bubbleClass = 'middle'
    if (isNewGroup && isLastInGroup) bubbleClass = 'single'
    else if (isNewGroup) bubbleClass = 'first'
    else if (isLastInGroup) bubbleClass = 'last'

    result.push({
      ...msg,
      isSent,
      dateSeparator: dateChanged ? formatDateSeparator(msg.createdAt) : null,
      bubbleClass,
      isNewGroup,
      isLastInGroup
    })

    lastSenderId = msg.senderId
  }

  return result
}
