<script setup>
import { useUserSearch } from '../../composables/useUserSearch'
import { useChatStore } from '../../stores/chat'
import Avatar from '../common/Avatar.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import BaseModal from './BaseModal.vue'

const emit = defineEmits(['close'])
const chat = useChatStore()
const { query, results, loading, search } = useUserSearch()

function pick(user) {
  chat.startConversation(user.id, user.username)
  emit('close')
}
</script>

<template>
  <BaseModal title="New Message" @close="emit('close')">
    <div class="search-field">
      <input
        :value="query"
        type="text"
        placeholder="Search people..."
        autocomplete="off"
        autofocus
        @input="search($event.target.value)"
      />
    </div>

    <div class="user-list">
      <p v-if="!query" class="empty-hint">Type a name to search</p>
      <LoadingSpinner v-else-if="loading" />
      <p v-else-if="results.length === 0" class="empty-hint">No users found</p>
      <button v-for="user in results" :key="user.id" type="button" class="user-row" @click="pick(user)">
        <Avatar :name="user.username" :size="40" />
        <span class="user-row__name">{{ user.username }}</span>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.search-field {
  margin-bottom: 12px;
}
.search-field input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 16px;
  outline: none;
  background: var(--bg);
  color: var(--text-primary);
}
.search-field input:focus {
  border-color: var(--primary);
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  color: var(--text-primary);
}
.user-row:hover {
  background: var(--bg-hover);
}
.user-row__name {
  font-size: 15px;
  font-weight: 500;
}
.empty-hint {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
