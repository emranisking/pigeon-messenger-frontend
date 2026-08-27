<script setup>
const model = defineModel({ default: '' })
</script>

<template>
  <div class="sidebar-search">
    <div class="search-input-wrap">
      <span class="search-icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input v-model="model" type="text" class="search-input" placeholder="Search conversations" autocomplete="off" />
    </div>
  </div>
</template>

<style scoped>
.sidebar-search {
  padding: 0 16px 12px;
  flex-shrink: 0;
}
.search-input-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 9px 12px 9px 36px;
  border: none;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
}
.search-input:focus {
  background: var(--bg);
  box-shadow: 0 0 0 2px var(--primary);
}
</style>
