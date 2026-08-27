<script setup>
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import Avatar from '../common/Avatar.vue'
import ThemeSwitcher from '../theme/ThemeSwitcher.vue'

const auth = useAuthStore()
const chat = useChatStore()

function logout() {
  chat.reset()
  auth.logout()
}
</script>

<template>
  <div class="sidebar-user">
    <Avatar :name="auth.username || ''" :size="36" />
    <span class="sidebar-user-name">{{ auth.username }}</span>
    <ThemeSwitcher />
    <button class="btn-logout" type="button" title="Log out" @click="logout">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.sidebar-user {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.sidebar-user-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-logout {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-logout:hover {
  background: var(--bg-secondary);
  color: var(--danger);
}
</style>
