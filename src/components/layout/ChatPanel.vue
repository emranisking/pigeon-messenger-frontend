<script setup>
import { useChatStore } from '../../stores/chat'
import ChatEmptyState from '../chat/ChatEmptyState.vue'
import ChatHeader from '../chat/ChatHeader.vue'
import MessageList from '../chat/MessageList.vue'
import ChatInputBar from '../chat/ChatInputBar.vue'

const chat = useChatStore()
</script>

<template>
  <section class="chat-panel" :class="{ 'chat-panel--hidden-mobile': !chat.hasActiveChat }">
    <ChatEmptyState v-if="!chat.hasActiveChat" />
    <template v-else>
      <ChatHeader />
      <MessageList />
      <ChatInputBar />
    </template>
  </section>
</template>

<style scoped>
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
  height: 100%;
}

@media (max-width: 768px) {
  .chat-panel {
    width: 100%;
  }
  .chat-panel--hidden-mobile {
    display: none;
  }
}
</style>
