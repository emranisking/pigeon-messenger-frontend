<script setup>
import { computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import Avatar from '../common/Avatar.vue'

const chat = useChatStore()

const title = computed(() => (chat.activeGroup ? chat.activeGroup.name : chat.activeOtherUser?.username || ''))

const status = computed(() => {
  if (chat.activeGroup) {
    const count = chat.activeGroup.members ? chat.activeGroup.members.length : 0
    return `${count} member${count === 1 ? '' : 's'}`
  }
  return 'Active now'
})

const isGroup = computed(() => !!chat.activeGroupId)
</script>

<template>
  <div class="chat-header">
    <button class="btn-back" type="button" title="Back" @click="chat.closeConversation()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15,18 9,12 15,6" />
      </svg>
    </button>
    <Avatar :name="title" :size="40" :is-group="isGroup" />
    <div class="chat-header-info">
      <div class="chat-header-name">{{ title }}</div>
      <div class="chat-header-status">{{ status }}</div>
    </div>
  </div>
</template>

<style scoped>
.chat-header {
  height: var(--header-height);
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-shrink: 0;
}
.chat-header-info {
  flex: 1;
  min-width: 0;
}
.chat-header-name {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-header-status {
  font-size: 12px;
  color: var(--text-tertiary);
}
.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-back:hover {
  background: var(--border);
}

@media (max-width: 768px) {
  .btn-back {
    display: flex;
  }
}
</style>
