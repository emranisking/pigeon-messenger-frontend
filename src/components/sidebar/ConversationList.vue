<script setup>
import { computed, ref } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'
import { formatTime, truncate } from '../../utils/format'
import ConversationItem from './ConversationItem.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import SidebarSearch from './SidebarSearch.vue'

const chat = useChatStore()
const auth = useAuthStore()
const searchText = ref('')

const filteredConversations = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return chat.sortedConversations
  return chat.sortedConversations.filter((c) => (c.otherUser?.username || '').toLowerCase().includes(q))
})

const filteredGroups = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return chat.sortedGroups
  return chat.sortedGroups.filter((g) => (g.name || '').toLowerCase().includes(q))
})

function preview(conv) {
  if (!conv.lastMessage) return ''
  const prefix = conv.lastMessage.senderId === auth.userId ? 'You: ' : ''
  return prefix + truncate(conv.lastMessage.content, 30)
}

function convUnread(conv) {
  return !!conv.lastMessage && conv.lastMessage.senderId !== auth.userId && conv.lastMessage.status !== 'seen'
}

function groupPreview(group) {
  if (group.lastMessage) {
    const senderName = group.lastMessage.senderUsername || 'Someone'
    return `${senderName}: ${truncate(group.lastMessage.content, 25)}`
  }
  const count = group.members ? group.members.length : 0
  return `${count} member${count === 1 ? '' : 's'}`
}

function openConversation(conv) {
  chat.openConversation(conv.conversationId, conv.otherUser?.id, conv.otherUser?.username)
}

function openGroup(group) {
  chat.openGroup(group.id)
}
</script>

<template>
  <div class="list-wrap">
    <SidebarSearch v-model="searchText" />

    <div v-if="chat.currentTab === 'chats'" class="list">
      <LoadingSpinner v-if="chat.conversationsLoading" />
      <p v-else-if="filteredConversations.length === 0" class="empty-list">
        {{ searchText ? 'No matches found' : 'No conversations yet. Start one!' }}
      </p>
      <ConversationItem
        v-for="conv in filteredConversations"
        :key="conv.conversationId"
        :name="conv.otherUser?.username || 'Unknown'"
        :preview="preview(conv)"
        :time="conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''"
        :unread="convUnread(conv)"
        :active="chat.activeConversationId === conv.conversationId"
        @click="openConversation(conv)"
      />
    </div>

    <div v-else class="list">
      <p v-if="filteredGroups.length === 0" class="empty-list">
        {{ searchText ? 'No matches found' : 'No groups yet. Create one to get started!' }}
      </p>
      <ConversationItem
        v-for="group in filteredGroups"
        :key="group.id"
        :name="group.name"
        :preview="groupPreview(group)"
        :time="group.lastMessage ? formatTime(group.lastMessage.createdAt) : ''"
        :unread="false"
        :active="chat.activeGroupId === group.id"
        is-group
        @click="openGroup(group)"
      />
    </div>
  </div>
</template>

<style scoped>
.list-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
  min-height: 0;
}
.empty-list {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
