<script setup>
import { ref, computed } from 'vue'
import { useUserSearch } from '../../composables/useUserSearch'
import { useChatStore } from '../../stores/chat'
import { useUiStore } from '../../stores/ui'
import Avatar from '../common/Avatar.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import BaseModal from './BaseModal.vue'

const emit = defineEmits(['close'])
const chat = useChatStore()
const ui = useUiStore()
const { query, results, loading, search } = useUserSearch()

const groupName = ref('')
const selectedMembers = ref([])
const creating = ref(false)

const canCreate = computed(
  () => groupName.value.trim().length > 0 && selectedMembers.value.length > 0 && !creating.value
)

function isSelected(user) {
  return selectedMembers.value.some((m) => m.id === user.id)
}

function toggleMember(user) {
  if (isSelected(user)) {
    selectedMembers.value = selectedMembers.value.filter((m) => m.id !== user.id)
  } else {
    selectedMembers.value.push({ id: user.id, username: user.username })
  }
}

function removeMember(id) {
  selectedMembers.value = selectedMembers.value.filter((m) => m.id !== id)
}

async function handleCreate() {
  if (!canCreate.value) return
  creating.value = true
  try {
    await chat.createGroup(
      groupName.value.trim(),
      selectedMembers.value.map((m) => m.id)
    )
    emit('close')
  } catch (err) {
    // Bug fix vs the original: a blocking alert() froze the whole tab
    // and looked broken on mobile. A dismissible toast is much less
    // disruptive and matches how every other error in the app is shown.
    ui.pushToast(err.message || 'Failed to create group', 'error')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <BaseModal title="Create Group" @close="emit('close')">
    <div class="search-field">
      <input v-model="groupName" type="text" placeholder="Group name" autocomplete="off" />
    </div>
    <div class="search-field">
      <input
        :value="query"
        type="text"
        placeholder="Search people to add..."
        autocomplete="off"
        @input="search($event.target.value)"
      />
    </div>

    <div v-if="selectedMembers.length" class="chips">
      <span v-for="m in selectedMembers" :key="m.id" class="chip">
        {{ m.username }}
        <button type="button" class="chip__remove" aria-label="Remove" @click="removeMember(m.id)">&times;</button>
      </span>
    </div>

    <div class="user-list">
      <p v-if="!query" class="empty-hint">Type a name to search</p>
      <LoadingSpinner v-else-if="loading" />
      <p v-else-if="results.length === 0" class="empty-hint">No users found</p>
      <button
        v-for="user in results"
        :key="user.id"
        type="button"
        class="user-row"
        :class="{ 'user-row--selected': isSelected(user) }"
        @click="toggleMember(user)"
      >
        <Avatar :name="user.username" :size="40" />
        <span class="user-row__name">{{ user.username }}</span>
        <span v-if="isSelected(user)" class="user-row__check" aria-hidden="true">✓</span>
      </button>
    </div>

    <button class="btn-primary" type="button" :disabled="!canCreate" @click="handleCreate">
      {{ creating ? 'Creating…' : 'Create Group' }}
    </button>
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
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--primary-light);
  color: var(--primary);
  padding: 6px 10px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  font-weight: 500;
}
.chip__remove {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-weight: bold;
  opacity: 0.7;
}
.chip__remove:hover {
  opacity: 1;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
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
.user-row--selected {
  background: var(--bg-active);
}
.user-row__name {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
}
.user-row__check {
  color: var(--primary);
  font-weight: 700;
}
.empty-hint {
  padding: 20px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 14px;
}
.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}
.btn-primary:disabled {
  background: var(--border);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
</style>
