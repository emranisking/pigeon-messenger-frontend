<script setup>
import { computed, nextTick, ref, watch, onMounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'
import { decorateMessages } from '../../utils/messageGrouping'
import MessageBubble from './MessageBubble.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

const chat = useChatStore()
const auth = useAuthStore()
const containerRef = ref(null)

const decorated = computed(() => decorateMessages(chat.activeMessages, auth.userId))
const isGroupChat = computed(() => !!chat.activeGroupId)
const otherUsername = computed(() => chat.activeOtherUser?.username || '')

function shouldShowAvatar(msg) {
  return !msg.isSent && msg.isLastInGroup
}

function avatarNameFor(msg) {
  return isGroupChat.value ? msg.senderUsername || 'Unknown' : otherUsername.value
}

function shouldShowStatus(msg) {
  return msg.isSent && msg.isLastInGroup && !isGroupChat.value
}

function shouldShowSenderName(msg) {
  return isGroupChat.value && !msg.isSent && msg.isNewGroup
}

function scrollToBottom() {
  nextTick(() => {
    if (containerRef.value) containerRef.value.scrollTop = containerRef.value.scrollHeight
  })
}

// Jump to the newest message whenever we switch conversations/groups.
watch(
  () => chat.activeConversationId || chat.activeGroupId,
  () => scrollToBottom()
)

// Auto-scroll only when the user is already near the bottom (or a new
// message just arrived) - preserves scroll position when older
// messages are prepended via "Load older messages".
watch(
  () => decorated.value.length,
  (newLen, oldLen) => {
    if (!containerRef.value) return
    const el = containerRef.value
    const wasNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (wasNearBottom || newLen > (oldLen || 0)) {
      scrollToBottom()
    }
  }
)

onMounted(scrollToBottom)
</script>

<template>
  <div class="messages-container" ref="containerRef">
    <LoadingSpinner v-if="chat.messagesLoading" />
    <template v-else>
      <div v-if="!isGroupChat && chat.hasMoreForActive" class="load-more-wrap">
        <button class="btn-load-more" type="button" @click="chat.loadOlderMessages">Load older messages</button>
      </div>

      <template v-for="msg in decorated" :key="msg.messageId">
        <div v-if="msg.dateSeparator" class="date-separator">{{ msg.dateSeparator }}</div>
        <MessageBubble
          :message="msg"
          :show-avatar="shouldShowAvatar(msg)"
          :avatar-name="avatarNameFor(msg)"
          :show-status="shouldShowStatus(msg)"
          :other-username="otherUsername"
          :show-sender-name="shouldShowSenderName(msg)"
          :sender-name="msg.senderUsername"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}
.load-more-wrap {
  text-align: center;
  padding: 12px;
}
.btn-load-more {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 20px;
  border-radius: 20px;
}
.btn-load-more:hover {
  background: var(--primary-light);
}
.date-separator {
  text-align: center;
  padding: 16px 0 12px;
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}
</style>
