<script setup>
import { useUiStore } from '../../stores/ui'
const ui = useUiStore()
</script>

<template>
  <div class="toast-stack" role="status" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
        role="button"
        tabindex="0"
        @click="ui.dismissToast(t.id)"
      >
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}
.toast {
  background: var(--text-primary);
  color: var(--bg);
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  text-align: center;
  pointer-events: auto;
}
.toast.error {
  background: var(--danger);
  color: #fff;
}
.toast.success {
  background: var(--online);
  color: #fff;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
