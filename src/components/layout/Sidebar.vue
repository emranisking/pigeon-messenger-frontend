<script setup>
import { useChatStore } from '../../stores/chat'
import SidebarHeader from '../sidebar/SidebarHeader.vue'
import SidebarTabs from '../sidebar/SidebarTabs.vue'
import ConversationList from '../sidebar/ConversationList.vue'
import SidebarUserBar from '../sidebar/SidebarUserBar.vue'

const chat = useChatStore()
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--hidden-mobile': chat.hasActiveChat }">
    <SidebarHeader />
    <SidebarTabs />
    <ConversationList />
    <SidebarUserBar />
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg);
  flex-shrink: 1;
  min-width: 0;
  height: 100%;
}

/* Bug fix vs the original: the vanilla app toggled a "hidden" class
   imperatively via `window.innerWidth` checks inside JS click
   handlers. That state never re-evaluated on window resize, so
   rotating a tablet or resizing a browser window while a chat was
   open could leave the sidebar permanently hidden even back on a
   desktop-width viewport. Driving the swap purely from CSS media
   queries means it's always in sync with the actual viewport. */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    border-right: none;
  }
  .sidebar--hidden-mobile {
    display: none;
  }
}
</style>
