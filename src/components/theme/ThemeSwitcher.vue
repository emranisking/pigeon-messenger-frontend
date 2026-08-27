<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTheme } from '../../composables/useTheme'

const { mode, accent, accents, setMode, setAccent } = useTheme()
const open = ref(false)
const rootEl = ref(null)

function toggle() {
  open.value = !open.value
}

function onClickOutside(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) open.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="theme-switcher" ref="rootEl">
    <button class="icon-btn" type="button" aria-label="Theme settings" title="Theme" @click="toggle">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>

    <div v-if="open" class="theme-popover" role="menu">
      <p class="theme-popover__label">Appearance</p>
      <div class="mode-row">
        <button
          v-for="m in ['light', 'dark', 'system']"
          :key="m"
          type="button"
          class="mode-btn"
          :class="{ active: mode === m }"
          @click="setMode(m)"
        >
          {{ m.charAt(0).toUpperCase() + m.slice(1) }}
        </button>
      </div>

      <p class="theme-popover__label">Accent color</p>
      <div class="accent-row">
        <button
          v-for="(palette, key) in accents"
          :key="key"
          type="button"
          class="accent-swatch"
          :class="{ active: accent === key }"
          :style="{ background: palette.primary }"
          :aria-label="palette.label"
          :title="palette.label"
          @click="setAccent(key)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-switcher {
  position: relative;
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
.theme-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 12px;
  width: 220px;
  z-index: 50;
}
.theme-popover__label {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 600;
  margin: 8px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.theme-popover__label:first-child {
  margin-top: 0;
}
.mode-row {
  display: flex;
  gap: 6px;
}
.mode-btn {
  flex: 1;
  padding: 6px 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}
.mode-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.accent-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.accent-swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.accent-swatch.active {
  border-color: var(--text-primary);
}

@media (max-width: 480px) {
  .theme-popover {
    right: -8px;
    width: 200px;
  }
}
</style>
