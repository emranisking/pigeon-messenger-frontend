<script setup>
import { computed } from 'vue'
import { formatFullTime } from '../../utils/format'
import { getAvatarColor, getInitial } from '../../utils/avatar'
import Avatar from '../common/Avatar.vue'

const props = defineProps({
  message: { type: Object, required: true },
  showAvatar: { type: Boolean, default: false },
  avatarName: { type: String, default: '?' },
  showStatus: { type: Boolean, default: false },
  otherUsername: { type: String, default: '' },
  showSenderName: { type: Boolean, default: false },
  senderName: { type: String, default: '' }
})

const direction = computed(() => (props.message.isSent ? 'sent' : 'received'))

const statusStyle = computed(() =>
  props.message.status === 'seen' ? { background: getAvatarColor(props.otherUsername) } : {}
)
</script>

<template>
  <div class="message-row" :class="direction">
    <div v-if="!message.isSent" class="avatar-slot">
      <Avatar v-if="showAvatar" :name="avatarName" :size="28" />
    </div>
    <div class="bubble-col">
      <div v-if="showSenderName" class="group-sender-name" :style="{ color: getAvatarColor(senderName) }">
        {{ senderName }}
      </div>
      <div class="message-bubble" :class="[direction, message.bubbleClass]">{{ message.content }}</div>
      <div class="message-time">{{ formatFullTime(message.createdAt) }}</div>
      <div v-if="showStatus" class="message-status">
        <span class="status-icon" :class="message.status" :style="statusStyle">
          <template v-if="message.status === 'seen'">{{ getInitial(otherUsername) }}</template>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 80%;
  margin-bottom: 4px;
  animation: fadeInUp 0.2s ease-out;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.message-row.sent {
  flex-direction: row-reverse;
  align-self: flex-end;
  margin-left: auto;
}
.message-row.received {
  align-self: flex-start;
  margin-right: auto;
}
.avatar-slot {
  width: 28px;
  flex-shrink: 0;
}
.bubble-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.message-row.sent .bubble-col {
  align-items: flex-end;
}
.message-row.received .bubble-col {
  align-items: flex-start;
}

.group-sender-name {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 2px;
  opacity: 0.9;
}

/* Bug fix vs the original: the bubble's max-width was a hardcoded
   280px, which on very small phones (< ~350px wide) forced the
   sidebar/panel wider than the viewport and caused horizontal
   scrolling. min(280px, 68vw) keeps the same desktop size while
   scaling down gracefully on narrow screens. */
.message-bubble {
  display: inline-block;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: min(280px, 68vw);
  min-width: 40px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}
.message-bubble.sent {
  background: var(--msg-sent);
  color: var(--msg-sent-text);
  border-radius: 18px 18px 4px 18px;
}
.message-bubble.sent.first {
  border-radius: 18px 18px 4px 18px;
}
.message-bubble.sent.middle {
  border-radius: 18px 4px 4px 18px;
}
.message-bubble.sent.last {
  border-radius: 18px 4px 18px 18px;
}
.message-bubble.sent.single {
  border-radius: 18px;
}

.message-bubble.received {
  background: var(--msg-received);
  color: var(--msg-received-text);
  border-radius: 18px 18px 18px 4px;
}
.message-bubble.received.first {
  border-radius: 18px 18px 18px 4px;
}
.message-bubble.received.middle {
  border-radius: 4px 18px 18px 4px;
}
.message-bubble.received.last {
  border-radius: 4px 18px 18px 18px;
}
.message-bubble.received.single {
  border-radius: 18px;
}

.message-bubble:hover {
  filter: brightness(0.97);
}

.message-time {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 2px;
  padding: 0 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.message-row:hover .message-time {
  opacity: 1;
}

.message-status {
  display: flex;
  justify-content: flex-end;
  padding: 2px 4px 0;
  height: 16px;
}
.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 7px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
}
.status-icon.sent {
  border: 1.5px solid var(--primary);
  color: var(--primary);
}
.status-icon.sent::before {
  content: '✓';
}
.status-icon.delivered {
  background: var(--primary);
}
.status-icon.delivered::before {
  content: '✓';
}

@media (max-width: 768px) {
  .message-row {
    max-width: 88%;
  }
  .message-bubble {
    max-width: min(280px, 78vw);
  }
}
</style>
