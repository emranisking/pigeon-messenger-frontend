<script setup>
import Avatar from '../common/Avatar.vue'

defineProps({
  name: { type: String, default: '' },
  preview: { type: String, default: '' },
  time: { type: String, default: '' },
  unread: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  isGroup: { type: Boolean, default: false }
})
defineEmits(['click'])
</script>

<template>
  <button type="button" class="conversation-item" :class="{ active }" @click="$emit('click')">
    <Avatar :name="name" :size="48" :is-group="isGroup" />
    <div class="conversation-info">
      <div class="conversation-name" :class="{ unread }">{{ name }}</div>
      <div v-if="preview" class="conversation-preview" :class="{ unread }">{{ preview }}</div>
    </div>
    <div class="conversation-meta">
      <div v-if="time" class="conversation-time">{{ time }}</div>
      <div v-if="unread" class="unread-badge" aria-label="Unread" />
    </div>
  </button>
</template>

<style scoped>
.conversation-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  gap: 12px;
  border: none;
  background: none;
  text-align: left;
  color: inherit;
}
.conversation-item:hover {
  background: var(--bg-hover);
}
.conversation-item.active {
  background: var(--bg-active);
}
.conversation-info {
  flex: 1;
  min-width: 0;
}
.conversation-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conversation-name.unread {
  font-weight: 700;
}
.conversation-preview {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conversation-preview.unread {
  color: var(--text-primary);
  font-weight: 600;
}
.conversation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.conversation-time {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
}
.unread-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary);
}
</style>
