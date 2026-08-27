<script setup>
import { onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useUiStore } from '../stores/ui'
import Sidebar from '../components/layout/Sidebar.vue'
import ChatPanel from '../components/layout/ChatPanel.vue'
import ConnectionBar from '../components/common/ConnectionBar.vue'
import NewChatModal from '../components/modals/NewChatModal.vue'
import NewGroupModal from '../components/modals/NewGroupModal.vue'

const chat = useChatStore()
const ui = useUiStore()

onMounted(async () => {
  await Promise.all([chat.loadConversations(), chat.loadGroups()])
  chat.connectWebSocket()
})
</script>

<template>
  <div class="messenger">
    <ConnectionBar />
    <div class="messenger-body">
      <Sidebar />
      <ChatPanel />
    </div>

    <NewChatModal v-if="ui.showNewChatModal" @close="ui.showNewChatModal = false" />
    <NewGroupModal v-if="ui.showNewGroupModal" @close="ui.showNewGroupModal = false" />
  </div>
</template>

<style scoped>
.messenger {
  display: flex;
  flex-direction: column;
  /* Bug fix: 100vh on mobile browsers includes the address bar, so the
     input area could end up hidden below the visible viewport when the
     URL bar was showing. 100dvh (dynamic viewport height) tracks the
     browser chrome correctly; svh isn't needed here since we want the
     larger, resize-aware value. */
  height: 100dvh;
  background: var(--bg);
}
.messenger-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

@media (max-width: 768px) {
  .messenger-body {
    flex-direction: column;
  }
}
</style>
