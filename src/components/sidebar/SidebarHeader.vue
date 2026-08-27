<script setup>
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <svg viewBox="0 0 200 200" width="32" height="32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="100" cy="110" rx="35" ry="45" fill="var(--primary)" />
        <circle cx="100" cy="65" r="28" fill="var(--primary)" />
        <circle cx="108" cy="60" r="5" fill="#1a202c" />
        <circle cx="109" cy="58" r="2" fill="white" />
        <path d="M 115 65 L 130 63 L 115 68 Z" fill="#8b7355" />
        <ellipse cx="100" cy="88" rx="42" ry="8" fill="none" stroke="#d4a574" stroke-width="3" />
        <rect x="85" y="82" width="30" height="14" rx="7" fill="#8b7355" stroke="#d4a574" stroke-width="1.5" />
        <rect x="92" y="87" width="6" height="5" rx="1" fill="#d4a574" />
        <line x1="115" y1="89" x2="125" y2="92" stroke="#8b7355" stroke-width="2" />
        <path d="M 125 90 L 128 88 L 125 94 Z" fill="#8b7355" />
        <ellipse cx="70" cy="110" rx="15" ry="30" fill="var(--primary)" opacity="0.8" />
        <ellipse cx="130" cy="110" rx="15" ry="30" fill="var(--primary)" opacity="0.8" />
        <rect x="40" y="145" width="120" height="8" rx="4" fill="#8b7355" stroke="#6b5345" stroke-width="1" />
      </svg>
      <h2>PIGEON</h2>
    </div>
    <div class="sidebar-header-actions">
      <button class="icon-btn" type="button" title="New Message" @click="ui.showNewChatModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button class="icon-btn" type="button" title="New Group" @click="ui.showNewGroupModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sidebar-header {
  padding: 10px 16px;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sidebar-logo h2 {
  font-size: 22px;
  font-weight: 700;
}
.sidebar-header-actions {
  display: flex;
  gap: 8px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover {
  background: var(--border);
}
</style>
