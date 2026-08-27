<script setup>
import { useChatStore } from '../../stores/chat'
const chat = useChatStore()
</script>

<template>
  <div class="sidebar-tabs" role="tablist">
    <button
      role="tab"
      type="button"
      class="tab-btn"
      :aria-selected="chat.currentTab === 'chats'"
      :class="{ active: chat.currentTab === 'chats' }"
      @click="chat.currentTab = 'chats'"
    >
      Chats
    </button>
    <button
      role="tab"
      type="button"
      class="tab-btn"
      :aria-selected="chat.currentTab === 'groups'"
      :class="{ active: chat.currentTab === 'groups' }"
      @click="chat.currentTab = 'groups'"
    >
      Groups
    </button>
  </div>
</template>

<style scoped>
.sidebar-tabs {
  display: flex;
  padding: 0 12px;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  padding: 12px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}
.tab-btn:hover {
  background: var(--bg-hover);
}
.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
</style>
